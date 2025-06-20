from django.db import models
from api.models import Persona
from datetime import timedelta,time
from django.core.exceptions import ValidationError
from inscripciones.models import PeriodoInscripcion


#Tabla Infante
class Infante(models.Model):
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    ind_alergia = models.CharField(max_length= 200)
    ind_intolerancia_lactosa = models.CharField(max_length= 200)
    ind_celiaquismo = models.CharField(max_length= 200)
    permiso_cambio_panhal = models.CharField(max_length= 200)
    permiso_fotos = models.CharField(max_length= 200)
    #! Agregar obligatorio
    id_sala = models.ForeignKey("Sala", on_delete=models.SET_NULL, null=True, blank=True, related_name="infantes")
    periodo_inscripcion = models.ForeignKey(
        "inscripciones.PeriodoInscripcion",
        null=True, blank=True,
        on_delete=models.PROTECT
    )

    def clean(self):
        if self.id_sala and not self.id_sala.puede_agregar_infante():
            raise ValidationError("No se puede agregar más infantes a esta sala porque se alcanzó el límite.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

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
    periodo_inscripcion = models.ForeignKey(
        "inscripciones.PeriodoInscripcion",
        null=True, blank=True,
        on_delete=models.PROTECT
    )    
    def __str__(self):
        return str(self.id_persona)

class Turno(models.Model):
    descripcion = models.CharField(max_length=100)
    
    def __str__(self):
        
        return self.descripcion

class Sala(models.Model):
    descripcion = models.CharField(max_length=100)
    profesor_encargado = models.ForeignKey(
        Persona,
        null=True,
        on_delete=models.SET_NULL,
        related_name='salas'
    )
    periodo_inscripcion = models.ForeignKey(
        "inscripciones.PeriodoInscripcion",
        null=True, blank=True,
        on_delete=models.PROTECT
    )
    
    hora_entrada = models.TimeField(null=True, blank=True)
    hora_salida = models.TimeField(null=True, blank=True)

    limite_infantes = models.PositiveIntegerField(default=1) 
    meses = models.PositiveIntegerField(default=0, help_text="Edad máxima permitida en meses para el infante")

    def clean(self):
        if self.hora_entrada and self.hora_salida:
            entrada_dt = timedelta(
                hours=self.hora_entrada.hour,
                minutes=self.hora_entrada.minute,
                seconds=self.hora_entrada.second,
            )
            salida_dt = timedelta(
                hours=self.hora_salida.hour,
                minutes=self.hora_salida.minute,
                seconds=self.hora_salida.second,
            )
            if salida_dt <= entrada_dt:
                raise ValidationError("La hora de salida debe ser posterior a la hora de entrada.")
            if (salida_dt - entrada_dt) > timedelta(hours=5):
                raise ValidationError("La diferencia entre hora de entrada y salida no puede ser mayor a 5 horas.")

            limite_salida = time(hour=17, minute=0, second=0)
            if self.hora_salida > limite_salida:
                raise ValidationError("La hora de salida no puede ser mayor a las 17:00.")

        if self.limite_infantes < 1:
            raise ValidationError("El límite de infantes debe ser al menos 1.")

    def puede_agregar_infante(self):
        return self.infantes.count() < self.limite_infantes    

    def save(self, *args, **kwargs):
        self.full_clean()  
        super().save(*args, **kwargs)

    def __str__(self):
        return self.descripcion

class AnhoLectivo(models.Model):
    anho = models.IntegerField()

    def __str__(self):
        return str(self.anho)

#Agrego porque (este tutor es responsable de este infante) para el tema de las notificaciones
class TutorInfante(models.Model):
    tutor = models.ForeignKey("Tutor", on_delete=models.CASCADE, related_name="tutorados")
    infante = models.ForeignKey("Infante", on_delete=models.CASCADE, related_name="tutores")

    def __str__(self):
        
        return f"{self.tutor} → {self.infante}"



class TransferenciaInfante(models.Model):
    infante = models.ForeignKey("Infante", on_delete=models.CASCADE)
    sala_origen = models.ForeignKey("Sala", related_name="transferencias_salientes", on_delete=models.SET_NULL, null=True)
    sala_destino = models.ForeignKey("Sala", related_name="transferencias_entrantes", on_delete=models.SET_NULL, null=True)
    motivo = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.infante} de {self.sala_origen} a {self.sala_destino}"

class TransferenciaProfesor(models.Model):
    profesor = models.ForeignKey(Persona, on_delete=models.CASCADE)
    sala_origen = models.ForeignKey("Sala", related_name="profesor_saliente", on_delete=models.SET_NULL, null=True)
    sala_destino = models.ForeignKey("Sala", related_name="profesor_entrante", on_delete=models.SET_NULL, null=True)
    motivo = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        
        return f"{self.profesor} de {self.sala_origen} a {self.sala_destino}"