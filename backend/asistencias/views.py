from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes,authentication_classes,action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializer import AsistenciaSerializer,InfanteConAsistenciaSerializer
from .models import Asistencia
from Roles.roles import ControlarRoles
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.educativo.models import Infante, Sala
from django.utils.timezone import now,localtime
from datetime import date
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db.models import Count
import io
from xhtml2pdf import pisa
from apps.educativo.models import Tutor
from rest_framework import status
# Create your views here.
#! Cambiar permisos
@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
#@permission_classes([AllowAny])
class AsistenciaView(viewsets.ModelViewSet):
    roles_permitidos=["director","profesor","tutor"]
    queryset=Asistencia.objects.all()
    serializer_class=AsistenciaSerializer

    def get_queryset(self):
        user = self.request.user
        persona = getattr(user, "persona", None)
        grupos = set(user.groups.values_list("name", flat=True))
        periodo_id = self.request.query_params.get("id_periodo")

        qs = Asistencia.objects.select_related("id_infante")

        if periodo_id:
            qs = qs.filter(id_infante__periodo_inscripcion=periodo_id)

        if "director" in grupos:
            return qs

        infantes_ids = set()

        if "profesor" in grupos and persona:
            salas = Sala.objects.filter(profesor_encargado=persona)
            ids_profesor = Infante.objects.filter(
                id_sala__in=salas, periodo_inscripcion=periodo_id
            ).values_list("id", flat=True)
            infantes_ids.update(ids_profesor)

        if "tutor" in grupos and persona:
            try:
                tutor = Tutor.objects.get(id_persona=persona)
                ids_tutor = Infante.objects.filter(
                    tutores__tutor=tutor, periodo_inscripcion=periodo_id
                ).values_list("id", flat=True)
                infantes_ids.update(ids_tutor)
            except Tutor.DoesNotExist:
                pass

        return qs.filter(id_infante_id__in=infantes_ids).distinct()
    
    @action(detail=True, methods=["post"], url_path="marcar-salida" )
    def marcar_salida(self, request, pk=None):
        usuario = request.user
        try:
            asistencia = self.get_object() 
        except Asistencia.DoesNotExist:
            return Response({"error": "No se encontró la asistencia"}, status=404)

        asistencia.hora_salida = localtime(now()).time()
        asistencia.usuario_auditoria = usuario
        asistencia.save()

        serializer = self.get_serializer(asistencia)
        return Response(serializer.data, status=200)



@permission_classes([ControlarRoles])  
class InfantesAsignadosConAsistenciaView(APIView):
    roles_permitidos = ["director", "profesor"]    
    def get(self, request):
        usuario = request.user
        persona = getattr(usuario, "persona", None)
        ahora = localtime().time()
        periodo_id = request.query_params.get("id_periodo", None)

        if not persona:
            return Response({"error": "El usuario no tiene una persona asociada"}, status=400)

        salas = Sala.objects.filter(
            hora_entrada__lte=ahora,
            hora_salida__gte=ahora,
            periodo_inscripcion=periodo_id
        )

        if not usuario.groups.filter(name="director").exists():
            salas = salas.filter(profesor_encargado=persona)

        infantes = Infante.objects.filter(
            id_sala__in=salas,
            periodo_inscripcion=periodo_id,
            activo=True
        )

        serializer = InfanteConAsistenciaSerializer(infantes, many=True)
        return Response(serializer.data)


def calcular_edad(fecha_nac):
    if not fecha_nac:
        return None
    hoy = date.today()
    edad = hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))
    return edad if edad >= 0 else None

@api_view(["GET"])
def generar_reporte_asistencias(request):
    #! revisar que sea su hijo
    usuario = request.user
    if not usuario.is_authenticated or not usuario.groups.filter(name__in=["director","profesor","tutor"]).exists():
        return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN) 

    fecha_desde = request.GET.get("fecha_desde")
    fecha_hasta = request.GET.get("fecha_hasta")
    id_infante = request.GET.get("id_infante")
    estado = request.GET.get("estado")

    asistencias = Asistencia.objects.all()

    if not id_infante and not fecha_desde and not fecha_hasta:
        hoy = date.today()
        asistencias = asistencias.filter(fecha=hoy)
    else:
        if fecha_desde:
            asistencias = asistencias.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            asistencias = asistencias.filter(fecha__lte=fecha_hasta)

    if id_infante:
        asistencias = asistencias.filter(id_infante=id_infante)

        resumen_estados = (
            asistencias.values("estado")
            .annotate(cantidad=Count("id"))
            .order_by("estado")
        )
        total = sum(item["cantidad"] for item in resumen_estados)
        serializer = AsistenciaSerializer(asistencias, many=True)

        if asistencias.exists():
            primer_asistencia = asistencias.first()
            persona = primer_asistencia.id_infante.id_persona
            fecha_nac = getattr(persona, "fecha_nacimiento", None)
            fecha_nacimiento_str = fecha_nac.strftime("%d/%m/%Y") if fecha_nac else ""
            infante_info = {
                "nombre_completo": f"{persona.nombre} {persona.apellido}",
                "ci": getattr(persona, "ci", ""),
                "fecha_nacimiento":fecha_nacimiento_str, 
                "edad": calcular_edad(getattr(persona, "fecha_nacimiento", None)),
                "sala": getattr(primer_asistencia.id_infante.id_sala, "nombre", ""),
            }
        else:
            infante_info = {}

        fecha_hoy= date.today().strftime("%d/%m/%Y")
        context = {
            "resumen_estados": resumen_estados,
            "total": total,
            "detalles": serializer.data,
            "fecha_desde": fecha_desde,
            "fecha_hasta": fecha_hasta,
            "id_infante": id_infante,
            "estado": estado,
            "infante": infante_info,
            "fecha_hoy":fecha_hoy,
        }

        template = "reporte_asistencias_detallado.html"

    else:
        resumen_estados = (
            asistencias.values("estado")
            .annotate(cantidad=Count("id"))
            .order_by("estado")
        )
        total = sum(item["cantidad"] for item in resumen_estados)
        serializer = AsistenciaSerializer(asistencias, many=True)

        context = {
            "resumen_estados": resumen_estados,
            "total": total,
            "detalles": serializer.data,
            "fecha_desde": fecha_desde,
            "fecha_hasta": fecha_hasta,
            "id_infante": None,
            "estado": estado,
        }

        template = "reporte_asistencias_general.html"

    html = render_to_string(template, context)
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)

'''
@api_view(["POST"])
@permission_classes([AllowAny])
def marcar_salida(request):
    usuario = request.user
    id_infante = request.data.get("id_infante")

    if not id_infante:
        return Response({"error": "Falta el id_infante"}, status=400)

    hoy = localtime(now()).date()

    try:
        asistencia = Asistencia.objects.get(id_infante=id_infante, fecha=hoy)
    except Asistencia.DoesNotExist:
        return Response({"error": "No hay asistencia registrada para hoy"}, status=404)

    if asistencia.hora_salida:
        return Response({"error": "La salida ya fue registrada"}, status=400)

    data = {
        "hora_salida": localtime(now()).time()
    }

    serializer = AsistenciaSerializer(asistencia, data=data, partial=True, context={"request": request})

    if serializer.is_valid():
        instancia = serializer.save(usuario_auditoria=usuario)
        return Response(AsistenciaSerializer(instancia).data, status=200)

    return Response(serializer.errors, status=400)

'''