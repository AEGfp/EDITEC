import time
import logging
from django.conf import settings
from django.core.mail import send_mass_mail
from smtplib import SMTPException
from apps.educativo.models import Infante, Tutor

logger = logging.getLogger(__name__)

def enviar_notificaciones_por_email(notificacion, max_reintentos=3):
    salas = notificacion.salas_destinatarias.all()
    
    # Buscar tutores con correos válidos relacionados a infantes en esas salas
    tutores_emails = Tutor.objects.filter(
        infante__sala__in=salas
    ).exclude(
        id_persona__user__email__isnull=True
    ).exclude(
        id_persona__user__email__exact=''
    ).values_list("id_persona__user__email", flat=True).distinct()

    mensajes = []
    for email in tutores_emails:
        mensajes.append((
            f"[Notificación] {notificacion.titulo}",
            notificacion.contenido,
            settings.DEFAULT_FROM_EMAIL,
            [email],
        ))

    if not mensajes:
        logger.warning("No se encontraron correos válidos para esta notificación.")
        return

    intentos = 0
    while intentos < max_reintentos:
        try:
            send_mass_mail(mensajes, fail_silently=False)
            logger.info(f"✅ Correos enviados: {len(mensajes)}")
            return
        except SMTPException as e:
            intentos += 1
            logger.warning(f"⚠️ Error temporal al enviar correos. Intento {intentos}/{max_reintentos}")
            logger.debug(f"Detalles SMTP: {e}")
            time.sleep(5)
        except Exception as e:
            logger.error(f"❌ Error inesperado al enviar correos: {e}")
            break

    logger.error("❌ Fallaron todos los intentos para enviar la notificación por correo.")
