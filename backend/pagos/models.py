from django.db import models
from api.models import Persona
from locales.models import Local
from django.contrib.auth.models import User
from django.utils import timezone

# Entidad Proveedor
class Proveedor(models.Model):
    id_persona = models.ForeignKey(Persona, on_delete= models.PROTECT)
    nombre_fantasia = models.CharField(max_length= 100)
    ruc = models.CharField(max_length=12, unique=True) #! Validar formato xxxxx-x
    telefono = models.CharField(max_length= 12) 
    observaciones = models.TextField(blank=True, null=True)
    estado = models.BooleanField(default=True) 
    id_usuario_aud = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)


    def __str__(self):
        return self.nombre_fantasia
    

# Entidad para tipos de comprobantes
class TipoComprobante(models.Model):
    descripcion = models.CharField(max_length=30)
    estado = models.BooleanField(default=True)
    id_usuario_aud = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True) #!Configurar

    def __str__(self):
        return self.descripcion


# Entidad para condiciones de comprobantes
class Condicion(models.Model):
    descripcion = models.CharField(max_length=30)
    estado = models.BooleanField(default=True)
    cantidad_cuotas = models.PositiveIntegerField(default=1)
    id_usuario_aud = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True) #!Configurar

    def __str__(self):
        return self.descripcion

def today_date():
    return timezone.now().date()


# Entidad para los comprobantes de proveedores
class ComprobanteProveedor(models.Model):
    id_local = models.ForeignKey(Local, on_delete= models.PROTECT)
    id_proveedor = models.ForeignKey(Proveedor, on_delete= models.PROTECT, related_name='comprobantes') 
    id_tipo_comprobante = models.ForeignKey(TipoComprobante, on_delete=models.PROTECT)
    id_condicion = models.ForeignKey(Condicion, on_delete= models.PROTECT)
    concepto = models.CharField(max_length=200)
    fecha_comprobante = models.DateField(default=today_date) # Se guarda la fecha actual
    #cantidad_cuotas = models.IntegerField(default=1) # Por defecto siempre será 1
    total_comprobante = models.IntegerField()
    numero_comprobante = models.CharField(max_length=15)
    id_usuario_aud = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True) #!Configurar

    def __str__(self):
        return f"{self.id_tipo_comprobante} - {self.id_condicion} - {self.numero_comprobante} - {self.id_proveedor}"


# Entidad para saldos de los comprobantes
class SaldoProveedores(models.Model):
    monto_cuota = models.IntegerField()
    saldo_cuota = models.IntegerField()
    fecha_pago = models.DateField(null=True, blank=True)
    numero_cuota = models.IntegerField()
    id_comprobante = models.ForeignKey(ComprobanteProveedor, on_delete= models.CASCADE, related_name='saldos')

    def __str__(self):
        return f"Monto cuota: {self.monto_cuota} - Saldo: {self.saldo_cuota}"
    


