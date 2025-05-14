from django.urls import path, include
from rest_framework import routers
from inscripciones import views

router = routers.DefaultRouter()
router.register(r"inscripciones", views.InscripcionView, "inscripciones")

urlpatterns = [
    path("", include(router.urls)),
]
