from django.contrib import admin
from .models import Proveedor, ComprobanteProveedor, TipoComprobante, Condicion, SaldoProveedores

admin.site.register(Proveedor)
admin.site.register(ComprobanteProveedor)
admin.site.register(TipoComprobante)
admin.site.register(Condicion)
admin.site.register(SaldoProveedores)