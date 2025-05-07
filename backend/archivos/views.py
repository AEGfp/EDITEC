from django.shortcuts import render
from .serializers import ArchivosSerializer
from rest_framework import viewsets
from .models import Archivos
from rest_framework.decorators import (
    permission_classes,
)
from rest_framework.permissions import AllowAny


# Create your views here.
@permission_classes([AllowAny])
class ArchivosViewSet(viewsets.ModelViewSet):
    queryset = Archivos.objects.all()
    serializer_class = ArchivosSerializer
