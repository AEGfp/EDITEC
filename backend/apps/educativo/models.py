from django.db import models
from api.models import Persona

#Tabla Infante
class Infante(models.Model):
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    ind_alergia = models.CharField(max_length= 200)
    ind_intolerancia_lactosa = models.CharField(max_length= 200)
    ind_celiaquismo = models.CharField(max_length= 200)
    permiso_cambio_panhal = models.CharField(max_length= 200)
    permiso_fotos = models.CharField(max_length= 200)
    #! Agregar obligatorio
    id_sala=models.ForeignKey("Sala",on_delete=models.CASCADE,null=True, blank=True)

    def __str__(self):
        return str(self.id_persona)
#Tabla Tutor
class Tutor(models.Model):
    es_docente = models.BooleanField(default=False)
    es_estudiante = models.BooleanField(default=False)
    es_funcionario = models.BooleanField(default=False)
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    # Agregamos el campo email para notificciones
    email = models.EmailField(max_length=255, null=True, blank=True)
    telefono_casa = models.CharField(max_length=50)
    telefono_particular = models.CharField(max_length=50)
    telefono_trabajo = models.CharField(max_length=50)
    nombre_empresa_trabajo = models.CharField(max_length=255)
    direccion_trabajo = models.CharField(max_length=255)
    observaciones = models.TextField(null=True, blank=True)

    def __str__(self):
        return str(self.id_persona)
class Turno(models.Model):
    descripcion = models.CharField(max_length=100)
    
    def __str__(self):
        
        return self.descripcion

class Sala(models.Model):
    descripcion = models.CharField(max_length=100)
    profesor_encargado=models.ForeignKey(Persona,null=True,on_delete=models.SET_NULL,related_name='salas')
    def __str__(self):
        return self.descripcion

class AnhoLectivo(models.Model):
    anho = models.IntegerField()

    def __str__(self):
        return str(self.anho)

