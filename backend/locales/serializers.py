from rest_framework import serializers
from .models import Local
from empresas.models import Empresa

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id_empresa','descripcion']

class LocalSerializer(serializers.ModelSerializer):
    id_empresa = EmpresaSerializer(read_only=True) 

    id_empresa_id = serializers.PrimaryKeyRelatedField(
        queryset=Empresa.objects.all(),
        write_only=True,
        label='Empresa'
    )

    estado = serializers.ChoiceField(
        choices=Local.OPCIONES_ESTADO,
        default='A'
    )
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation

    class Meta:
        model = Local
        fields = ['id_local','id_empresa_id','descripcion','estado','direccion','id_empresa']
        
    def create(self, validated_data):
        # Extraemos el id_empresa_id y lo asignamos manualmente
        id_empresa = validated_data.pop('id_empresa_id', None)
        if id_empresa:
            validated_data['id_empresa'] = id_empresa
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Extraemos el id_empresa_id y lo asignamos manualmente
        id_empresa = validated_data.pop('id_empresa_id', None)
        if id_empresa:
            validated_data['id_empresa'] = id_empresa
        return super().update(instance, validated_data)