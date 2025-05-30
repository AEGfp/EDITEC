from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch import receiver

# Create your models here.
class Persona(models.Model):
    nombre = models.CharField(blank=False, max_length=50)
    apellido = models.CharField(blank=False, max_length=50)
    segundo_apellido = models.CharField(blank=True, max_length=50)
    # TODO: Agregar validators
    #! Corregir null y blank
    fecha_nacimiento = models.DateField( blank=False)
    sexo = models.CharField(
        max_length=1,
        choices=[("M", "Masculino"), ("F", "Femenino")],
        blank=False,
    )
    ci = models.CharField(max_length=20, null=False, unique=True)
    domicilio = models.CharField(max_length=200, null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nombre + " " + self.apellido + " " + self.segundo_apellido


@receiver(pre_delete, sender=Persona)
def borrar_usuario(sender, instance, **kwargs):
    if instance.user:
        instance.user.delete()

"""
class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="perfil"
    )
    persona = models.ForeignKey(
        Persona,
        on_delete=models.CASCADE,
        related_name="usuarios",
        null=True,
        blank=True,
    )
"""


class Permiso(models.Model):
    descripcion = models.CharField(max_length=255)
    # !!!Boolean o char(1)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.descripcion
