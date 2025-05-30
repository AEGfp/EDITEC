from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mass_mail
from .models import Notificacion
from .serializers import NotificacionSerializer
from apps.educativo.models import Tutor
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
import logging

logger = logging.getLogger(__name__)  # Para logging de errores


def enviar_notificacion_por_correo(notificacion):
    """
    Envía la notificación a todos los tutores con correo electrónico válido.
    """
    tutores = Tutor.objects.exclude(email__isnull=True).exclude(email__exact='').distinct()
    mensajes = []

    for tutor in tutores:
        mensajes.append((
            f"[Notificación] {notificacion.titulo}",
            notificacion.contenido,
            "noreply@guarderia.com",
            [tutor.email],
        ))

    if mensajes:
        send_mass_mail(mensajes, fail_silently=False)


class NotificacionCreateView(APIView):
    def post(self, request):
        serializer = NotificacionSerializer(data=request.data)
        if serializer.is_valid():
            notificacion = serializer.save()
            enviar_notificacion_por_correo(notificacion)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        logger.error("Error al crear notificación: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificacionListView(ListAPIView):
    queryset = Notificacion.objects.all().order_by('-fecha_envio')
    serializer_class = NotificacionSerializer


class NotificacionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        
        logger.error("Error al actualizar notificación %s: %s", instance.id, serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
