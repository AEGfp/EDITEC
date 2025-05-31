from rest_framework import viewsets
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo
from .serializers import (
    InfanteSerializer,
    TutorSerializer,
    TurnoSerializer,
    SalaSerializer,
    AnhoLectivoSerializer,
    
    InfanteCreateUpdateSerializer,
    TutorCreateUpdateSerializer,
)

class InfanteView(viewsets.ModelViewSet):
    queryset = Infante.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return InfanteCreateUpdateSerializer
        return InfanteSerializer

class TutorView(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TutorCreateUpdateSerializer
        return TutorSerializer

class TurnoView(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer

class SalaView(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer

class AnhoLectivoView(viewsets.ModelViewSet):
    queryset = AnhoLectivo.objects.all()
    serializer_class = AnhoLectivoSerializer
