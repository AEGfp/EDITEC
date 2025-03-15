from rest_framework import viewsets
from .serializer import PermisoSerializer
from .models import Permiso
# Create your views here.
class PermisoView(viewsets.ModelViewSet):
    serializer_class=PermisoSerializer
    queryset=Permiso.objects.all()