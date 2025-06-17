from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.serializer import (
    PermisoSerializer,
    UserSerializer,
    PersonaSerializer,
    
)
from api.models import Permiso, Persona
from Roles.roles import (
    EsDirector,
    EsProfesor,
    EsAdministrador,
    EsTutor,
    ControlarRoles,
)


from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ParametrosCobros, SaldoCuotas, CobroCuotaInfante
from .serializers import ParametrosCobrosSerializer, SaldoCuotasSerializer, CobroCuotaInfanteSerializer
from datetime import date, timedelta
from calendar import monthrange
from apps.educativo.models import Infante
from django.db import IntegrityError
from decimal import Decimal

from django.template.loader import get_template
from xhtml2pdf import pisa
from django.http import HttpResponse
from django.db.models import Sum, F, DecimalField, ExpressionWrapper


# View para los parámetros
@permission_classes([AllowAny])
class ParametrosCobrosView(viewsets.ModelViewSet):
    queryset = ParametrosCobros.objects.all()
    serializer_class = ParametrosCobrosSerializer


# View para los saldos de las cuotas
@permission_classes([AllowAny])
class SaldoCuotasView(viewsets.ModelViewSet):
    queryset = SaldoCuotas.objects.all()
    serializer_class = SaldoCuotasSerializer



@api_view(["POST"])
@permission_classes([AllowAny])
# Función para generar las cuotas de un infante basado en los parámetros
def generar_cuotas(request):
        id_infante = request.data.get("id_infante")

        # Se valida que se tenga un id del infante
        if not id_infante:
            return Response({"Error:": "Se requiere seleccionar un infante para generar las cuotas"}, status=400)
        
        try: 
            infante = Infante.objects.get(id = id_infante)

            # Se valida que exista el infante
        except Infante.DoesNotExist:
            return Response({"Error": "El infante no se encuentra en la base de datos"}, status=404)
        
        # Se obtienen los parámetros
        parametros = ParametrosCobros.objects.filter(estado=True).first()
        
        # Se validan que existan parámetros activos
        if not parametros:
            return Response({"Error": "No existen parámetros activos para la generación de las cuotas"}, status=400)
        
        # Se obtiene la fecha actual
        hoy = date.today()
        c_generadas = [] # Lista vacía para las cuotas
        num = 1 # Para el número de cuotas

        for mes in range(parametros.mes_inicio, parametros.mes_fin + 1):
            if SaldoCuotas.objects.filter(id_infante = infante, anho= parametros.anho, mes = mes).exists():
                continue

            dia_vencimiento = min(parametros.dia_limite_pago, monthrange(parametros.anho, mes)[1])
            fecha_vencimiento = date(parametros.anho, mes, dia_vencimiento)

            try:
                cuota = SaldoCuotas.objects.create(
                    id_infante = infante,
                    anho = parametros.anho,
                    mes = mes,
                    fecha_vencimiento = fecha_vencimiento,
                    nro_cuota = num,
                    monto_cuota = parametros.monto_cuota,
                    monto_mora = 0,
                    monto_total = parametros.monto_cuota,
                    saldo = parametros.monto_cuota,
                )
                c_generadas.append(cuota)

            except IntegrityError as e:
                print(f"Cuota duplicada para {infante} {mes}/{parametros.anho}")
                continue
            num = num + 1

        serializer = SaldoCuotasSerializer(c_generadas, many= True)

        if not c_generadas:
            return Response({"detalle": "No se generaron nuevas cuotas. Ya existen para el infante."}, status=200)

        return Response(serializer.data, status=201)
    
# View para obtener cuotas por infante
@permission_classes([AllowAny])
class CuotasPorInfanteView(viewsets.ModelViewSet):
    serializer_class = SaldoCuotasSerializer

    # Se obtiene las cuotas por infante
    def get_queryset(self):
        infante = self.kwargs['id_infante']
        return SaldoCuotas.objects.filter(id_infante = infante)



@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_cobro_cuota(request):
    cuota_id = request.data.get("cuota_id")
    monto_cobrado = request.data.get("monto_cobrado")
    fecha_cobro = request.data.get("fecha_cobro")  # formato: 'YYYY-MM-DD'

    if not all([cuota_id, monto_cobrado, fecha_cobro]):
        return Response({"error": "cuota_id, monto_cobrado y fecha_cobro son requeridos"}, status=400)

    try:
        cuota = SaldoCuotas.objects.get(id=cuota_id)
    except SaldoCuotas.DoesNotExist:
        return Response({"error": "Cuota no encontrada"}, status=404)

    parametros = ParametrosCobros.objects.filter(estado=True).first()
    if not parametros:
        return Response({"error": "No hay parámetros activos para los cálculos"}, status=400)

    # Calcular fecha límite con días de gracia
    fecha_cobro_dt = date.fromisoformat(fecha_cobro)
    fecha_limite_sin_mora = cuota.fecha_vencimiento + timedelta(days=parametros.dias_gracia)

    # Calcular mora si corresponde
    mora = 0
    if fecha_cobro_dt > fecha_limite_sin_mora:
        dias_mora = (fecha_cobro_dt - fecha_limite_sin_mora).days
        mora = dias_mora * parametros.mora_por_dia

    # Actualizar saldo y estado de la cuota
    total_cobrado = Decimal(monto_cobrado) + Decimal(mora)
    cuota.monto_mora = mora
    cuota.monto_total = cuota.monto_cuota + mora
    cuota.saldo = max(Decimal("0.00"), cuota.monto_total - Decimal(monto_cobrado))
    cuota.fecha_pago = fecha_cobro_dt
    cuota.estado = cuota.saldo == 0
    cuota.save()

    # Registrar el cobro
    cobro = CobroCuotaInfante.objects.create(
        cuota=cuota,
        fecha_cobro=fecha_cobro_dt,
        monto_cobrado=monto_cobrado,
        total_cobrado = total_cobrado,
        observacion=f"Cobro con mora de {mora}" if mora > 0 else "Cobro sin mora"
    )

    serializer = CobroCuotaInfanteSerializer(cobro)
    return Response(serializer.data, status=201)


