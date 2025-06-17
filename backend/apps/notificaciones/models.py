from django.db import models
from apps.educativo.models import Sala

class Notificacion(models.Model):
    titulo = models.CharField(max_length=255)
    contenido = models.TextField()
    fecha = models.DateField()  # <--- este
    hora = models.TimeField()
    evento = models.CharField(
        max_length=100,
        choices=[
            ("cumple", "Cumpleaños"),
            ("cancelacion", "Cancelación"),
            ("personalizado", "Personalizado"),
        ],
    )
    salas_destinatarias = models.ManyToManyField(Sala, related_name="notificaciones", blank=True)
    salas_excluidas = models.ManyToManyField(Sala, related_name="notificaciones_excluidas", blank=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        
        return self.titulo
    
    