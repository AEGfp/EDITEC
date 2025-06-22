from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from Roles.roles import ControlarRoles
from .models import TipoInforme, Indicador, Informe, InformeIndicador
from .serializers import (
    TipoInformeSerializer,
    IndicadorSerializer,
    InformeSerializer,
    InformeIndicadorSerializer,
)
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db.models import Count
import io
from xhtml2pdf import pisa
from apps.educativo.models import Tutor, Infante
from django.db.models import Q
# View para tipos de informe
@permission_classes([AllowAny])
class TipoInformeView(viewsets.ModelViewSet):
    serializer_class = TipoInformeSerializer
    queryset = TipoInforme.objects.all()


# View para indicadores
@permission_classes([AllowAny])
class IndicadorView(viewsets.ModelViewSet):
    serializer_class = IndicadorSerializer
    queryset = Indicador.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['id_tipo_informe'] # Para poder usar ?id_tipo_informe=x

# View para informes
@authentication_classes([JWTAuthentication])
@permission_classes([ControlarRoles])
class InformeView(viewsets.ModelViewSet):
    serializer_class = InformeSerializer
    roles_permitidos = ["director", "profesor", "tutor"]
    queryset = Informe.objects.all()

    def get_queryset(self):
        user = self.request.user
        periodo_id = self.request.query_params.get("id_periodo")
        persona = getattr(user, "persona", None)
        grupos = set(user.groups.values_list("name", flat=True))

        queryset = Informe.objects.all()

        if periodo_id:
            queryset = queryset.filter(id_infante__periodo_inscripcion_id=periodo_id)

        # Acceso total
        if "director" in grupos or "administrador" in grupos:
            return queryset

        filtros = Q()

        # Profesor: infantes en salas a su cargo
        if "profesor" in grupos and persona:
            filtros |= Q(id_infante__id_sala__profesor_encargado=persona)

        # Tutor: infantes vinculados como tutor
        if "tutor" in grupos:
            try:
                tutor = Tutor.objects.get(id_persona=persona)
                filtros |= Q(id_infante__tutores__tutor=tutor)
            except Tutor.DoesNotExist:
                pass

        return queryset.filter(filtros).distinct()



# View para tabla intermedia informe indicadores
@permission_classes([AllowAny])
class InformeIndicadorView(viewsets.ModelViewSet):
    serializer_class = InformeIndicadorSerializer
    queryset = InformeIndicador.objects.all()

@api_view(["GET"])
@permission_classes([AllowAny])
def generar_reporte_informe(request):
    id_reporte = request.GET.get("id")
    try:
        informe = Informe.objects.select_related("id_usuario_aud", "id_infante__id_persona", "id_tipo_informe").get(id=id_reporte)
    except Informe.DoesNotExist:
        return HttpResponse("Informe no encontrado", status=404)

    serializer = InformeSerializer(informe)
    contexto = {
        "informe": serializer.data
    }
    print(contexto)
    html = render_to_string("reporte_informe.html", contexto)
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), dest=result)

    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type="application/pdf")

    return HttpResponse("Error al generar PDF", status=500)
