from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InfanteView,
    TutorView,
    TurnoView,
    SalaView,
    AnhoLectivoView,
    salas_publicas,
    infantes_asignados,
   reporte_documentacion,
  # TransferenciaProfesorView,
   reporte_asignacion_aulas,
    TransferenciaInfanteView,
    TransferenciaProfesorView,
 #   reporte_transferencias_por_sala,

    generar_reporte_transferencias,
)

router = DefaultRouter()
router.register(r"infantes", InfanteView)
router.register(r"tutores", TutorView)
router.register(r"turnos", TurnoView)
router.register(r"salas", SalaView)
router.register(r"anhos", AnhoLectivoView)


urlpatterns = [
    path("", include(router.urls)),
    path("salas-publicas/", salas_publicas),
 #   path("infantes-asignados/", infantes_asignados),
    path("reporte-documentacion/<int:infante_id>/", reporte_documentacion, name="reporte_documentacion"),
    path("transferir-infante/", TransferenciaInfanteView.as_view(), name="transferir-infante"),
    path("transferir-profesor/", TransferenciaProfesorView.as_view(), name="transferir-profesor"),
    path("reporte-asignacion-aulas/", reporte_asignacion_aulas, name="reporte_asignacion_aulas"),
  #  path("reporte-transferencias/<int:sala_id>/", reporte_transferencias_por_sala, name="reporte_transferencias_por_sala"),
    path("reporte-transferencias/", generar_reporte_transferencias, name="reporte_transferencias"),


]
