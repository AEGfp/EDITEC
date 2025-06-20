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


from django.shortcuts import render
from rest_framework import viewsets
from .models import Proveedor, TipoComprobante, Condicion, ComprobanteProveedor, SaldoProveedores, CajaPagos
from .serializers import (
    ProveedorSerializer,
    TipoComprobanteSerializer,
    CondicionSerializer,
    ComprobanteProveedorSerializer,
    #! Solo para ver
    SaldoProveedoresSerializer,
    CajaPagosSerializer)

from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
import io
from .models import ComprobanteProveedor, CajaPagos, Proveedor
from django.db.models import Q
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.dateparse import parse_date
from xhtml2pdf import pisa
import io
from .models import ComprobanteProveedor, CajaPagos, Proveedor


@permission_classes([AllowAny])
# View para proveedores
class ProveedorView(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)  # Soporta PATCH y PUT
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Validar si tiene comprobantes asociados
        if instance.comprobanteproveedor_set.exists():
            return Response(
                {"error": "No se puede eliminar este proveedor porque tiene comprobantes asociados."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar la persona antes de eliminar proveedor
        persona = instance.id_persona

        self.perform_destroy(instance)
        persona.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@permission_classes([AllowAny])
# View para tipos de comprobantes
class TipoComprobanteView(viewsets.ModelViewSet):
    queryset = TipoComprobante.objects.all()
    serializer_class = TipoComprobanteSerializer

@permission_classes([AllowAny])
# View para condiciones de comprobantes
class CondicionView(viewsets.ModelViewSet):
    queryset = Condicion.objects.all()
    serializer_class = CondicionSerializer

@permission_classes([AllowAny])
# View para los comprobantes
class ComprobanteProveedorView(viewsets.ModelViewSet):
    queryset = ComprobanteProveedor.objects.all()
    serializer_class = ComprobanteProveedorSerializer

@permission_classes([AllowAny])
#! Solo para comprobar saldos, ver como actualizar el pago
# View para los saldos
class SaldoProveedoresView(viewsets.ModelViewSet):
    queryset = SaldoProveedores.objects.all()
    serializer_class = SaldoProveedoresSerializer

'''class ComprobantesConSaldoAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        comprobantes = ComprobanteProveedor.objects.filter(
            saldos__saldo_cuota__gt=0
        ).distinct()

        data = [
            {
                "id": c.id,
                "descripcion": str(c),  #!Modificar para front
            }
            for c in comprobantes
        ]
        return Response(data)
    '''
class ComprobantesConSaldoAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        mostrar_todas = request.query_params.get('mostrar_todas', 'false').lower() == 'true'
        id_comprobante_actual = request.query_params.get('id_comprobante_actual')

        if mostrar_todas:
            comprobantes = ComprobanteProveedor.objects.all()
        else:
            comprobantes = ComprobanteProveedor.objects.filter(
                saldos__saldo_cuota__gt=0
            ).distinct()

            # Si me pasan un comprobante actual, lo agrego aunque tenga saldo 0
            if id_comprobante_actual:
                comprobante_actual_qs = ComprobanteProveedor.objects.filter(id=id_comprobante_actual)
                comprobantes = comprobantes | comprobante_actual_qs

        comprobantes = comprobantes.distinct()

        data = [
            {
                "id": c.id,
                "descripcion": str(c),  # Puedes mejorar la descripción para el front
            }
            for c in comprobantes
        ]
        return Response(data)



@api_view(['GET'])
@permission_classes([AllowAny])
def cuotas_disponibles(request):
    id_comprobante = request.query_params.get("id_comprobante")
    mostrar_todas = request.query_params.get('mostrar_todas', 'false').lower() == 'true'

    if not id_comprobante:
        return Response(
            {"error": "Falta el parámetro 'id_comprobante'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if mostrar_todas:
        cuotas = SaldoProveedores.objects.filter(
            id_comprobante=id_comprobante
        ).order_by('numero_cuota')
    else:
        cuotas = SaldoProveedores.objects.filter(
            id_comprobante=id_comprobante,
            saldo_cuota__gt=0
        ).order_by('numero_cuota')

    data = [
        {
            "numero_cuota": c.numero_cuota,
            "saldo_cuota": c.saldo_cuota,
            "monto_cuota": c.monto_cuota,
            "id_saldo": c.id
        }
        for c in cuotas
    ]
    return Response(data)

'''def cuotas_disponibles(request):
    id_comprobante = request.query_params.get("id_comprobante")

    if not id_comprobante:
        return Response(
            {"error": "Falta el parámetro 'id_comprobante'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    cuotas = SaldoProveedores.objects.filter(
        id_comprobante=id_comprobante,
        saldo_cuota__gt=0
    ).order_by('numero_cuota')

    data = [
        {
            "numero_cuota": c.numero_cuota,
            "saldo_cuota": c.saldo_cuota,
            "monto_cuota": c.monto_cuota,
            "id_saldo": c.id
        }
        for c in cuotas
    ]
    return Response(data)'''



@permission_classes([AllowAny])
class CajaPagosView(viewsets.ModelViewSet):
    queryset = CajaPagos.objects.all()
    serializer_class = CajaPagosSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def obtener_saldo_cuota(request, id_comprobante, numero_cuota):
    try:
        saldo = SaldoProveedores.objects.get(
            id_comprobante=id_comprobante,
            numero_cuota=numero_cuota
        )
        return Response({"saldo_cuota": saldo.saldo_cuota})
    except SaldoProveedores.DoesNotExist:
        return Response(
            {"error": "Saldo no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

@permission_classes([AllowAny])
def generar_reporte_pdf(request):
    comprobantes = ComprobanteProveedor.objects.prefetch_related('saldos', 'id_proveedor').all()
    html = render_to_string('pagos/reporte_comprobantes.html', {'comprobantes': comprobantes})
    
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return HttpResponse("Error al generar PDF", status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def generar_reporte_saldo_proveedores(request):
    proveedor_id = request.GET.get("proveedor")
    fecha_desde = request.GET.get('fecha_desde') or request.GET.get('fecha_inicio')
    fecha_hasta = request.GET.get('fecha_hasta') or request.GET.get('fecha_fin')



    cuotas = SaldoProveedores.objects.select_related("id_comprobante__id_proveedor")

    if proveedor_id:
        cuotas = cuotas.filter(id_comprobante__id_proveedor_id=proveedor_id)

    if fecha_desde:
        cuotas = cuotas.filter(id_comprobante__fecha_comprobante__gte=fecha_desde)
    if fecha_hasta:
        cuotas = cuotas.filter(id_comprobante__fecha_comprobante__lte=fecha_hasta)

    pagos = CajaPagos.objects.select_related("id_comprobante__id_proveedor")

    if proveedor_id:
        pagos = pagos.filter(id_comprobante__id_proveedor_id=proveedor_id)
    if fecha_desde:
        pagos = pagos.filter(fecha_pago__gte=fecha_desde)
    if fecha_hasta:
        pagos = pagos.filter(fecha_pago__lte=fecha_hasta)

    movimientos = []

    for cuota in cuotas:
        movimientos.append({
            "fecha": cuota.id_comprobante.fecha_comprobante,
            "comprobante": cuota.id_comprobante.id_tipo_comprobante.descripcion,
            "numero": cuota.id_comprobante.numero_comprobante,
            "debito": cuota.monto_cuota,
            "credito": 0,
            "proveedor": cuota.id_comprobante.id_proveedor.nombre_fantasia,
        })

    for pago in pagos:
        movimientos.append({
            "fecha": pago.fecha_pago,
            "comprobante": pago.id_comprobante.id_tipo_comprobante.descripcion,
            "numero": pago.id_comprobante.numero_comprobante,
            "debito": 0,
            "credito": pago.total_pago,
            "proveedor": pago.id_comprobante.id_proveedor.nombre_fantasia,
        })

    movimientos.sort(key=lambda x: x["fecha"])

    saldo = 0
    for mov in movimientos:
        saldo += mov["debito"] - mov["credito"]
        mov["saldo"] = saldo
        mov["fecha"] = mov["fecha"].strftime("%d/%m/%Y")

    html = render_to_string("pagos/reporte_saldo_proveedores.html", {
        "movimientos": movimientos,
        "proveedor_filtro": Proveedor.objects.get(id=proveedor_id).nombre_fantasia if proveedor_id else "Todos",
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
    })

    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return HttpResponse("Error al generar PDF", status=500)