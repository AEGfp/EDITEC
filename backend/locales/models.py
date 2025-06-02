from django.db import models
from empresas.models import Empresa
from django.contrib.auth.models import User


# Entidad para locales o sucursales
class Local(models.Model):
    descripcion = models.CharField(max_length=200)
    titulo_reportes = models.CharField(max_length=80, null=True)
    estado = models.BooleanField(default=True)
    direccion = models.CharField(max_length=200)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    id_usuario_aud = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.descripcion
