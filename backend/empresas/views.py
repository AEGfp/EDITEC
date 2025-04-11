from rest_framework import generics
from .models import Empresa
from .serializers import EmpresaSerializer

class ListarEmpresas(generics.ListCreateAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer

class DetallesEmpresas(generics.RetrieveUpdateDestroyAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer