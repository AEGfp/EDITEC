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

from django.http import HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
import io
from .models import ComprobanteProveedor

@permission_classes([AllowAny])
# View para proveedores
class ProveedorView(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

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

class ComprobantesConSaldoAPIView(APIView):
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
    

@api_view(['GET'])
@permission_classes([AllowAny])
def cuotas_disponibles(request):
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
        }
        for c in cuotas
    ]
    return Response(data)

@permission_classes([AllowAny])
class CajaPagosView(viewsets.ModelViewSet):
    queryset = CajaPagos.objects.all()
    serializer_class = CajaPagosSerializer

@permission_classes([AllowAny])
def generar_reporte_pdf(request):
    comprobantes = ComprobanteProveedor.objects.prefetch_related('saldos', 'id_proveedor').all()
    html = render_to_string('pagos/reporte_comprobantes.html', {'comprobantes': comprobantes})
    
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return HttpResponse("Error al generar PDF", status=500)