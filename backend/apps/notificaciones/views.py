from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mass_mail
from .models import Notificacion
from .serializers import NotificacionSerializer
from apps.educativo.models import Tutor, Infante, TutorInfante, Sala
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
import logging
from pprint import pprint
import ast

logger = logging.getLogger(__name__)

def enviar_notificacion_por_correo(notificacion):
    salas_dest = notificacion.salas_destinatarias.all()
    salas_excluidas = notificacion.salas_excluidas.all()

    ids_dest = set(salas_dest.values_list("id", flat=True))
    ids_excluir = set(salas_excluidas.values_list("id", flat=True))

    if ids_dest:
        ids_finales = ids_dest - ids_excluir
    else:
        all_salas = set(Sala.objects.values_list("id", flat=True))
        ids_finales = all_salas - ids_excluir

    logger.info(f"🧮 Salas finales: {ids_finales}")

    infantes = Infante.objects.filter(id_sala_id__in=ids_finales)

    tutor_ids = TutorInfante.objects.filter(
        infante__in=infantes
    ).values_list("tutor_id", flat=True)

    tutores = Tutor.objects.filter(
        id__in=tutor_ids
    ).select_related("id_persona__user").distinct()

    mensajes = []
    for tutor in tutores:
        user = getattr(tutor.id_persona, "user", None)
        if user and user.email:
            mensajes.append((
                f"[Notificación] {notificacion.titulo}",
                notificacion.contenido,
                "noreply@guarderia.com",
                [user.email],
            ))
            logger.info(f"Enviando correo a: {user.email}")
        else:
            logger.warning(f"Tutor sin email o usuario: {tutor}")

    if mensajes:
        try:
            send_mass_mail(mensajes, fail_silently=False)
            logger.info(f"Correos enviados: {len(mensajes)}")
        except Exception as e:
            logger.error(f"Error al enviar correos: {e}")
    else:
        logger.warning("No se encontraron destinatarios con correo.")

class NotificacionCreateView(APIView):
    def post(self, request):
        return self._guardar_notificacion(request)

    def _guardar_notificacion(self, request, instance=None):
        data = request.data.copy()

        logger.info("📥 request.data recibido:")
        pprint(data)

        def parse_lista(valor):
            if isinstance(valor, list):
                return [int(i) for i in valor]
            if isinstance(valor, str):
                try:
                    return [int(i) for i in ast.literal_eval(valor)]
                except Exception:
                    return []
            return []

        salas_destinatarias_ids = parse_lista(data.pop('salas_destinatarias', []))
        salas_excluidas_ids = parse_lista(data.pop('salas_excluidas', []))

        logger.info(f"🧪 salas_destinatarias_ids: {salas_destinatarias_ids} ({type(salas_destinatarias_ids)})")
        logger.info(f"🧪 salas_excluidas_ids: {salas_excluidas_ids} ({type(salas_excluidas_ids)})")

        enviar_a_todos = data.get("enviar_a_todos", False)
        if not enviar_a_todos and not salas_destinatarias_ids and not salas_excluidas_ids:
            return Response({
                "salas_destinatarias": ["Debe seleccionar al menos una sala destinataria o excluir alguna sala."]
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = NotificacionSerializer(instance=instance, data=data, partial=bool(instance))
        if serializer.is_valid():
            notificacion = serializer.save()

            # Asociar M2M
            notificacion.salas_destinatarias.set(salas_destinatarias_ids)
            notificacion.salas_excluidas.set(salas_excluidas_ids)

            if instance is None:
                enviar_notificacion_por_correo(notificacion)

            return Response(NotificacionSerializer(notificacion).data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)

        logger.error("❌ Errores de validación:")
        pprint(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificacionListView(ListAPIView):
    queryset = Notificacion.objects.all().order_by('-fecha', '-hora')
    serializer_class = NotificacionSerializer

class NotificacionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        create_view = NotificacionCreateView()
        return create_view._guardar_notificacion(request, instance=instance)
