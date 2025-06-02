from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import InscripcionSerializer
from .models import Inscripcion
from Roles.roles import ControlarRoles
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

# Create your views here.
#!!! Cambiar permisos
@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
class InscripcionView(viewsets.ModelViewSet):
    serializer_class = InscripcionSerializer
    queryset = Inscripcion.objects.all()
    roles_permitidos = ["director", "administrador", "tutor"]

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name__in=["administrador", "director"]).exists():
            return Inscripcion.objects.all()

        try:
            tutor = user.persona.tutor
            return Inscripcion.objects.filter(id_tutor=tutor)
        except:
            return Inscripcion.objects.none()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        user = request.user

        if "estado" in data:
            if not user.groups.filter(name__in=["administrador", "director"]).exists():
                raise PermissionDenied(
                    "No tienes permiso para cambiar el estado de una inscripción."
                )

            instance.usuario_auditoria = user
            instance.fecha_revision = timezone.now()
            instance.save()
        return super().update(request, *args, **kwargs)
