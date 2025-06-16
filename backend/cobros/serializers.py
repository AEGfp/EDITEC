from rest_framework import serializers
from .models import ParametrosCobros, SaldoCuotas

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