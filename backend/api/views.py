from django.contrib.auth import authenticate
from django.contrib.auth.models import Group,User 
from rest_framework import viewsets, status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
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
from .serializer import (
    PermisoSerializer,
    UserSerializer,
    PersonaSerializer,
    # PerfilUsuarioSerializer,
)
from .models import Permiso, Persona  # , PerfilUsuario
from Roles.roles import (
    EsDirector,
    EsProfesor,
    EsAdministrador,
    EsTutor,
    ControlarRoles,
)


# Create your views here.
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user).data
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": serializer,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
    print(serializer.errors)
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
def logout(request):

    refresh_token = request.data.get("refresh")

    if refresh_token:
        try:
            refresh = RefreshToken(refresh_token)
            refresh.blacklist()

            return Response({"message": "Sesión finalizada"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": "Token de refresco inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    return Response(
        {"message": "No existe una sesión activa"},
        status=status.HTTP_400_BAD_REQUEST,
    )

@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
class FuncionariosView(APIView):
    roles_permitidos = ["director","administrador"]

    def get(self, request):
        grupo_param = request.query_params.get("grupo")

        if grupo_param:
            usuarios = User.objects.filter(groups__name=grupo_param).distinct()
        else:
            roles_funcionarios = ["profesor", "administrador","director"]
            usuarios = User.objects.filter(groups__name__in=roles_funcionarios).distinct()

        serializer = UserSerializer(usuarios, many=True)
        return Response(serializer.data)

@permission_classes([AllowAny])
class PersonaView(viewsets.ModelViewSet):
    serializer_class = PersonaSerializer
    queryset = Persona.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        grupo = self.request.query_params.get('grupo')
        if grupo == 'profesor':
            queryset = queryset.filter(
                user__isnull=False,
                user__groups__name='profesor'
            )
        return queryset
"""
@permission_classes([AllowAny])
class PerfilUsuarioView(viewsets.ModelViewSet):
    serializer_class = PerfilUsuarioSerializer
    queryset = PerfilUsuario.objects.all()
"""


@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
class PermisoView(viewsets.ModelViewSet):
    roles_permitidos = ["director", "profesor"]

    serializer_class = PermisoSerializer
    queryset = Permiso.objects.all()

@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
class UsuarioDetailView(RetrieveUpdateDestroyAPIView):
    roles_permitidos = ["director", "administrador"]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def update(self, request, *args, **kwargs):
        partial = request.method == "PATCH"  # Determina si es PATCH
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            print("Error de validación al actualizar usuario:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)