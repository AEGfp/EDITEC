from rest_framework import serializers
from .models import ParametrosCobros, SaldoCuotas, CobroCuotaInfante
from inscripciones.models import PeriodoInscripcion
from inscripciones.serializers import PeriodoInscripcionSerializer
from apps.educativo.models import Infante
from apps.educativo.serializers import InfanteSerializer
from datetime import date
from django.utils import timezone

# Serializador de parámetros
'''class ParametrosCobrosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametrosCobros
        fields = '__all__'

# Serializer de los saldos de cuotas
class SaldoCuotasSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaldoCuotas
        fields = '__all__'
        read_only_fields = ['fecha_generacion', 'monto_mora', 'monto_cuota','monto_total', 'saldo']


# Serializer para cobro de cuotas
class CobroCuotaInfanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CobroCuotaInfante
        fields = '__all__'

'''


class ParametrosCobrosSerializer(serializers.ModelSerializer):
    periodo = PeriodoInscripcionSerializer(read_only=True)
    periodo_id = serializers.PrimaryKeyRelatedField(
        queryset=PeriodoInscripcion.objects.all(), source='periodo', write_only=True
    )

    class Meta:
        model = ParametrosCobros
        fields = [
            'id', 'periodo', 'periodo_id', 'mes_inicio', 'mes_fin',
            'dia_limite_pago', 'dias_gracia', 'monto_cuota', 'mora_por_dia',
            'estado', 'creado_en', 'actualizado_en'
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

class SaldoCuotasSerializer(serializers.ModelSerializer):
    infante_nombre = serializers.SerializerMethodField()
    dias_atraso = serializers.SerializerMethodField()

    class Meta:
        model = SaldoCuotas
        fields = [
            'id',
            'infante_nombre',
            'nro_cuota',
            'fecha_vencimiento',
            'dias_atraso',
            'monto_cuota',
            'monto_mora',
            'estado',
            'fecha_pago',
        ]

    def get_infante_nombre(self, obj):
        return f"{obj.id_infante.id_persona.nombre} {obj.id_infante.id_persona.apellido}"

    def get_dias_atraso(self, obj):
        if obj.estado == 'PAGADA':
            return 0
        today = timezone.now().date()
        if today <= obj.fecha_vencimiento:
            return 0
        return (today - obj.fecha_vencimiento).days

class CobroCuotaInfanteSerializer(serializers.ModelSerializer):
    cuota = SaldoCuotasSerializer(read_only=True)
    cuota_id = serializers.PrimaryKeyRelatedField(
        queryset=SaldoCuotas.objects.all(), source='cuota', write_only=True
    )
    usuario_registro = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = CobroCuotaInfante
        fields = [
            'id', 'cuota', 'cuota_id', 'fecha_cobro', 'monto_cobrado',
            'metodo_pago', 'usuario_registro', 'observacion',
            'creado_en', 'actualizado_en'
        ]
        read_only_fields = ['creado_en', 'actualizado_en', 'usuario_registro']

    def validate(self, data):
        """Valida que el monto_cobrado sea igual al monto_total de la cuota."""
        cuota = data['cuota']
        if data['monto_cobrado'] != cuota.monto_total:
            raise serializers.ValidationError(
                f"El monto cobrado ({data['monto_cobrado']}) debe ser igual al monto total ({cuota.monto_total})."
            )
        if cuota.estado == 'PAGADA':
            raise serializers.ValidationError("La cuota ya está pagada.")
        return data

    def create(self, validated_data):
        """Asigna el usuario autenticado como usuario_registro."""
        validated_data['usuario_registro'] = self.context['request'].user
        return super().create(validated_data)