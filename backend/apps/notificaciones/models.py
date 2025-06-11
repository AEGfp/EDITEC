from django.db import models
from apps.educativo.models import Sala

class Notificacion(models.Model):
    titulo = models.CharField(max_length=255)
    contenido = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)
    evento = models.CharField(max_length=100, choices=[("cumple", "Cumpleaños"), ("cancelacion", "Cancelación"), ("personalizado", "Personalizado")])
   #salas_destinatarias = models.ManyToManyField(Sala, related_name="notificaciones")
    salas_destinatarias = models.ManyToManyField(Sala, related_name="notificaciones", blank=True)
    excluir_salas = models.ManyToManyField(Sala, related_name="notificaciones_excluidas", blank=True)
    activa = models.BooleanField(default=True)
   
    def __str__(self):
        
        return self.titulo
    
    