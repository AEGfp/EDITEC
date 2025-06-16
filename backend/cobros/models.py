from django.db import models
from datetime import date
from calendar import monthrange 
from apps.educativo.models import Infante


# Clase que corresponde a la entidad de Parámetros
class ParametrosCobros(models.Model):
    anho = models.IntegerField()
    mes_inicio = models.IntegerField()
    mes_fin = models.IntegerField()
    dia_limite_pago = models.IntegerField(default=5)
    monto_cuota = models.DecimalField(max_digits=10, decimal_places=2)
    mora_por_dia = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"Parámetros registrados"


# Clase de la entidad para cuotas generadas
class SaldoCuotas(models.Model):
    id_infante = models.ForeignKey(Infante, on_delete=models.PROTECT)
    anho = models.IntegerField()
    mes = models.IntegerField()
    nro_cuota = models.IntegerField()
    fecha_generacion = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField()
    monto_cuota = models.DecimalField(max_digits=10, decimal_places=2)
    monto_mora = models.DecimalField(max_digits=10, decimal_places=2)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    saldo = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=False)
    fecha_pago = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("id_infante", "anho", "mes")

    def __str__(self):
        return f"{self.id_infante.nombre} {self.id_infante.apellido} - Cuota N° {self.nro_cuota}: {self.mes}/{self.anho}"
