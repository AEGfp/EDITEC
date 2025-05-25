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
    PerfilUsuarioSerializer,
)
from api.models import Permiso, Persona, PerfilUsuario
from Roles.roles import (
    EsDirector,
    EsProfesor,
    EsAdministrador,
    EsTutor,
    ControlarRoles,
)

from rest_framework import generics
from .models import Local
from .serializers import LocalSerializer

@permission_classes([AllowAny])
class ListarLocales(generics.ListCreateAPIView):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer

@permission_classes([AllowAny])
class DetallesLocales(generics.RetrieveUpdateDestroyAPIView):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer