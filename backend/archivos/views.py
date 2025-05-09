from django.http import FileResponse, Http404
from .serializers import ArchivosSerializer
from rest_framework import viewsets
from .models import Archivos
from rest_framework.decorators import permission_classes, api_view
from rest_framework.permissions import AllowAny
import os


# Create your views here.
@permission_classes([AllowAny])
class ArchivosViewSet(viewsets.ModelViewSet):
    queryset = Archivos.objects.all()
    serializer_class = ArchivosSerializer


# ! Cambiar los permisos
@api_view(["GET"])
@permission_classes([AllowAny])
def descargar_archivo(request, arch_id):
    try:
        archivo = Archivos.objects.get(id=arch_id)
        path = archivo.archivo.path
        nombre_archivo = os.path.basename(path)

        respuesta=FileResponse(open(path, "rb"), as_attachment=True, filename=nombre_archivo)
        respuesta["Content-Disposition"]=f'attachment; filename="{nombre_archivo}"'

        return respuesta

    except Archivos.DoesNotExist:
        return Http404("Archivo no encontrado")