@permission_classes([AllowAny])
def generar_pdf_resumen_cobros(request, id_infante):
    try:
        infante = Infante.objects.get(id=id_infante)
    except Infante.DoesNotExist:
        return HttpResponse("Infante no encontrado", status=404)

    parametros = ParametrosCobros.objects.filter(estado=True).first()
    if not parametros:
        return HttpResponse("No hay parámetros activos", status=400)

    hoy = date.today()
    resumen = []

    total_cuota = 0
    total_mora_calculada = 0
    total_mora_original = 0
    total_pagado = 0
    cuotas_pagadas = 0
    cuotas_pendientes = 0

    cuotas = SaldoCuotas.objects.filter(id_infante=infante).order_by("anho", "mes")

    for cuota in cuotas:
        vencimiento_con_gracia = cuota.fecha_vencimiento + timedelta(days=parametros.dias_gracia)

        if not cuota.estado and hoy > vencimiento_con_gracia:
            dias_mora = (hoy - vencimiento_con_gracia).days
            mora_calculada = dias_mora * parametros.mora_por_dia
        else:
            mora_calculada = 0

        if cuota.estado:
            total_pagado_item = cuota.monto_cuota + cuota.monto_mora
        else:
            total_pagado_item = cuota.monto_cuota + mora_calculada

        resumen.append({
            "anho": cuota.anho,
            "mes": cuota.mes,
            "total_cuota": cuota.monto_cuota,
            "monto_mora_original": cuota.monto_mora,
            "monto_mora_calculada": mora_calculada,
            "total_pagado": total_pagado_item,
            "pagada": cuota.estado,
            "fecha_vencimiento": cuota.fecha_vencimiento,
        })

        total_cuota += cuota.monto_cuota
        total_mora_original += cuota.monto_mora
        total_mora_calculada += mora_calculada
        total_pagado += total_pagado_item
        if cuota.estado:
            cuotas_pagadas += 1
        else:
            cuotas_pendientes += 1


    context = {
        "infante": infante,
        "resumen": resumen,
        "fecha_actual": hoy,
        "total_cuota": total_cuota,
        "total_mora_original": total_mora_original,
        "total_mora_calculada": total_mora_calculada,
        "total_pagado": total_pagado,
        "cuotas_pagadas": cuotas_pagadas,
        "cuotas_pendientes": cuotas_pendientes,
    }

    template = get_template("cobros/resumen_cobros.html")
    html = template.render(context)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="resumen_cobros_{infante.id}.pdf"'

    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse("Error al generar PDF", status=500)
    return response


# View para front, consulta por docente/funcionario
@api_view(["GET"])
@permission_classes([AllowAny])
def resumen_cobros_json(request, id_infante):
    try:
        infante = Infante.objects.get(id=id_infante)
    except Infante.DoesNotExist:
        return Response({"error": "Infante no encontrado"}, status=404)

    parametros = ParametrosCobros.objects.filter(estado=True).first()
    if not parametros:
        return Response({"error": "No hay parámetros activos"}, status=400)

    hoy = date.today()
    cuotas = SaldoCuotas.objects.filter(id_infante=infante).order_by("anho", "mes")

    resumen = []
    total_cuota = Decimal("0.00")
    total_mora_original = Decimal("0.00")
    total_mora_calculada = Decimal("0.00")
    total_pagado = Decimal("0.00")
    cuotas_pagadas = 0
    cuotas_pendientes = 0

    for cuota in cuotas:
        vencimiento_con_gracia = cuota.fecha_vencimiento + timedelta(days=parametros.dias_gracia)
        total_cobrado = cuota.cobros.aggregate(total=Sum('monto_cobrado'))['total'] or Decimal("0.00")

        if not cuota.estado and hoy > vencimiento_con_gracia:
            dias_mora = (hoy - vencimiento_con_gracia).days
            mora_calculada = dias_mora * parametros.mora_por_dia
        else:
            mora_calculada = Decimal("0.00")

        if cuota.estado:
            total_pagado_item = cuota.monto_cuota + cuota.monto_mora
        else:
            total_pagado_item = cuota.monto_cuota + mora_calculada

        resumen.append({
            "anho": cuota.anho,
            "mes": cuota.mes,
            "fecha_vencimiento": cuota.fecha_vencimiento,
            "cuota": cuota.monto_cuota,
            "mora_original": cuota.monto_mora,
            "mora_calculada": mora_calculada,
            "total_pagado": total_pagado_item,
            "total_cobrado": total_cobrado,
            "pagada": cuota.estado,
        })

        total_cuota += cuota.monto_cuota
        total_mora_original += cuota.monto_mora
        total_mora_calculada += mora_calculada
        total_pagado += total_pagado_item
        cuotas_pagadas += int(cuota.estado)
        cuotas_pendientes += int(not cuota.estado)

    return Response({
        "infante": {
            "id": infante.id,
            "nombre": str(infante),
        },
        "resumen": resumen,
        "totales": {
            "total_cuotas_emitidas": total_cuota,
            "total_mora_original": total_mora_original,
            "total_mora_calculada": total_mora_calculada,
            "total_pagado_estimado": total_pagado,
            "cuotas_pagadas": cuotas_pagadas,
            "cuotas_pendientes": cuotas_pendientes,
        }
    })