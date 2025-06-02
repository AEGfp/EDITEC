from django.db import models
from django.contrib.auth.models import User
import os


# Función para guardar nombre de la imagen
def custom_upload_to(instance, filename):
    # Se extrae la extensión de la imagen subida
    extension = filename.split('.')[-1]

    # Se define el nombre del archivo, se guardará como descripcion_logo_reporte.extension
    filename = f"{instance.descripcion}_logo_reporte.{extension}"

    # Se retorna la ruta dentro del directorio en donde se guardará
    return os.path.join('logos_empresas', filename)


# Entidad para empresas
class Empresa(models.Model):
    descripcion = models.CharField(max_length=50)
    titulo_reportes = models.CharField(max_length=80, null= True)   
    direccion = models.CharField(max_length=200)     
    telefono = models.CharField(max_length=20)       
    ruc = models.CharField(max_length=20, unique= True)            
    actividad = models.CharField(max_length=200) 
    estado = models.BooleanField(default= True)   
    logo_reportes = models.ImageField(upload_to=custom_upload_to, null=True, blank= True)
    id_usuario_aud = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.descripcion