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

# Create your views here.
#! Cambiar permisos
#@authentication_classes([JWTAuthentication])
#@permission_classes([ControlarRoles])
@permission_classes([AllowAny])
class AsistenciaView(viewsets.ModelViewSet):
   # roles_permitidos=["director","administrador","profesor"]
    queryset=Asistencia.objects.all()
    serializer_class=AsistenciaSerializer

    @action(detail=True, methods=["post"], url_path="marcar-salida", permission_classes=[AllowAny])
    def marcar_salida(self, request, pk=None):
        usuario = request.user
        try:
            asistencia = self.get_object()  # ya obtiene por `pk`
        except Asistencia.DoesNotExist:
            return Response({"error": "No se encontró la asistencia"}, status=404)

        asistencia.hora_salida = localtime(now()).time()
        asistencia.usuario_auditoria = usuario
        asistencia.save()

        serializer = self.get_serializer(asistencia)
        return Response(serializer.data, status=200)

@permission_classes([AllowAny])  
class InfantesAsignadosConAsistenciaView(APIView):
    def get(self, request):
        usuario = request.user
        persona = getattr(usuario, "persona", None)
        ahora=localtime().time()

        if not persona:
            return Response({"error": "El usuario no tiene una persona asociada"}, status=400)

        if usuario.groups.filter(name="director").exists():
            infantes = Infante.objects.all()
        else:
            salas = Sala.objects.filter(profesor_encargado=persona, hora_entrada__lte=ahora, hora_salida__gte=ahora)
            infantes = Infante.objects.filter(id_sala__in=salas)


        serializer = InfanteConAsistenciaSerializer(infantes, many=True)
        return Response(serializer.data)


def calcular_edad(fecha_nac):
    if not fecha_nac:
        return None
    hoy = date.today()
    edad = hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))
    return edad if edad >= 0 else None

@api_view(["GET"])
@permission_classes([AllowAny])
def generar_reporte_asistencias(request):
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