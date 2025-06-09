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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class InfanteView(viewsets.ModelViewSet):
    queryset = Infante.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InfanteCreateUpdateSerializer
        return InfanteSerializer


class TutorView(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TutorCreateUpdateSerializer
        return TutorSerializer


class TurnoView(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer


class SalaView(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def salas_publicas(request):
    hora_entrada = request.GET.get("hora_entrada")
    hora_salida = request.GET.get("hora_salida")
    salas = Sala.objects.all()
    if hora_entrada and hora_salida:
        salas = salas.filter(
            hora_entrada__lte=hora_entrada, hora_salida__gte=hora_salida
        )
    serializer = SalaSerializer(salas, many=True)
    return Response(serializer.data)


class AnhoLectivoView(viewsets.ModelViewSet):
    queryset = AnhoLectivo.objects.all()
    serializer_class = AnhoLectivoSerializer


#! Corregir permisos
@api_view(["GET"])
@permission_classes([AllowAny])
def infantes_asignados(request):
    usuario = request.user
    persona = getattr(usuario, "persona", None)
    if not persona:
        return Response(
            {"error": "El usuario no tiene un persona asociada"}, status=400
        )

    sala = Sala.objects.filter(profesor_encargado=persona)

    infantes = Infante.objects.filter(id_sala__in=sala)
    serializer = InfanteSerializer(infantes, many=True)

    return Response(serializer.data)
