from django.core.mail import send_mass_mail
from django.conf import settings

def enviar_notificaciones_por_email(notificacion):
    # Obtener todas las salas seleccionadas en la notificación
    salas = notificacion.salas_destinatarias.all()

    # Obtener todos los tutores relacionados a los infantes de esas salas
    from apps.educativo.models import Infante
    from apps.educativo.models import Tutor

    tutores_emails = Tutor.objects.filter(
        infante__sala__in=salas
    ).exclude(email__isnull=True).exclude(email__exact='').values_list("email", flat=True).distinct()

    # Crear los mensajes
    mensajes = []
    for email in tutores_emails:
        mensajes.append((
            f"[Notificación] {notificacion.titulo}",   # Asunto
            notificacion.contenido,                      # Cuerpo del mensaje
            settings.DEFAULT_FROM_EMAIL,               # Remitente desde settings
            [email],                                   # Destinatario
        ))

    # Enviar todos los correos de una vez
    send_mass_mail(mensajes, fail_silently=False)
