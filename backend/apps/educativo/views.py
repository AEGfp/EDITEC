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
from django.db.models import Q
from rest_framework import serializers

class InfanteView(viewsets.ModelViewSet):
    queryset = Infante.objects.all()  
    serializer_class = InfanteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        persona = getattr(user, "persona", None)
        grupos = set(user.groups.values_list("name", flat=True))

        periodo_id = self.request.query_params.get("id_periodo")
        incluir_inactivos = self.request.query_params.get("incluir_inactivos", "false").lower() == "true" 
        qs = Infante.objects.all()

        if periodo_id:
            try:
                periodo_id_int = int(periodo_id)
                qs = qs.filter(periodo_inscripcion_id=periodo_id_int)
            except (ValueError, TypeError):
                pass

        # ✅ Director y administrador ven todos los infantes, sin filtrar por "activo"
        if "director" in grupos or "administrador" in grupos:
            if incluir_inactivos:
                return qs
            return qs.filter(activo=True)

        infantes_qs = Infante.objects.none()

        if "profesor" in grupos and persona:
            salas = Sala.objects.filter(profesor_encargado=persona)
            infantes_qs = infantes_qs | qs.filter(activo=True, id_sala__in=salas)

        if "tutor" in grupos and persona:
            try:
                tutor = Tutor.objects.get(id_persona=persona)
                infantes_qs = infantes_qs | qs.filter(tutores__tutor=tutor)
            except Tutor.DoesNotExist:
                pass

        return infantes_qs.distinct()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InfanteCreateUpdateSerializer
        return InfanteSerializer

    def get_serializer_context(self):
        return {"request": self.request}

class InfantesActivosView(viewsets.ModelViewSet):
    queryset = Infante.objects.all()  
    serializer_class = InfanteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        persona = getattr(user, "persona", None)
        grupos = set(user.groups.values_list("name", flat=True))

        periodo_id = self.request.query_params.get("id_periodo")
        incluir_inactivos = self.request.query_params.get("incluir_inactivos", "false").lower() == "true"

        qs = Infante.objects.all()

        if periodo_id:
            try:
                periodo_id_int = int(periodo_id)
                qs = qs.filter(periodo_inscripcion_id=periodo_id_int)
            except (ValueError, TypeError):
                pass

        if "director" in grupos or "administrador" in grupos:
            if incluir_inactivos:
                return qs
            return qs.filter(activo=True)
        
        infantes_qs = Infante.objects.none()

        if "profesor" in grupos and persona:
            salas = Sala.objects.filter(profesor_encargado=persona)
            infantes_qs = infantes_qs | qs.filter(activo=True, id_sala__in=salas)

        if "tutor" in grupos and persona:
            try:
                tutor = Tutor.objects.get(id_persona=persona)
                infantes_qs = infantes_qs | qs.filter(tutores__tutor=tutor)
            except Tutor.DoesNotExist:
                pass

        return infantes_qs.distinct()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InfanteCreateUpdateSerializer
        return InfanteSerializer

    def get_serializer_context(self):
        return {"request": self.request}



#class TutorView(viewsets.ModelViewSet):
#    queryset = Tutor.objects.all()
#    es_el_usuario = serializers.SerializerMethodField()

