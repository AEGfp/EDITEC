from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InfanteView,
    TutorView,
    TurnoView,
    SalaView,
    AnhoLectivoView,
  #  InscripcionView,
)

router = DefaultRouter()
router.register(r"infantes", InfanteView)
router.register(r"tutores", TutorView)
router.register(r"turnos", TurnoView)
router.register(r"salas", SalaView)
router.register(r"anhos", AnhoLectivoView)

urlpatterns = [
    path("", include(router.urls)),
]
