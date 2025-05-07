from django.db import models

# Create your models here.


class Archivos(models.Model):
    descripcion = models.CharField(blank=False, max_length=70)
    archivo = models.FileField()

    def __str__(self):
        return self.descripcion
