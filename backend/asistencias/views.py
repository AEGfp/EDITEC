from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes,authentication_classes,action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializer import AsistenciaSerializer,InfanteConAsistenciaSerializer
from .models import Asistencia
from Roles.roles import ControlarRoles
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.educativo.models import Infante, Sala
from django.utils.timezone import now,localtime
# Create your views here.
#! Cambiar permisos
#@authentication_classes([JWTAuthentication])
#@permission_classes([ControlarRoles])
@permission_classes([AllowAny])
class AsistenciaView(viewsets.ModelViewSet):
   # roles_permitidos=["director","administrador","profesor"]
    queryset=Asistencia.objects.all()
    serializer_class=AsistenciaSerializer

    @action(detail=True, methods=["post"], url_path="marcar-salida", permission_classes=[AllowAny])
    def marcar_salida(self, request, pk=None):
        usuario = request.user
        try:
            asistencia = self.get_object()  # ya obtiene por `pk`
        except Asistencia.DoesNotExist:
            return Response({"error": "No se encontró la asistencia"}, status=404)

        asistencia.hora_salida = localtime(now()).time()
        asistencia.usuario_auditoria = usuario
        asistencia.save()

        serializer = self.get_serializer(asistencia)
        return Response(serializer.data, status=200)

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


@api_view(["POST"])
@permission_classes([AllowAny])
def marcar_salida(request):
    usuario = request.user
    id_infante = request.data.get("id_infante")

    if not id_infante:
        return Response({"error": "Falta el id_infante"}, status=400)

    hoy = localtime(now()).date()

    try:
        asistencia = Asistencia.objects.get(id_infante=id_infante, fecha=hoy)
    except Asistencia.DoesNotExist:
        return Response({"error": "No hay asistencia registrada para hoy"}, status=404)

    if asistencia.hora_salida:
        return Response({"error": "La salida ya fue registrada"}, status=400)

    data = {
        "hora_salida": localtime(now()).time()
    }

    serializer = AsistenciaSerializer(asistencia, data=data, partial=True, context={"request": request})

    if serializer.is_valid():
        instancia = serializer.save(usuario_auditoria=usuario)
        return Response(AsistenciaSerializer(instancia).data, status=200)

    return Response(serializer.errors, status=400)