class TutorView(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    es_el_usuario = serializers.SerializerMethodField()

    def get_permissions(self):
        # Permitir a todos acceder al detalle (retrieve)
        if self.action == "retrieve":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        persona = getattr(user, "persona", None)
        grupos = set(user.groups.values_list("name", flat=True))

        qs = Tutor.objects.all()
        incluir_inactivos = self.request.query_params.get("incluir_inactivos", "false").lower() == "true" 
        periodo_id = self.request.query_params.get("id_periodo")

        if periodo_id:
            try:
                periodo_id_int = int(periodo_id)
                qs = qs.filter(tutorados__infante__periodo_inscripcion_id=periodo_id_int)
            except (ValueError, TypeError):
                pass

        # ✅ Director y administrador ven todos los tutores sin filtro por "activo"
        if "director" in grupos or "administrador" in grupos:
            if incluir_inactivos:
                return qs.distinct()
            return qs.filter(activo=True).distinct()


        filtros = Q()

        if "tutor" in grupos and persona:
            filtros |= Q(id_persona=persona)

        if "profesor" in grupos and persona:
            salas_profesor = Sala.objects.filter(profesor_encargado=persona)
            infantes_activos = Infante.objects.filter(id_sala__in=salas_profesor, activo=True)
            tutores_ids = TutorInfante.objects.filter(
                infante__in=infantes_activos
            ).values_list("tutor_id", flat=True)
            filtros |= Q(id__in=tutores_ids)

        return qs.filter(filtros).distinct()

    def get_es_el_usuario(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request.user, "persona"):
            return False
        return obj.id_persona == request.user.persona

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TutorCreateUpdateSerializer
        return TutorSerializer

    def perform_update(self, serializer):
        tutor = self.get_object()
        if self.request.user != tutor.id_persona.user:
            raise PermissionDenied("No tenés permiso para editar este tutor.")
        serializer.save()

class TutorActivoView(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    es_el_usuario = serializers.SerializerMethodField()

    def get_permissions(self):
        # Permitir a todos acceder al detalle (retrieve)
        if self.action == "retrieve":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        persona = getattr(user, "persona", None)
        grupos = set(user.groups.values_list("name", flat=True))

        qs = Tutor.objects.all()
        periodo_id = self.request.query_params.get("id_periodo")

        if periodo_id:
            try:
                periodo_id_int = int(periodo_id)
                qs = qs.filter(tutorados__infante__periodo_inscripcion_id=periodo_id_int)
            except (ValueError, TypeError):
                pass

        # ✅ Director y administrador ven todos los tutores sin filtro por "activo"
        if "director" in grupos or "administrador" in grupos:
            return qs.filter(activo=True).distinct()


        filtros = Q()

        if "tutor" in grupos and persona:
            filtros |= Q(id_persona=persona)

        if "profesor" in grupos and persona:
            salas_profesor = Sala.objects.filter(profesor_encargado=persona)
            infantes_activos = Infante.objects.filter(id_sala__in=salas_profesor, activo=True)
            tutores_ids = TutorInfante.objects.filter(
                infante__in=infantes_activos
            ).values_list("tutor_id", flat=True)
            filtros |= Q(id__in=tutores_ids)

        return qs.filter(filtros).distinct()

    def get_es_el_usuario(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request.user, "persona"):
            return False
        return obj.id_persona == request.user.persona

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
    'tutores': tutores_data,  
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

'''
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
'''
#Vista para salas con periodo
@api_view(["GET"])
@permission_classes([AllowAny])
def reporte_asignacion_aulas(request):
    periodo_id = request.GET.get("periodo_id")

    salas = Sala.objects.select_related("profesor_encargado").prefetch_related("infantes__id_persona")

    if periodo_id and periodo_id.isdigit():
        salas = salas.filter(periodo_inscripcion_id=int(periodo_id))

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

    html = render_to_string("reporte_asignacion_aulas.html", {
        "salas": data,
        "fecha": timezone.now().strftime("%d/%m/%Y")
    })
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)


##REPORTE DE TRANSFERENCIAS POR PERIODO
from django.db.models import Q

@api_view(["GET"])
@permission_classes([AllowAny])
def generar_reporte_transferencias(request):
    from apps.educativo.models import PeriodoInscripcion

    periodo_id = request.GET.get("periodo_id")
    periodo = None

    if periodo_id and periodo_id.isdigit():
        periodo = PeriodoInscripcion.objects.filter(id=periodo_id).first()
    else:
        periodo = PeriodoInscripcion.objects.filter(activo=True).order_by("-id").first()

    if not periodo:
        return HttpResponse("No se encontró un período activo o válido.", status=400)

    transferencias_infantes = TransferenciaInfante.objects.select_related(
        "infante__id_persona", "sala_origen", "sala_destino"
    ).filter(
        infante__periodo_inscripcion=periodo
    )

    transferencias_profesores = TransferenciaProfesor.objects.select_related(
        "profesor", "sala_origen", "sala_destino"
    ).filter(
        Q(sala_origen__periodo_inscripcion=periodo) |
        Q(sala_destino__periodo_inscripcion=periodo)
    )

    html = render_to_string("reporte_transferencias.html", {
        "fecha": timezone.now().strftime("%d/%m/%Y"),
        "transferencias_infantes": transferencias_infantes,
        "transferencias_profesores": transferencias_profesores,
    })

    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)







'''
#reporte_transferencias_por_sala modificada para incluir filtro por periodo_id
@api_view(["GET"])
def reporte_transferencias_por_sala(request, sala_id):
    try:
        sala = Sala.objects.get(id=sala_id)
    except Sala.DoesNotExist:
        return Response({"error": "Sala no encontrada"}, status=404)

    periodo_id = request.GET.get("periodo_id")

    transferencias = TransferenciaSalaRegistro.objects.filter(
        models.Q(sala_origen=sala) | models.Q(sala_destino=sala)
    ).select_related("infante__id_persona")

    if periodo_id and periodo_id.isdigit():
        transferencias = transferencias.filter(infante__periodo_inscripcion_id=periodo_id)

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
'''




#Tranferencias

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

