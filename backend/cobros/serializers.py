from rest_framework import serializers
from .models import ParametrosCobros, SaldoCuotas, CobroCuotaInfante

# Serializador de parámetros
class ParametrosCobrosSerializer(serializers.ModelSerializer):
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