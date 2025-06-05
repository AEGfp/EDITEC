from django.urls import path, include
from rest_framework import routers
from inscripciones import views

router = routers.DefaultRouter()
router.register(r"inscripciones", views.InscripcionView, "inscripciones")

urlpatterns = [
    path("", include(router.urls)),
    path("inscripciones-crear/", views.crear_inscripcion, name="crear_inscripcion"),
    path(
        "inscripciones-crear-existente/",
        views.crear_inscripcion_existente,
        name="crear_inscripcion_existente",
    ),
    path(
        "reporte-inscripciones/",
        views.generar_reporte_inscripciones,
        name="reporte_inscripciones_pdf",
    ),
]
