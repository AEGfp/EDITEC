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
from .models import ParametrosCobros, SaldoCuotas, CobroCuotaInfante, EstadoCuota
from .serializers import ParametrosCobrosSerializer, SaldoCuotasSerializer, CobroCuotaInfanteSerializer
from apps.educativo.models import Infante
from apps.educativo.serializers import InfanteSerializer
from inscripciones.models import PeriodoInscripcion, Inscripcion
from datetime import date, timedelta
from calendar import monthrange
from django.db import transaction
from apps.educativo.models import Infante, Sala
from django.db import IntegrityError
from decimal import Decimal
from django.utils import timezone
from dateutil.parser import parse
import logging

from django.template.loader import get_template, render_to_string
from xhtml2pdf import pisa
from django.http import HttpResponse
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
import pytz
from io import BytesIO

@permission_classes([AllowAny])
class ParametrosCobrosView(viewsets.ModelViewSet):
    queryset = ParametrosCobros.objects.all()
    serializer_class = ParametrosCobrosSerializer

    def get_queryset(self):
        return ParametrosCobros.objects.select_related('periodo')

@permission_classes([AllowAny])
class SaldoCuotasView(viewsets.ModelViewSet):
    serializer_class = SaldoCuotasSerializer

    def get_queryset(self):
        queryset = SaldoCuotas.objects.select_related('id_infante__id_persona').all()

        infante_id = self.request.query_params.get('infante_id')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        estado = self.request.query_params.get('estado')

        if infante_id:
            queryset = queryset.filter(id_infante__id=infante_id)

        if fecha_desde:
            try:
                fecha_desde = parse(fecha_desde).date()
                queryset = queryset.filter(fecha_vencimiento__gte=fecha_desde)
            except:
                pass

        if fecha_hasta:
            try:
                fecha_hasta = parse(fecha_hasta).date()
                queryset = queryset.filter(fecha_vencimiento__lte=fecha_hasta)
            except:
                pass

        if estado:
            queryset = queryset.filter(estado=estado)

        return queryset
@permission_classes([AllowAny])
class CobroCuotaInfanteView(viewsets.ModelViewSet):
    queryset = CobroCuotaInfante.objects.all()
    serializer_class = CobroCuotaInfanteSerializer

    def get_queryset(self):
        return CobroCuotaInfante.objects.select_related('cuota', 'usuario')



