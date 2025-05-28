from rest_framework import serializers
from .models import Proveedor, TipoComprobante, Condicion, ComprobanteProveedor, SaldoProveedores
import re
from locales.models import Local

# Serializer para Proveedores
class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'


# Serializer para los tipos de comprobantes
class TipoComprobanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoComprobante
        fields = '__all__'


# Serializer para las condiciones de comprobantes
class CondicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condicion
        fields = '__all__'


# Serializer para los comprobantes de proveedores
class ComprobanteProveedorSerializer(serializers.ModelSerializer):
    id_tipo_comprobante = serializers.SlugRelatedField(
        slug_field = 'descripcion',
        queryset = TipoComprobante.objects.filter(estado=True))

    id_condicion = serializers.SlugRelatedField(
        slug_field = 'descripcion',
        queryset = Condicion.objects.filter(estado=True))
    
    id_local = serializers.SlugRelatedField(
        slug_field = 'descripcion',
        queryset = Local.objects.filter(estado=True))

    class Meta:
        model = ComprobanteProveedor
        fields = ['id', 'id_local', 'id_proveedor',
                  'id_tipo_comprobante', 'id_condicion',
                  'numero_comprobante', 'concepto', 'fecha_comprobante',
                  'total_comprobante', 'id_usuario_aud']

    # Validación de campos
    def validate(self, data):
        # Se obtienen campos a validar
        numero = data.get('numero_comprobante','')
        proveedor = data.get('id_proveedor')
        tipo = data.get('id_tipo_comprobante')
        total_comp = data.get('total_comprobante')
              
        # Se valida duplicación de comprobantes por proveedor, tipo y número
        if ComprobanteProveedor.objects.filter(id_proveedor = proveedor, numero_comprobante = numero, id_tipo_comprobante = tipo).exists():
            raise serializers.ValidationError({"numero_comprobante":"El número de comprobante ingresado ya existe para este proveedor"})

        if total_comp <= 0:
            raise serializers.ValidationError("El total del comprobante debe ser mayor a 0.")

        return data

    # Se crean los saldos al insertar un comprobante
    def create(self, validated_data):
        from .models import SaldoProveedores

        # Se crea el comprobante primero
        comprobante = ComprobanteProveedor.objects.create(**validated_data)

        # Se recuperan campos para calcular los saldos
        condicion = validated_data['id_condicion']
        cuotas =  condicion.cantidad_cuotas
        total = validated_data['total_comprobante']

        if cuotas == 1:
            # Se inserta un único saldo
            SaldoProveedores.objects.create(
                monto_cuota = total,
                saldo_cuota = total,
                numero_cuota = 1,
                id_comprobante = comprobante
                )
        else: 
            # Si no es contado, se toman las cuotas puestas para crédito
            monto_por_cuota = total // cuotas # Se hace una división entera
            restante = total % cuotas  # Si la división no es exacta 

            for i in range(1, cuotas + 1):
                monto = monto_por_cuota + (1 if i <= restante else 0) # Se ajusta cuando la división no es exacta 
                SaldoProveedores.objects.create(
                    monto_cuota = monto,
                    saldo_cuota = monto,
                    numero_cuota = i,
                    id_comprobante = comprobante)
        return comprobante
        

#! Solo para comprobar los saldos
class SaldoProveedoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaldoProveedores
        fields = '__all__'

