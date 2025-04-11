from django.db import models

class Empresa(models.Model):
    id_empresa = models.AutoField(primary_key=True) 
    descripcion = models.CharField(max_length=50)   
    direccion = models.CharField(max_length=200)     
    telefono = models.CharField(max_length=20)       
    ruc = models.CharField(max_length=20)            
    actividad = models.CharField(max_length=200)     

    def __str__(self):
        return self.descripcion