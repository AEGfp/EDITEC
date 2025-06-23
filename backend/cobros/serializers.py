from rest_framework import serializers
from .models import ParametrosCobros, SaldoCuotas, CobroCuotaInfante, EstadoCuota
from inscripciones.models import PeriodoInscripcion
from inscripciones.serializers import PeriodoInscripcionSerializer
from apps.educativo.models import Infante
from apps.educativo.serializers import InfanteSerializer
from datetime import date
from django.utils import timezone
import logging
from django.utils import timezone
from django.db import transaction, IntegrityError

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

logger = logging.getLogger(__name__)

class CobroCuotaInfanteSerializer(serializers.ModelSerializer):
    cuota = serializers.SerializerMethodField(read_only=True)
    cuota_id = serializers.PrimaryKeyRelatedField(
        queryset=SaldoCuotas.objects.all(), source='cuota', write_only=True
    )
    usuario = serializers.StringRelatedField(read_only=True, allow_null=True)
    fecha_cobro = serializers.DateField(default=timezone.now().date)

    class Meta:
        model = CobroCuotaInfante
        fields = [
            'id', 'cuota', 'cuota_id', 'fecha_cobro', 'monto_cobrado',
            'metodo_pago', 'usuario', 'observacion',
            'creado_en', 'actualizado_en'
        ]
        read_only_fields = ['creado_en', 'actualizado_en', 'usuario']

    def get_cuota(self, obj):
        from .serializers import SaldoCuotasSerializer
        return SaldoCuotasSerializer(obj.cuota).data if obj.cuota else None

    def validate(self, data):
        cuota = data.get('cuota')
        monto_cobrado = data.get('monto_cobrado')
        logger.info(f"Validando datos: cuota_id={cuota.id if cuota else None}, monto_cobrado={monto_cobrado}")
        if not cuota:
            raise serializers.ValidationError("Debe proporcionar un cuota_id válido.")
        if monto_cobrado != cuota.monto_total:
            raise serializers.ValidationError(
                f"El monto cobrado ({monto_cobrado}) debe ser igual al monto total ({cuota.monto_total})."
            )
        if cuota.estado == EstadoCuota.PAGADA:
            raise serializers.ValidationError("La cuota ya está pagada.")
        return data

    def create(self, validated_data):
        try:
            with transaction.atomic():
                logger.info(f"Creando cobro con datos: {validated_data}")
                cobro = super().create(validated_data)
                cobro.cuota.estado = EstadoCuota.PAGADA
                cobro.cuota.fecha_pago = cobro.fecha_cobro
                cobro.cuota.save(update_fields=['estado', 'fecha_pago'])
                logger.info(f"Cobro creado: ID {cobro.id}, Cuota ID {cobro.cuota_id}")
                return cobro
        except IntegrityError as e:
            logger.error(f"Error de unicidad: {str(e)}")
            raise serializers.ValidationError("Ya existe un cobro para esta cuota.")
        except Exception as e:
            logger.error(f"Error al crear CobroCuotaInfante: {str(e)}")
            raise