from django.db import models
from empresas.models import Empresa

class Local(models.Model):
    OPCIONES_ESTADO = [
        ('A', 'Activo'),
        ('I', 'Inactivo'),
    ]

    id_local = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=200)
    estado = models.CharField(max_length=1, choices=OPCIONES_ESTADO, default='A')
    direccion = models.CharField(max_length=200)
    id_empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)

    def __str__(self):
        return self.descripcion