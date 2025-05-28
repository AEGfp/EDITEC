from django.db import models
from django.contrib.auth.models import User

# Entidad para empresas
class Empresa(models.Model):
    descripcion = models.CharField(max_length=50)
    titulo_reportes = models.CharField(max_length=80, null= True)   
    direccion = models.CharField(max_length=200)     
    telefono = models.CharField(max_length=20)       
    ruc = models.CharField(max_length=20, unique= True)            
    actividad = models.CharField(max_length=200) 
    estado = models.BooleanField(default= True)   
    id_usuario_aud = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.descripcion