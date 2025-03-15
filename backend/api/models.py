from django.db import models

# Create your models here.
class Permiso(models.Model):
    descripcion=models.CharField(max_length=255)
    #Boolean o char(1)
    estado=models.BooleanField(default=True)

    def __str__(self):
        return self.descripcion