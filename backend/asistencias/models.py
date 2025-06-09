from django.db import models
from apps.educativo.models import Infante
from django.conf import settings
# Create your models here.
class Asistencia(models.Model):
    id_infante=models.ForeignKey(Infante,on_delete=models.CASCADE,related_name="asistencia")
    fecha=models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=[("presente", "Presente"), ("ausente", "Ausente")])
    hora_entrada=models.TimeField(auto_now_add=True)
    hora_salida=models.TimeField(null=True,blank=True)
    usuario_auditoria = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="revision_asistencia",
    )
    
    class Meta:
        unique_together = ('id_infante', 'fecha')