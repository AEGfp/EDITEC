from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import (
    authentication_classes,
    permission_classes,
    api_view,action
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import (
    InscripcionSerializer,
    InscripcionCompletaSerializer,
    InscripcionExistenteSerializer,
    PeriodoInscripcionSerializer
)
from .models import Inscripcion,PeriodoInscripcion
from Roles.roles import ControlarRoles
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.template.loader import render_to_string
from xhtml2pdf import pisa
import io
from django.db.models import Count
from django.http import HttpResponse


def desanidar_data(data):
    result = {}
    for key, value in data.items():
        if "." in key:
            top_key, sub_key = key.split(".", 1)
            if top_key not in result:
                result[top_key] = {}
            result[top_key][sub_key] = value
        else:
            result[key] = value
    return result


# Create your views here.
#!!! Cambiar permisos
@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
class InscripcionView(viewsets.ModelViewSet):
    serializer_class = InscripcionSerializer
    queryset = Inscripcion.objects.all()
    roles_permitidos = ["director", "administrador", "tutor"]

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name__in=["administrador", "director"]).exists():
            return Inscripcion.objects.all()

        try:
            tutor = user.persona.tutor
            return Inscripcion.objects.filter(id_tutor=tutor)
        except:
            return Inscripcion.objects.none()
    
    @action(detail=False, methods=["get"], url_path="actual")
    def filtrar_por_periodo(self, request):
        user = request.user
        id_periodo = request.query_params.get("id_periodo")
        if not id_periodo:
            return Response({"detail": "Se requiere id_periodo"}, status=400)

        if user.groups.filter(name__in=["administrador", "director"]).exists():
            queryset = Inscripcion.objects.filter(periodo_inscripcion_id=id_periodo)
        else:
            try:
                tutor = user.persona.tutor
                queryset = Inscripcion.objects.filter(id_tutor=tutor, periodo_inscripcion_id=id_periodo)
            except:
                queryset = Inscripcion.objects.none()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        user = request.user

        if "estado" in data:
            if not user.groups.filter(name__in=["administrador", "director"]).exists():
                raise PermissionDenied(
                    "No tienes permiso para cambiar el estado de una inscripción."
                )

            instance.usuario_auditoria = user
            instance.fecha_revision = timezone.now()
            instance.save()
        return super().update(request, *args, **kwargs)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def crear_inscripcion(request):
    serializer = InscripcionCompletaSerializer(
        data=request.data, context={"request": request}
    )
    if serializer.is_valid():
        inscripcion = serializer.save()
        return Response(
            {"id": inscripcion.id, "mensaje": "Inscripción creada exitosamente"},
            status=status.HTTP_201_CREATED,
        )
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def crear_inscripcion_existente(request):
    data = desanidar_data(request.data)
    serializer = InscripcionExistenteSerializer(data=data, context={"request": request})
    if serializer.is_valid():
        inscripcion = serializer.save()
        return Response(
            {"id": inscripcion.id, "mensaje": "Inscripción creada exitosamente"},
            status=status.HTTP_201_CREATED,
        )
    else:
        print(serializer.errors)
        return Response(
            {"errores": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

#@authentication_classes([JWTAuthentication])
#@permission_classes([ControlarRoles])
@authentication_classes([])
@permission_classes([AllowAny])
class PeriodoInscripcionViewSet(viewsets.ModelViewSet):
    queryset = PeriodoInscripcion.objects.all().order_by('-fecha_inicio')
    serializer_class = PeriodoInscripcionSerializer

    @action(detail=False, methods=['get'])
    def activo(self, request):
        ahora = timezone.now()

        PeriodoInscripcion.objects.filter(
        activo=True,
        fecha_fin__lt=ahora
    ).update(activo=False)
        activo_o_pendiente = PeriodoInscripcion.objects.filter(
            activo=True,
            fecha_fin__gte=ahora
        ).order_by('fecha_inicio').first()

        if activo_o_pendiente:
            serializer = self.get_serializer(activo_o_pendiente)
            return Response(serializer.data)
        return Response({"detail": "No hay periodo activo"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def cerrar(self, request, pk=None):
        periodo = self.get_object()
        
        if not periodo.activo:
            return Response(
                {"detail": "El periodo ya está cerrado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        periodo.activo = False
        
        periodo.save()
        
        serializer = self.get_serializer(periodo)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ultimo(self, request):
        ahora = timezone.now()
        periodo = PeriodoInscripcion.objects.filter(fecha_fin__lt=ahora).order_by('-fecha_fin').first()
        if periodo:
            serializer = self.get_serializer(periodo)
            return Response(serializer.data)
        return Response({"detail": "No hay periodos finalizados"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def puede_inscribirse(self, request):
        ahora = timezone.now()
        puede = PeriodoInscripcion.objects.filter(
            fecha_inicio__lte=ahora,
            fecha_fin__gte=ahora,
            activo=True
        ).exists()
        return Response({"puede_inscribirse": puede})


@permission_classes([AllowAny])
def generar_reporte_inscripciones(request):
    estado_filtro = request.GET.get("estado")
    fecha_desde = request.GET.get("fecha_desde")
    fecha_hasta = request.GET.get("fecha_hasta")
    id_tutor = request.GET.get("id_tutor")
    id_infante = request.GET.get("id_infante")

    inscripciones = Inscripcion.objects.all()

    if estado_filtro:
        inscripciones = inscripciones.filter(estado=estado_filtro)
    if fecha_desde:
        inscripciones = inscripciones.filter(fecha_inscripcion__gte=fecha_desde)
    if fecha_hasta:
        inscripciones = inscripciones.filter(fecha_inscripcion__lte=fecha_hasta)
    if id_tutor:
        inscripciones = inscripciones.filter(id_tutor=id_tutor)
    if id_infante:
        inscripciones = inscripciones.filter(id_infante=id_infante)

    resumen_estados = (
        inscripciones.values("estado").annotate(cantidad=Count("id")).order_by("estado")
    )

    total = sum(item["cantidad"] for item in resumen_estados)
    serializer = InscripcionSerializer(inscripciones, many=True)

    context = {
        "resumen_estados": resumen_estados,
        "total": total,
        "estado_filtro": estado_filtro,
        "detalles": serializer.data,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "id_tutor": id_tutor,
        "id_infante": id_infante,
    }
    html = render_to_string("inscripciones/reporte_inscripciones.html", context)

    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)
