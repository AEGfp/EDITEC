from rest_framework import serializers
from .models import Local
from empresas.models import Empresa

# Serializer para locales o sucursales
class LocalesSerializer(serializers.ModelSerializer):
    # Solo permitirá crear sucursales referenciando a empresas con estado activo
    id_empresa = serializers.SlugRelatedField(
        slug_field = 'descripcion',
        queryset = Empresa.objects.filter(estado=True))
    class Meta:
        model = Local
        fields = ['id', 'descripcion', 'titulo_reportes', 'estado',
                  'direccion', 'id_empresa', 'id_usuario_aud']
