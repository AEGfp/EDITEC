from django.urls import path, include
from rest_framework import routers
from inscripciones import views
from inscripciones.views import verificar_usuario_email_ci


router = routers.DefaultRouter()
router.register(r"inscripciones", views.InscripcionView, "inscripciones")
router.register(r"periodos", views.PeriodoInscripcionViewSet, basename="periodo")


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
    # urls.py
    path("verificar-usuario-email/", verificar_usuario_email_ci),

]
