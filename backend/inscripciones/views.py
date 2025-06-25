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
import requests
from django.utils import timezone
from django.template.loader import render_to_string
from django.db import transaction
from xhtml2pdf import pisa
import io
from django.conf import settings
from django.db.models import Count
from django.http import HttpResponse
from django.contrib.auth.models import Group
from api.models import Persona,User
from apps.educativo.models import Infante,Tutor, TutorInfante,Sala
from archivos.models import Archivos
from django.core.mail import send_mail
from django.conf import settings

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

def verificar_captcha(captcha_token):
    url = "https://www.google.com/recaptcha/api/siteverify"
    data = {
        "secret": settings.RECAPTCHA_SECRET_KEY, 
        "response": captcha_token,
    }
    try:
        response = requests.post(url, data=data)
        resultado = response.json()
        return resultado.get("success", False)
    except Exception as e:
        print("Error al verificar el captcha:", e)
        return False

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

    @action(detail=False, methods=['post'], url_path="limpiar-inscripciones")
    def limpiar_inscripciones(self, request):
        user = request.user
        print("Usuario:", user)
        if not user.groups.filter(name__in=["administrador", "director"]).exists():
            return Response({"detail": "No tiene permiso para ejecutar esta acción."}, status=403)

        id_periodo = request.query_params.get("id_periodo")

        if not id_periodo:
            return Response({"detail": "Debe proporcionar el 'id_periodo'."}, status=400)

        try:
            periodo = PeriodoInscripcion.objects.get(pk=id_periodo)
        except PeriodoInscripcion.DoesNotExist:
            return Response({"detail": "Periodo no encontrado."}, status=404)

        inscripciones_rechazadas = Inscripcion.objects.filter(estado__in=["rechazada", "pendiente"], periodo_inscripcion=periodo)
        contador = 0
        errores = []

        for insc in inscripciones_rechazadas:
            try:
                limpiar_inscripcion_rechazada(insc)
                contador += 1
            except Exception as e:
                return Response(
                    {"error": f"Ocurrió un error al limpiar la inscripción: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({
            "detail": f"Se limpiaron {contador} inscripciones rechazadas del periodo {periodo.id}.",
            "errores": errores if errores else "Sin errores."
        })

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        user = request.user

        if "estado" in data:
            if not user.groups.filter(name__in=["administrador", "director"]).exists():
                raise PermissionDenied(
                    "No tienes permiso para cambiar el estado de una inscripción."
                )

            nuevo_estado = data["estado"]
            infante = instance.id_infante
            tutor = instance.id_tutor

            instance.estado = nuevo_estado
            instance.usuario_auditoria = user
            instance.fecha_revision = timezone.now()
            instance.save()

            if nuevo_estado == "aprobada":
                infante.activo = True
                tutor.activo = True
            elif nuevo_estado == "rechazada":
                infante.activo = Inscripcion.objects.filter(
                    id_infante=infante, estado="aprobada"
                ).exclude(pk=instance.pk).exists()

                tutor.activo = TutorInfante.objects.filter(
                    tutor=tutor, infante__activo=True
                ).exclude(infante=infante).exists()
                if not infante.activo:
                    infante.id_sala = None
            infante.save()
            tutor.save()
        enviar_estado_inscripcion(instance)
        return super().update(request, *args, **kwargs)

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def crear_inscripcion(request):
    captcha_token = request.data.get("captcha_token")

    if not captcha_token or not verificar_captcha(captcha_token):
        return Response(
            {"detail": "Captcha inválido. Por favor completá el reCAPTCHA correctamente."},
            status=status.HTTP_400_BAD_REQUEST,
        )

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

        periodo = PeriodoInscripcion.objects.filter(
            activo=True,
            fecha_inicio__lte=ahora,
            fecha_fin__gte=ahora
        ).order_by('fecha_inicio').first()

        if not periodo:
            periodo = PeriodoInscripcion.objects.order_by('-fecha_inicio').first()

        if periodo:
            serializer = self.get_serializer(periodo)
            return Response(serializer.data)

        return Response({"detail": "No hay periodos disponibles"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def cerrar(self, request, pk=None):
        periodo = self.get_object()
        
        if not periodo.activo:
            return Response(
                {"detail": "El periodo ya está cerrado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ahora = timezone.now()
        
        if periodo.fecha_fin > ahora:
            periodo.fecha_fin = ahora

        periodo.activo = False
        periodo.save()
        
        serializer = self.get_serializer(periodo)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ultimo(self, request):
        ahora = timezone.now()

        periodo_activo = PeriodoInscripcion.objects.filter(
            activo=True,
            fecha_inicio__lte=ahora,
            fecha_fin__gte=ahora
        ).order_by('fecha_inicio').first()

        if periodo_activo:
            serializer = self.get_serializer(periodo_activo)
            return Response(serializer.data)

        periodo_finalizado = PeriodoInscripcion.objects.filter(
            fecha_fin__lt=ahora
        ).order_by('-fecha_fin').first()

        if periodo_finalizado:
            serializer = self.get_serializer(periodo_finalizado)
            return Response(serializer.data)

        return Response({"detail": "No hay periodos disponibles"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def puede_inscribirse(self, request):
        ahora = timezone.now()
        periodo = PeriodoInscripcion.objects.filter(
            fecha_inicio__lte=ahora,
            fecha_fin__gte=ahora,
            activo=True
        ).first()

        if not periodo:
            return Response({"puede_inscribirse": False})

        salas_existentes = Sala.objects.filter(periodo_inscripcion=periodo).exists()

        return Response({
            "puede_inscribirse": salas_existentes
        })




@permission_classes([AllowAny])
def generar_reporte_inscripciones(request):
    estado_filtro = request.GET.get("estado_filtro")
    fecha_desde = request.GET.get("fecha_desde")
    fecha_hasta = request.GET.get("fecha_hasta")
    id_tutor = request.GET.get("id_tutor")
    id_infante = request.GET.get("id_infante")

    ahora = timezone.now()
    periodo = PeriodoInscripcion.objects.filter(
        activo=True,
        fecha_inicio__lte=ahora,
        fecha_fin__gte=ahora
    ).order_by("fecha_inicio").first()
    print(periodo)
    if not periodo:
        periodo = PeriodoInscripcion.objects.filter(
            fecha_fin__lt=ahora
        ).order_by("-fecha_fin").first()

    if not periodo:
        return HttpResponse("No hay periodos disponibles", status=400)

    inscripciones = Inscripcion.objects.filter(periodo_inscripcion=periodo)
    total =inscripciones.count() 
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
    
    serializer = InscripcionSerializer(inscripciones, many=True)

    resumen_completo = []
    if total > 0:
        for item in resumen_estados:
            estado = item["estado"]
            cantidad = item["cantidad"]
            porcentaje = round((cantidad / total) * 100, 2)
            resumen_completo.append({
                "estado": estado,
                "cantidad": cantidad,
                "porcentaje": porcentaje,
            })
    else:
        resumen_completo = [
            {"estado": "pendiente", "cantidad": 0, "porcentaje": 0},
            {"estado": "aprobada", "cantidad": 0, "porcentaje": 0},
            {"estado": "rechazada", "cantidad": 0, "porcentaje": 0},
        ]

    context = {
        "resumen_completo": resumen_completo,
        "total": total,
        "estado_filtro": estado_filtro,
        "detalles": serializer.data,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "id_tutor": id_tutor,
        "id_infante": id_infante,
        "periodo": periodo,
    }

    html = render_to_string("inscripciones/reporte_inscripciones.html", context)

    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")
    return HttpResponse("Error al generar PDF", status=500)




def enviar_estado_inscripcion(inscripcion):
    tutor = inscripcion.id_tutor
    infante = inscripcion.id_infante
    estado = inscripcion.estado

    nombre_tutor = f"{tutor.id_persona.nombre} {tutor.id_persona.apellido}"
    nombre_infante = f"{infante.id_persona.nombre} {infante.id_persona.apellido}"

    if estado == "aprobada":
        asunto = "️Inscripción Aprobada"
        mensaje = f"""
Estimado/a {nombre_tutor},

Nos complace informarle que la inscripción del infante {nombre_infante} ha sido **APROBADA**.

El infante ya se encuentra activo en el sistema y asignado a su sala correspondiente.

¡Muchas gracias por confiar en nosotros!

Atentamente,
Equipo Administrativo
"""
    elif estado == "rechazada":
        asunto = "❌ Inscripción Rechazada"
        mensaje = f"""
Estimado/a {nombre_tutor},

Le informamos que la inscripción del infante {nombre_infante} ha sido **RECHAZADA**.

Por favor, póngase en contacto con la administración para obtener más detalles o resolver cualquier inconveniente.

Atentamente,
Equipo Administrativo
"""
    else:
        return

    user = getattr(tutor.id_persona, "user", None)
    email = getattr(user, "email", None) if user else None

    if not email:
        print(f"️Tutor {nombre_tutor} no tiene email asociado.")
        return

    send_mail(
        subject=asunto,
        message=mensaje,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

@transaction.atomic
def limpiar_inscripcion_rechazada(inscripcion):
    if inscripcion.estado == 'aprobada':
        raise ValueError("No se pueden eliminar inscripciones aprobadas.")
    print("Limpiando inscripción:", inscripcion.id)
    tutor = inscripcion.id_tutor
    infante = inscripcion.id_infante
    persona_infante = infante.id_persona
    persona_tutor = tutor.id_persona
    usuario = persona_tutor.user  
    Archivos.objects.filter(persona=persona_infante).delete()

    TutorInfante.objects.filter(tutor=tutor, infante=infante).delete()

    inscripcion.delete()
    print("Inscripción eliminada:", inscripcion.id)
    infante.delete()
    persona_infante.delete()  
    print("Infante y persona eliminados:", infante.id, persona_infante.id)
    tiene_otro_infante = TutorInfante.objects.filter(tutor=tutor).exists()
    tiene_otras_inscripciones = Inscripcion.objects.filter(id_tutor=tutor).exists()

    if not tiene_otro_infante and not tiene_otras_inscripciones:
        tutor.delete()

        if usuario:
            try:
                grupo_tutor = Group.objects.get(name="tutor")
                usuario.groups.remove(grupo_tutor)
            except Group.DoesNotExist:
                pass

            if usuario.groups.count() == 0 and User.objects.filter(pk=usuario.pk).exists():
                usuario.delete()
        else:
            persona_tutor.delete()

#Agregar vista de validacion ci, user, email
@api_view(["GET"])
@permission_classes([AllowAny])
def verificar_usuario_email_ci(request):
    username = request.GET.get("username")
    email = request.GET.get("email")
    ci = request.GET.get("ci")

    response = {}

    if username:
        response["username_existente"] = User.objects.filter(username=username).exists()
    if email:
        response["email_existente"] = User.objects.filter(email=email).exists()
    if ci:
        response["ci_existente"] = Persona.objects.filter(ci=ci).exists()

    return Response(response)
