from django.db import models
from api.models import User, Persona
from apps.educativo.models import Tutor, Infante
from django.conf import settings

# Create your models here.

ESTADOS = [
    ("pendiente", "Pendiente"),
    ("aprobada", "Aprobada"),
    ("rechazada", "Rechazada"),
]


class Inscripcion(models.Model):
    id_tutor = models.ForeignKey(
        Tutor, on_delete=models.CASCADE, related_name="inscripciones"
    )
    id_infante = models.ForeignKey(
        Infante, on_delete=models.CASCADE, related_name="inscripciones"
    )
    estado = models.CharField(max_length=10, choices=ESTADOS, default="pendiente")
    fecha_inscripcion = models.DateField(auto_now_add=True)
    observaciones = models.TextField(blank=True, null=True)
    usuario_auditoria = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="revision_inscripciones",
    )
    fecha_revision = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["id_tutor", "id_infante"]

    def __str__(self):
        return f"Inscripción de {self.id_infante} por {self.id_tutor} ({self.estado})"
