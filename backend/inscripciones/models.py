from django.db import models
from api.models import User, Persona
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError
# Create your models here.

ESTADOS = [
    ("pendiente", "Pendiente"),
    ("aprobada", "Aprobada"),
    ("rechazada", "Rechazada"),
]
class PeriodoInscripcion(models.Model):
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    activo = models.BooleanField(default=True)  

    @property
    def es_abierto(self):
        ahora = timezone.now()
        return self.activo and self.fecha_inicio <= ahora <= self.fecha_fin

    @property
    def es_pendiente(self):
        ahora = timezone.now()
        return self.activo and ahora < self.fecha_inicio

    @property
    def es_cerrado(self):
        ahora = timezone.now()
        return ahora > self.fecha_fin or not self.activo

class Inscripcion(models.Model):
    id_tutor = models.ForeignKey(
        "educativo.Tutor",  
        on_delete=models.CASCADE,
        related_name="inscripciones"
    )
    id_infante = models.ForeignKey(
        "educativo.Infante",
        on_delete=models.CASCADE,
        related_name="inscripciones"
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
    periodo_inscripcion = models.ForeignKey(PeriodoInscripcion,null=True,blank=True, on_delete=models.PROTECT)

    def save(self, *args, **kwargs):
        ahora = timezone.now()

        if self.pk is None:
            periodo_activo = PeriodoInscripcion.objects.filter(
                activo=True,
                fecha_inicio__lte=ahora,
                fecha_fin__gte=ahora
            ).first()

            if not periodo_activo:
                raise ValidationError("No hay un período de inscripción activo.")

            self.periodo_inscripcion = periodo_activo

        super().save(*args, **kwargs)

    class Meta:
        unique_together = ["id_tutor", "id_infante"]

    def __str__(self):
        return f"Inscripción de {self.id_infante} por {self.id_tutor} ({self.estado})"


