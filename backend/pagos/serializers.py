from rest_framework import serializers
from .models import Proveedor, TipoComprobante, Condicion, ComprobanteProveedor, SaldoProveedores, CajaPagos
import re
from locales.models import Local
from api.models import Persona
from api.serializer import PersonaSerializer

# Serializer para Proveedores
class ProveedorSerializer(serializers.ModelSerializer):
    '''persona = PersonaSerializer(source='id_persona', read_only=True)
    persona_input = PersonaSerializer(write_only=True)'''  # Para la creación de persona

    class Meta:
        model = Proveedor
        fields = '__all__'
        #fields = ['id', 'nombre_fantasia', 'ruc', 'telefono', 'observaciones', 'estado', 'persona', 'persona_input']
        #read_only_fields = ['id', 'persona']  # Campos de solo lectura
        #fields = ['id', 'nombre_fantasia', 'ruc', 'telefono', 'observaciones', 'estado', 'id_usuario_aud', 'persona']

    # Se valida que el campo de RUC sea único
    def validate_ruc(self, value):
        instance = self.instance
        if Proveedor.objects.filter(ruc=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Este RUC ya está registrado para otro proveedor.")
        return value

'''    def create(self, validated_data):
        print("Datos recibidos:", validated_data)
        persona_data = validated_data.pop('persona_input')
        persona = Persona.objects.create(**persona_data)
        proveedor = Proveedor.objects.create(id_persona=persona, **validated_data)
        return proveedor
    
    # Para la actualización
    def update(self, instance, validated_data):
        persona_data = validated_data.pop('persona_input', None)
        if persona_data:
            for attr, value in persona_data.items():
                setattr(instance.id_persona, attr, value)
            instance.id_persona.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
'''



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
    '''id_tipo_comprobante = serializers.SlugRelatedField(
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
        fields = ['__all__'] '''
    
    proveedor_nombre = serializers.CharField(source='id_proveedor.descripcion', read_only=True)
    tipo_comprobante_nombre = serializers.CharField(source='id_tipo_comprobante.descripcion', read_only=True)
    condicion_nombre = serializers.CharField(source='id_condicion.descripcion', read_only=True)
    local_nombre = serializers.CharField(source='id_local.descripcion', read_only=True)

    class Meta:
        model = ComprobanteProveedor
        fields = [
        'id',
        'fecha_comprobante',
        'numero_comprobante',
        'total_comprobante',
        'id_proveedor',
        'id_tipo_comprobante',
        'id_condicion',
        'id_local',
        # Campos legibles agregados:
        'proveedor_nombre',
        'tipo_comprobante_nombre',
        'condicion_nombre',
        'local_nombre',
    ]

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
    numero_comprobante_as = serializers.CharField(source='id_comprobante.numero_comprobante', read_only=True)
    proveedor_nombre = serializers.CharField(source='id_comprobante.id_proveedor.nombre_fantasia', read_only=True)
    tipo_comprobante_nombre = serializers.CharField(source='id_comprobante.id_tipo_comprobante.descripcion', read_only=True)
    condicion_nombre = serializers.CharField(source='id_comprobante.id_condicion.descripcion', read_only=True)
    sucursal_nombre = serializers.CharField(source='id_comprobante.id_local.descripcion', read_only=True)
    class Meta:
        model = SaldoProveedores
        fields = ['id','monto_cuota','saldo_cuota', 'numero_cuota','id_comprobante',
                  'numero_comprobante_as', 'proveedor_nombre','tipo_comprobante_nombre','condicion_nombre',
                  'sucursal_nombre']
        

# Serializer de las cajas pagos
class CajaPagosSerializer(serializers.ModelSerializer):
    monto_saldo = serializers.DecimalField(
        source="id_saldo.saldo_cuota", max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CajaPagos
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Solo filtrar si estamos en una petición de escritura (POST, PUT, PATCH)
        request = self.context.get("request", None)
        if request and request.method in ["POST", "PUT", "PATCH"]:
            comprobantes_con_saldo = ComprobanteProveedor.objects.filter(
                saldos__saldo_cuota__gt=0
            ).distinct()
            self.fields['id_comprobante'].queryset = comprobantes_con_saldo

    def validate(self, data):
        id_comprobante = data.get('id_comprobante')
        nro_cuota = data.get('nro_cuota')
        total_pago = data.get('total_pago')
        id_saldo = data.get('id_saldo')

        try:
            saldo = SaldoProveedores.objects.get(
                id_comprobante=id_comprobante,
                numero_cuota=nro_cuota
            )
        except SaldoProveedores.DoesNotExist:
            raise serializers.ValidationError("La cuota no existe o no pertenece al comprobante.")

        # Validar que id_saldo sea coherente con el resto
        if id_saldo:
            if id_saldo.id_comprobante != id_comprobante or id_saldo.numero_cuota != nro_cuota:
                raise serializers.ValidationError("El saldo no corresponde al comprobante y número de cuota proporcionados.")

        # Validar monto
        if self.instance:
            total_pago_original = self.instance.total_pago
            saldo_restante = saldo.saldo_cuota + total_pago_original
        else:
            saldo_restante = saldo.saldo_cuota

        if total_pago > saldo_restante:
            raise serializers.ValidationError(
                f"El pago ingresado ({total_pago}) excede el saldo disponible de la cuota seleccionada ({saldo_restante})."
            )

        return data
