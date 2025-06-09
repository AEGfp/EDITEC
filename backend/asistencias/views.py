from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializer import AsistenciaSerializer,InfanteConAsistenciaSerializer
from .models import Asistencia
from Roles.roles import ControlarRoles
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.educativo.models import Infante, Sala
# Create your views here.
#! Cambiar permisos
#@authentication_classes([JWTAuthentication])
#@permission_classes([ControlarRoles])
@permission_classes([AllowAny])
class AsistenciaView(viewsets.ModelViewSet):
   # roles_permitidos=["director","administrador","profesor"]
    queryset=Asistencia.objects.all()
    serializer_class=AsistenciaSerializer

@permission_classes([AllowAny])  
class InfantesAsignadosConAsistenciaView(APIView):
    def get(self, request):
        usuario = request.user
        persona = getattr(usuario, "persona", None)
        if not persona:
            return Response({"error": "El usuario no tiene una persona asociada"}, status=400)

        salas = Sala.objects.filter(profesor_encargado=persona)
        infantes = Infante.objects.filter(id_sala__in=salas)

        serializer = InfanteConAsistenciaSerializer(infantes, many=True)
        return Response(serializer.data)