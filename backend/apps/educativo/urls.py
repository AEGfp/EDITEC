from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InfanteView,
    TransferenciaSalaView,
    TutorView,
    TurnoView,
    SalaView,
    AnhoLectivoView,
    salas_publicas,
    infantes_asignados,
   reporte_documentacion,
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
  #  path("infantes-asignados/", infantes_asignados),
    path("reporte-documentacion/<int:infante_id>/", reporte_documentacion, name="reporte_documentacion"),
    path("transferir-infante/", TransferenciaSalaView.as_view(), name="transferir-infante"),


]
