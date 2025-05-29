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
from .models import Proveedor, TipoComprobante, Condicion, ComprobanteProveedor, SaldoProveedores
from .serializers import (
    ProveedorSerializer,
    TipoComprobanteSerializer,
    CondicionSerializer,
    ComprobanteProveedorSerializer,
    #! Solo para ver
    SaldoProveedoresSerializer)

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