@api_view(["POST"])
@permission_classes([AllowAny])
def generar_cuotas(request):
    print("Request data:", request.data)
    id_infante = request.data.get("id_infante")
    
    # Validar ID del infante
    if not id_infante:
        return Response({"error": "Se requiere seleccionar un infante para generar las cuotas"}, status=400)
    
    try:
        infante = Infante.objects.get(id=id_infante)
    except Infante.DoesNotExist:
        return Response({"error": "El infante no se encuentra en la base de datos"}, status=404)
    
    # Obtener el período activo
    #now = timezone.now().astimezone(pytz.timezone('America/Asuncion'))
    periodo = PeriodoInscripcion.objects.filter(activo=True, fecha_inicio__lte=timezone.now(), fecha_fin__gte=timezone.now()).first()
    if not periodo:
        return Response({"error": "No hay un período de inscripción activo"}, status=400)
        
    # Obtener los parámetros activos del período
    parametros = ParametrosCobros.objects.filter(periodo=periodo, estado=True).first()
    if not parametros:
        return Response({"error": "No existen parámetros activos para el período actual"}, status=400)
    
    # Extraer el año del período
    anho = periodo.fecha_inicio.year
    print("Año sacado:",anho)
    
    c_generadas = []
    num = 1

    with transaction.atomic():
        for mes in range(parametros.mes_inicio, parametros.mes_fin + 1):
            # Verificar si la cuota ya existe
            if SaldoCuotas.objects.filter(id_infante=infante, periodo=periodo, mes=mes, nro_cuota=num).exists():
                continue
            
            # Calcular fecha de vencimiento
            dia_vencimiento = min(parametros.dia_limite_pago, monthrange(anho, mes)[1])
            fecha_vencimiento = date(anho, mes, dia_vencimiento)
            
            # Crear la cuota
            cuota = SaldoCuotas(
                id_infante=infante,
                periodo=periodo,
                anho=anho,
                mes=mes,
                nro_cuota=num,
                fecha_vencimiento=fecha_vencimiento,
                monto_cuota=parametros.monto_cuota,
            )
            try:
                print("Cuota a guardar:", cuota.__dict__)  # Depuración
                cuota.save()
                c_generadas.append(cuota)
            except Exception as e:
                print("Error al guardar cuota:", str(e))  # Depuración
                return Response(
                    {"error": f"Error al guardar cuota: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            num += 1
    
    if not c_generadas:
        return Response({"detalle": "No se generaron nuevas cuotas. Ya existen para el infante."}, status=200)
    
    serializer = SaldoCuotasSerializer(c_generadas, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
    
# View para obtener cuotas por infante
@permission_classes([AllowAny])
class CuotasPorInfanteView(viewsets.ModelViewSet):
    serializer_class = SaldoCuotasSerializer

    # Se obtiene las cuotas por infante
    def get_queryset(self):
        infante = self.kwargs['id_infante']
        return SaldoCuotas.objects.filter(id_infante = infante)
@permission_classes([AllowAny])
class ListarInfantesView(viewsets.ViewSet):
    def list(self, request):
        infantes = Infante.objects.all()
        serializer = InfanteSerializer(infantes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    
@permission_classes([AllowAny])
class CuotasPorInfanteView(viewsets.ModelViewSet):
    serializer_class = SaldoCuotasSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        infante_id = self.kwargs['id_infante']
        # Actualizar estados de las cuotas
        cuotas = SaldoCuotas.objects.filter(id_infante_id=infante_id)
        for cuota in cuotas:
            cuota.actualizar_estado()
        # Filtrar solo cuotas PENDIENTE o VENCIDA
        return SaldoCuotas.objects.filter(
            id_infante_id=infante_id,
            estado__in=['PENDIENTE', 'VENCIDA']
        ).select_related('id_infante__id_persona', 'periodo')  
    

logger = logging.getLogger(__name__)
@permission_classes([AllowAny])

class CobroCuotaView(viewsets.ModelViewSet):
    queryset = CobroCuotaInfante.objects.all()
    serializer_class = CobroCuotaInfanteSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                cobro = serializer.save()
                return Response({
                    "message": "Cuota cobrada exitosamente",
                    "cobro": serializer.data
                }, status=status.HTTP_201_CREATED)
            logger.error(f"Errores de validación: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error en la vista al crear cobro: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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

    meses = {
        1: "Enero",
        2: "Febrero",
        3: "Marzo",
        4: "Abril",
        5: "Mayo",
        6: "Junio",
        7: "Julio",
        8: "Agosto",
        9: "Septiembre",
        10: "Octubre",
        11: "Noviembre",
        12: "Diciembre",
    }
    
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
            "mes": meses.get(cuota.mes, "Mes inválido"),
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

    meses = {
        1: "Enero",
        2: "Febrero",
        3: "Marzo",
        4: "Abril",
        5: "Mayo",
        6: "Junio",
        7: "Julio",
        8: "Agosto",
        9: "Septiembre",
        10: "Octubre",
        11: "Noviembre",
        12: "Diciembre",
    }
    
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
            "mes": meses.get(cuota.mes, "Mes inválido"),
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


# View para el reporte general de cuotas de infantes asignados a un docente
@api_view(["GET"])
@permission_classes([AllowAny])
def generar_pdf_resumen_todos(request):
    usuario = request.user
    persona = getattr(usuario, "persona", None)

    if not persona:
        return HttpResponse("El usuario no tiene persona asociada", status=400)

    sala = Sala.objects.filter(profesor_encargado=persona)
    infantes = Infante.objects.filter(id_sala__in=sala)

    if not infantes.exists():
        return HttpResponse("No hay infantes asignados", status=200)

    parametros = ParametrosCobros.objects.filter(estado=True).first()
    if not parametros:
        return HttpResponse("No hay parámetros activos", status=400)

    hoy = date.today()
    template = get_template("cobros/resumen_cobros_multiple.html")
    todos_los_resumenes = []

    for infante in infantes:
        cuotas = SaldoCuotas.objects.filter(id_infante=infante).order_by("anho", "mes")
        resumen = []

        for cuota in cuotas:
            vencimiento_con_gracia = cuota.fecha_vencimiento + timedelta(days=parametros.dias_gracia)

            if not cuota.estado and hoy > vencimiento_con_gracia:
                dias_mora = (hoy - vencimiento_con_gracia).days
                mora_calculada = dias_mora * parametros.mora_por_dia
            else:
                mora_calculada = 0

            total_cobrado = cuota.cobros.aggregate(total=Sum("monto_cobrado"))['total'] or Decimal("0.00")

            resumen.append({
                "anho": cuota.anho,
                "mes": cuota.mes,
                "fecha_vencimiento": cuota.fecha_vencimiento,
                "cuota": cuota.monto_cuota,
                "mora_original": cuota.monto_mora,
                "mora_calculada": mora_calculada,
                "total_pagado": cuota.monto_cuota + mora_calculada,
                "total_cobrado": total_cobrado,
                "pagada": cuota.estado,
            })

        todos_los_resumenes.append({
            "infante": infante,
            "resumen": resumen
        })

    html = template.render({
        "fecha_actual": hoy,
        "reportes": todos_los_resumenes
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="resumen_todos_los_infantes.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse("Error al generar PDF", status=500)
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def generar_reporte_cuotas_pdf(request):
    infante_id = request.query_params.get('infante_id')
    fecha_desde = request.query_params.get('fecha_desde')
    fecha_hasta = request.query_params.get('fecha_hasta')
    estado = request.query_params.get('estado')

    queryset = SaldoCuotas.objects.select_related('id_infante__id_persona').all()

    if infante_id:
        queryset = queryset.filter(id_infante__id=infante_id)

    if fecha_desde:
        try:
            fecha_desde = parse(fecha_desde).date()
            queryset = queryset.filter(fecha_vencimiento__gte=fecha_desde)
        except:
            pass

    if fecha_hasta:
        try:
            fecha_hasta = parse(fecha_hasta).date()
            queryset = queryset.filter(fecha_vencimiento__lte=fecha_hasta)
        except:
            pass

    if estado:
        queryset = queryset.filter(estado=estado)

    resumen = []
    total_cuota = 0
    total_mora = 0
    total_pagado = 0
    cuotas_pagadas = 0
    cuotas_pendientes = 0
    infante = None
   

    if infante_id:
        try:
            infante = Infante.objects.get(id=infante_id)
            infante_nombre = f"{infante.id_persona.nombre} {infante.id_persona.apellido}"
           
        except Infante.DoesNotExist:
            infante_nombre = "Todos los infantes"
            
    else:
        infante_nombre = "Todos los infantes"
        

    for cuota in queryset:
        resumen.append({
            'anho': cuota.anho,
            'mes': cuota.mes,
            'fecha_vencimiento': cuota.fecha_vencimiento,
            'total_cuota': cuota.monto_cuota,
            'monto_mora_calculada': cuota.monto_mora,
            'total_pagado': cuota.monto_total,
            'pagada': cuota.estado == 'PAGADA',
        })
        total_cuota += cuota.monto_cuota
        total_mora += cuota.monto_mora
        total_pagado += cuota.monto_total
        if cuota.estado == 'PAGADA':
            cuotas_pagadas += 1
        else:
            cuotas_pendientes += 1

    context = {
        'infante': infante_nombre,
        'resumen': resumen,
        'total_cuota': total_cuota,
        'total_mora_calculada': total_mora,
        'total_pagado': total_pagado,
        'cuotas_pagadas': cuotas_pagadas,
        'cuotas_pendientes': cuotas_pendientes,
        'fecha_actual': timezone.now().astimezone(pytz.timezone('America/Asuncion')),
        'fecha_desde': fecha_desde,
        'fecha_hasta': fecha_hasta
    }

    html_string = render_to_string('cobros/reporte_cuotas.html', context)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="resumen_cuotas.pdf"'
    
    result = BytesIO()
    pisa_status = pisa.CreatePDF(html_string, dest=result)
    
    if pisa_status.err:
        return Response({'error': 'Error al generar el PDF'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    response.write(result.getvalue())
    result.close()
    
    return response