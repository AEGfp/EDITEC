# apps/notificaciones/urls.py
from django.urls import path
from .views import NotificacionCreateView, NotificacionListView , NotificacionDetailView

urlpatterns = [
    path("", NotificacionCreateView.as_view(), name="crear-notificacion"),
    path("listar/", NotificacionListView.as_view(), name="listar-notificaciones"),
    path("<int:pk>/", NotificacionDetailView.as_view(), name="detalle-notificacion"),  # <- esta línea nueva


]
