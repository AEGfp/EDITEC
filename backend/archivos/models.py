from django.db import models
from api.models import Persona

# Create your models here.


class Archivos(models.Model):
    persona = models.ForeignKey(Persona,on_delete=models.CASCADE,related_name="archivos")
    descripcion = models.CharField(blank=False, max_length=70)
    archivo = models.FileField()

    def __str__(self):
        return self.descripcion
