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

from rest_framework import generics

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import TipoInforme, Indicador, Informe, InformeIndicador
from .serializers import ( TipoInformeSerializer,
                           IndicadorSerializer,
                           InformeSerializer,
                           InformeIndicadorSerializer)


# View para tipos de informe
@permission_classes([AllowAny])
class TipoInformeView(viewsets.ModelViewSet):
    serializer_class = TipoInformeSerializer
    queryset = TipoInforme.objects.all()


# View para indicadores
@permission_classes([AllowAny])
class IndicadorView(viewsets.ModelViewSet):
    serializer_class = IndicadorSerializer
    queryset = Indicador.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['id_tipo_informe'] # Para poder usar ?id_tipo_informe=x

# View para informes
@permission_classes([AllowAny])
class InformeView(viewsets.ModelViewSet):
    serializer_class = InformeSerializer
    queryset = Informe.objects.all()


# View para tabla intermedia informe indicadores
@permission_classes([AllowAny])
class InformeIndicadorView(viewsets.ModelViewSet):
    serializer_class = InformeIndicadorSerializer
    queryset = InformeIndicador.objects.all()
