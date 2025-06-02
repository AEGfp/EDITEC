from django.db import models
from django.contrib.auth.models import User
from apps.educativo.models import Infante

# Modelo de Tipo de informes
class TipoInforme(models.Model):
    descripcion = models.CharField(max_length=50, blank=False)
    estado = models.BooleanField(default=True)
    id_usuario_aud = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return self.descripcion


# Modelo para indicadores
class Indicador(models.Model):
    id_tipo_informe = models.ForeignKey(TipoInforme, on_delete=models.PROTECT)
    descripcion = models.TextField(max_length=250, blank=False)
    estado = models.BooleanField(default=True)
    id_usuario_aud = models.ForeignKey(User, on_delete=models.PROTECT)

# Modelo de Informes
class Informe(models.Model):
    id_infante = models.ForeignKey(Infante, on_delete=models.PROTECT)
    id_tipo_informe = models.ForeignKey(TipoInforme, on_delete=models.PROTECT)
    fecha_informe = models.DateField()
    observaciones = models.TextField()
    estado = models.BooleanField(default=False)
    id_usuario_aud = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return self.id_tipo_informe.descripcion
    

# Modelo de tabla intermedia Informe indicadores
class InformeIndicador(models.Model):
    id_informe = models.ForeignKey(Informe, on_delete=models.CASCADE, related_name="indicadores")
    id_indicador = models.ForeignKey(Indicador, on_delete=models.CASCADE)
    ind_logrado = models.BooleanField(default=False)
    id_usuario_aud = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return f"self.id_indicador.descripcion {self.ind_logrado}"

