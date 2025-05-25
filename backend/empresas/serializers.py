from rest_framework import serializers
from .models import Empresa

# Serializer para empresas
class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'