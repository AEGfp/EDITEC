from django.db import models
from datetime import date, timedelta
from calendar import monthrange 
from django.utils import timezone
from apps.educativo.models import Infante
from inscripciones.models import PeriodoInscripcion
from django.core.exceptions import ValidationError
import logging

class ParametrosCobros(models.Model):
    periodo = models.ForeignKey(PeriodoInscripcion, on_delete=models.PROTECT, related_name="parametros")
    #anho = models.IntegerField()
    mes_inicio = models.IntegerField()
    mes_fin = models.IntegerField()
    dia_limite_pago = models.IntegerField(default=10)
    dias_gracia = models.IntegerField(default=5)
    monto_cuota = models.IntegerField()
    mora_por_dia = models.IntegerField()
    estado = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(mes_inicio__gte=1, mes_inicio__lte=12),
                name="valid_mes_inicio",
            ),
            models.CheckConstraint(
                check=models.Q(mes_fin__gte=1, mes_fin__lte=12),
                name="valid_mes_fin",
            ),
            models.CheckConstraint(
                check=models.Q(dia_limite_pago__gte=1, dia_limite_pago__lte=31),
                name="valid_dia_limite_pago",
            ),
            models.UniqueConstraint(
                fields=["periodo", "estado"],
                condition=models.Q(estado=True),
                name="unique_active_parametros_por_periodo",
            ),
        ]

    def save(self, *args, **kwargs):
        # Si no se asignó un periodo manualmente, buscamos el activo
        if not self.periodo_id:
            try:
                self.periodo = PeriodoInscripcion.objects.get(activo=True)
            except PeriodoInscripcion.DoesNotExist:
                raise ValueError("No hay un periodo activo. Por favor, crea o activa uno.")

        # Garantizar que no haya otro conjunto activo en ese periodo
        if self.estado:
            ParametrosCobros.objects.filter(periodo=self.periodo, estado=True).exclude(pk=self.pk).update(estado=False)

        super().save(*args, **kwargs)


class EstadoCuota(models.TextChoices):
    PENDIENTE = "PENDIENTE", "Pendiente"
    VENCIDA = "VENCIDA", "Vencida"
    PAGADA = "PAGADA", "Pagada"

class SaldoCuotas(models.Model):
    id_infante = models.ForeignKey(Infante, on_delete=models.PROTECT, related_name="cuotas")
    periodo = models.ForeignKey(PeriodoInscripcion, on_delete=models.PROTECT, related_name="cuotas",null=True, blank=True)
    anho = models.IntegerField()  # Extraído del periodo
    mes = models.IntegerField()
    nro_cuota = models.IntegerField()
    fecha_generacion = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField()
    monto_cuota = models.IntegerField()
    estado = models.CharField(max_length=20, choices=EstadoCuota.choices, default=EstadoCuota.PENDIENTE)
    fecha_pago = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("id_infante", "periodo", "mes", "nro_cuota")
        indexes = [
            models.Index(fields=["id_infante", "periodo", "mes"]),
            models.Index(fields=["estado"]),
        ]

    @property
    def monto_mora(self):
        """Calcula la mora dinámicamente según la fecha actual y los parámetros."""
        params = ParametrosCobros.objects.filter(periodo=self.periodo, estado=True).first()
        if not params:
            return 0
        fecha_limite = self.fecha_vencimiento + timedelta(days=params.dias_gracia)
        if timezone.now().date() <= fecha_limite:
            return 0
        dias_mora = (timezone.now().date() - fecha_limite).days
        return max(0, dias_mora * params.mora_por_dia)

    @property
    def monto_total(self):
        """Suma el monto de la cuota y la mora."""
        return self.monto_cuota + self.monto_mora

    @property
    def saldo(self):
        """Devuelve el saldo pendiente."""
        return self.monto_total if self.estado != EstadoCuota.PAGADA else 0

    def actualizar_estado(self):
        """Actualiza el estado según la fecha actual."""
        if self.estado == EstadoCuota.PAGADA:
            return
        if timezone.now().date() > self.fecha_vencimiento:
            self.estado = EstadoCuota.VENCIDA
        else:
            self.estado = EstadoCuota.PENDIENTE
        self.save()


logger = logging.getLogger(__name__)
#NUEVO
class MetodoPago(models.TextChoices):
    EFECTIVO = "EFECTIVO", "Efectivo"
    TRANSFERENCIA = "TRANSFERENCIA", "Transferencia"
    TARJETA = "TARJETA", "Tarjeta"

class CobroCuotaInfante(models.Model):
    cuota = models.ForeignKey(SaldoCuotas, on_delete=models.PROTECT, related_name="cobros")
    fecha_cobro = models.DateField(default=timezone.now)
    monto_cobrado = models.IntegerField()
    metodo_pago = models.CharField(max_length=20, choices=MetodoPago.choices, default=MetodoPago.EFECTIVO)
    usuario= models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, related_name="cobros_registrados")
    observacion = models.TextField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["cuota"], name="unique_cobro_por_cuota"),
        ]

    def save(self, *args, **kwargs):
        try:
            if not self.cuota:
                raise ValidationError("El campo cuota es obligatorio.")
            if self.monto_cobrado != self.cuota.monto_total:
                raise ValidationError(
                    f"El monto cobrado ({self.monto_cobrado}) debe ser igual al monto total de la cuota ({self.cuota.monto_total})."
                )
            if self.cuota.estado == EstadoCuota.PAGADA:
                raise ValidationError("La cuota ya está pagada.")
            super().save(*args, **kwargs)
        except ValidationError as e:
            logger.error(f"Error de validación al guardar CobroCuotaInfante: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error inesperado al guardar CobroCuotaInfante: {str(e)}")
            raise
    
    def delete(self, *args, **kwargs):
        # Al eliminar el cobro, actualizar el estado de la cuota
        cuota = self.cuota
        cuota.fecha_pago = None
        cuota.actualizar_estado()  # Esto ya tiene tu lógica PENDIENTE/VENCIDA
        cuota.save(update_fields=['estado', 'fecha_pago'])

        super().delete(*args, **kwargs)
