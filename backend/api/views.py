from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializer import PermisoSerializer, UserSerializer
from .models import Permiso
from Roles.roles import EsDirector

# Create your views here.


@api_view(["POST"])
def login(request):

    user = get_object_or_404(User, username=request.data["username"])

    if not user.check_password(request.data["password"]):
        return Response(
            {"error": "Contraseña no válida"}, status=status.HTTP_400_BAD_REQUEST
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {"access": str(refresh.access_token), "refresh": str(refresh)},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def register(request):
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        user = User.objects.get(username=serializer.data["username"])
        user.set_password(serializer.data["password"])
        user.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

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


# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
class PermisoView(viewsets.ModelViewSet):

    serializer_class = PermisoSerializer
    queryset = Permiso.objects.all()

    #!! Para probar sin permisos
    #permission_classes = [EsDirector]
