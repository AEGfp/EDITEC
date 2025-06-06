from django.http import FileResponse, Http404
from .serializers import ArchivosSerializer
from rest_framework import viewsets
from .models import Archivos
from rest_framework.decorators import permission_classes, api_view,authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from Roles.roles import ControlarRoles
import os
from django.conf import settings

# Create your views here.
@permission_classes([AllowAny])
class ArchivosViewSet(viewsets.ModelViewSet):
    queryset = Archivos.objects.all()
    serializer_class = ArchivosSerializer

    def get_queryset(self):
        queryset = Archivos.objects.all()
        persona_id = self.request.query_params.get("persona")

        if persona_id is not None:
            queryset = queryset.filter(persona_id=persona_id)

        return queryset

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
def descargar_archivo(request, arch_id):
    try:
        archivo = Archivos.objects.get(id=arch_id)
        ruta = archivo.archivo.path
        nombre_archivo = os.path.basename(ruta)

        respuesta=FileResponse(open(ruta, "rb"), as_attachment=True, filename=nombre_archivo)
        respuesta["Content-Disposition"]=f'attachment; filename="{nombre_archivo}"'

        return respuesta

    except Archivos.DoesNotExist:
        return Http404("Archivo no encontrado")

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
def descargar_permisos(request, nombre_archivo):
    ruta = os.path.join(settings.MEDIA_ROOT, "descargables", nombre_archivo)

    if not os.path.exists(ruta):
        raise Http404("Archivo no encontrado en descargables")

    return FileResponse(
        open(ruta, "rb"),
        as_attachment=True,
        filename=nombre_archivo
    )