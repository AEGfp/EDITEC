from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
AsistenciaView,
InfantesAsignadosConAsistenciaView,
generar_reporte_asistencias
)

router = DefaultRouter()
router.register(r"asistencias", AsistenciaView)


urlpatterns = [
    path("", include(router.urls)),
    path("infantes-asignados/", InfantesAsignadosConAsistenciaView.as_view(),name="infantes-asignados"),
    path(
        "reporte-asistencias/",
        generar_reporte_asistencias,
        name="reporte_asistencias.pdf",
    ),
]
