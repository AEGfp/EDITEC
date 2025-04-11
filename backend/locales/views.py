from rest_framework import generics
from .models import Local
from .serializers import LocalSerializer

class ListarLocales(generics.ListCreateAPIView):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer

class DetallesLocales(generics.RetrieveUpdateDestroyAPIView):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer