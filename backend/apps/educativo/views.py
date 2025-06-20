from rest_framework import viewsets
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, TutorInfante, TransferenciaInfante, TransferenciaProfesor
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

        if user.is_superuser or user.is_staff:
            return Infante.objects.all()

        grupos = set(user.groups.values_list("name", flat=True))

        if grupos == {"tutor"}:
            try:
                tutor = Tutor.objects.get(id_persona__user=user)
                return Infante.objects.filter(tutores__tutor=tutor)
            except Tutor.DoesNotExist:
                return Infante.objects.none()

        return Infante.objects.all()

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

        if user.is_superuser or user.is_staff:
            return Tutor.objects.all()

        grupos = set(user.groups.values_list("name", flat=True))

        if grupos == {"tutor"}:
            return Tutor.objects.filter(id_persona__user=user)

        return Tutor.objects.all()

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


#VISTA PARA REPORTE DE ASIGNACION DE AULAS 
@api_view(["GET"])
@permission_classes([AllowAny])
def reporte_asignacion_aulas(request):
    salas = Sala.objects.select_related("profesor_encargado").prefetch_related("infante_set__id_persona")

    data = []

    for sala in salas:
        profesor = sala.profesor_encargado
        infantes = sala.infante_set.all()

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


@api_view(["GET"])
def reporte_transferencias_general(request):
    transferencias = TransferenciaSalaRegistro.objects.select_related('infante__id_persona', 'sala_origen', 'sala_destino')

    data = [
        {
            "infante": str(t.infante),
            "ci": t.infante.id_persona.ci,
            "origen": t.sala_origen.descripcion if t.sala_origen else "N/A",
            "destino": t.sala_destino.descripcion if t.sala_destino else "N/A",
            "fecha": t.fecha.strftime("%d/%m/%Y %H:%M"),
            "motivo": t.motivo
        }
        for t in transferencias
    ]

    html = render_to_string("reporte_transferencias.html", {
        "transferencias": data,
        "fecha": timezone.now().strftime("%d/%m/%Y")
    })
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)



@api_view(["GET"])
def reporte_transferencias_por_sala(request, sala_id):
    try:
        sala = Sala.objects.get(id=sala_id)
    except Sala.DoesNotExist:
        return Response({"error": "Sala no encontrada"}, status=404)

    transferencias = TransferenciaSalaRegistro.objects.filter(
        models.Q(sala_origen=sala) | models.Q(sala_destino=sala)
    ).select_related("infante__id_persona")

    data = [
        {
            "infante": str(t.infante),
            "ci": t.infante.id_persona.ci,
            "origen": t.sala_origen.descripcion if t.sala_origen else "N/A",
            "destino": t.sala_destino.descripcion if t.sala_destino else "N/A",
            "fecha": t.fecha.strftime("%d/%m/%Y %H:%M"),
            "motivo": t.motivo
        }
        for t in transferencias
    ]

    html = render_to_string("reporte_transferencias.html", {
        "sala": sala.descripcion,
        "transferencias": data,
        "fecha": timezone.now().strftime("%d/%m/%Y")
    })
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)



#Tranferencias
@api_view(["GET"])
@permission_classes([AllowAny])
def reporte_transferencias(request):
    transferencias_infantes = TransferenciaInfante.objects.select_related("infante", "sala_origen", "sala_destino", "infante__id_persona")
    transferencias_profesores = TransferenciaProfesor.objects.select_related("profesor", "sala_origen", "sala_destino")

    context = {
        "fecha": timezone.now().strftime("%d/%m/%Y"),
        "transferencias_infantes": transferencias_infantes,
        "transferencias_profesores": transferencias_profesores,
    }

    html = render_to_string("reporte_transferencias.html", context)
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)



#Tranferencias views.py
#views.py profesor transferencia
class TransferenciaProfesorView(APIView):
    def post(self, request):
        serializer = TransferenciaProfesorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"mensaje": "Transferencia de profesor realizada correctamente."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#views.py tranferencia infante

class TransferenciaInfanteView(APIView):
    def post(self, request):
        serializer = TransferenciaSalaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"mensaje": "Transferencia de infante realizada correctamente."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

