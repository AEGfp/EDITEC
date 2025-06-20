from rest_framework import viewsets
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, TutorInfante
from .serializers import (
    InfanteSerializer,
    TutorSerializer,
    TurnoSerializer,
    SalaSerializer,
    AnhoLectivoSerializer,
    InfanteCreateUpdateSerializer,
    TutorCreateUpdateSerializer,
    TransferenciaSalaSerializer,
    TransferenciaProfesorSerializer,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from api.models import Persona
from xhtml2pdf import pisa
from django.template.loader import render_to_string
import io
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView  
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied






class InfanteView(viewsets.ModelViewSet):
    queryset = Infante.objects.all()
    permission_classes = [IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user
        periodo_id = self.request.query_params.get("id_periodo")

        qs = Infante.objects.all()
        if periodo_id:
            qs = qs.filter(periodo_inscripcion_id=periodo_id)

        grupos = set(user.groups.values_list("name", flat=True))

        if grupos == {"tutor"}:
            try:
                tutor = Tutor.objects.get(id_persona__user=user)
                return qs.filter(tutores__tutor=tutor)
            except Tutor.DoesNotExist:
                return qs.none()

        return qs

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InfanteCreateUpdateSerializer
        return InfanteSerializer

    def get_serializer_context(self):
        return {"request": self.request}


class TutorView(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()

    def get_queryset(self):
        user = self.request.user
        periodo_id = self.request.query_params.get("id_periodo")

        qs = Tutor.objects.all()
        if periodo_id:
            qs = qs.filter(periodo_inscripcion_id=periodo_id)

        grupos = set(user.groups.values_list("name", flat=True))

        if grupos == {"tutor"}:
            return qs.filter(id_persona__user=user)

        return qs

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TutorCreateUpdateSerializer
        return TutorSerializer
    
    def perform_update(self, serializer):
        tutor = self.get_object()
        if self.request.user != tutor.id_persona.user:
            raise PermissionDenied("No tenés permiso para editar este tutor.")
        serializer.save()


class TurnoView(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer


class SalaView(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer


    def get_queryset(self):
        qs = Sala.objects.all()
        periodo_id = self.request.query_params.get("periodo_id")
        if periodo_id:
            qs = qs.filter(periodo_inscripcion_id=periodo_id)
        return qs



@api_view(["GET"])
@permission_classes([AllowAny])
def salas_publicas(request):
    hora_entrada = request.GET.get("hora_entrada")
    hora_salida = request.GET.get("hora_salida")
    periodo_id=request.GET.get("periodo_id")
    salas = Sala.objects.all()
    if periodo_id:
        salas=salas.filter(periodo_inscripcion_id=periodo_id)
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




@api_view(["GET"])
@permission_classes([AllowAny])
def reporte_documentacion(request, infante_id):  
    try:
        infante = Infante.objects.select_related('id_persona', 'id_sala')\
            .prefetch_related('tutores__tutor__id_persona')\
            .get(id=infante_id)

        persona = infante.id_persona

        tutores_data = []
        for tutor_relacion in infante.tutores.all():
            tutor = tutor_relacion.tutor
            tutor_persona = tutor.id_persona
            tutores_data.append({
            'nombre': f"{tutor_persona.nombre} {tutor_persona.apellido} {tutor_persona.segundo_apellido or ''}".strip(),
            'ci': tutor_persona.ci,
            'telefono_particular': tutor.telefono_particular,
            'telefono_casa': tutor.telefono_casa,
            'telefono_trabajo': tutor.telefono_trabajo,
            })

        context = {
    'infante': {
        'nombre_completo': f"{persona.nombre} {persona.apellido} {persona.segundo_apellido or ''}".strip(),
        'ci': persona.ci,
        'fecha_nacimiento': persona.fecha_nacimiento.strftime("%d/%m/%Y"),
        'edad': calcular_edad(persona.fecha_nacimiento),
        'alergia': infante.ind_alergia,
        'intolerancia': infante.ind_intolerancia_lactosa,
        'celiaquismo': infante.ind_celiaquismo,
        'permiso_panhal': infante.permiso_cambio_panhal,
        'permiso_fotos': infante.permiso_fotos,
        'sala': infante.id_sala.descripcion if infante.id_sala else 'Sin sala',
        'domicilio': persona.domicilio or '',
    },
    'tutores': tutores_data,  # ✅ pasamos tutores aquí
    'fecha': timezone.now().strftime("%d/%m/%Y"),
}


        html = render_to_string("reporte_documentacion.html", context)
        result = io.BytesIO()
        pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

        if not pdf.err:
            return HttpResponse(result.getvalue(), content_type="application/pdf")
        return HttpResponse("Error al generar PDF", status=500)

    except Infante.DoesNotExist:
        return Response({"error": "Infante no encontrado"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def calcular_edad(fecha_nac):
    from datetime import date
    hoy = date.today()
    return hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))

@api_view(["GET"])
@permission_classes([AllowAny])
def reporte_asignacion_aulas(request):
    salas = Sala.objects.select_related("profesor_encargado").prefetch_related("infantes__id_persona")

    data = []

    for sala in salas:
        profesor = sala.profesor_encargado
        infantes = sala.infantes.all()

        data.append({
            "sala": sala.descripcion,
            "profesor": f"{profesor.nombre} {profesor.apellido}" if profesor else "Sin profesor asignado",
            "infantes": [
                {
                    "nombre": f"{i.id_persona.nombre} {i.id_persona.apellido}",
                    "ci": i.id_persona.ci,
                    "fecha_nacimiento": i.id_persona.fecha_nacimiento.strftime("%d/%m/%Y"),
                }
                for i in infantes
            ]
        })

    html = render_to_string("reporte_asignacion_aulas.html", {"salas": data, "fecha": timezone.now().strftime("%d/%m/%Y")})
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)



#vista tranferencia de sala
class TransferenciaSalaView(APIView):
    def post(self, request):
        serializer = TransferenciaSalaSerializer(data=request.data)
        if serializer.is_valid():
            infante = serializer.save()
            return Response({
                "mensaje": "Transferencia realizada exitosamente.",
                "infante_id": infante.id,
                "nueva_sala": infante.id_sala.descripcion
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

#tranferencioa de profesor
class TransferenciaProfesorView(APIView):
    def post(self, request):
        serializer = TransferenciaProfesorSerializer(data=request.data)
        if serializer.is_valid():
            sala_actualizada = serializer.save()
            return Response({"mensaje": "Profesor transferido con éxito"})
        return Response(serializer.errors, status=400)