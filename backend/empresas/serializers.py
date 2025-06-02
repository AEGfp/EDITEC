from rest_framework import serializers
from .models import Empresa
import os

# Serializer para empresas
class EmpresaSerializer(serializers.ModelSerializer):
    #logo_reporte = serializers.SerializerMethodField()
    class Meta:
        model = Empresa
        fields = '__all__'
        '''fields = ['id', 'descripcion', 'titulo_reportes', 'direccion',     
                  'telefono', 'ruc','actividad','estado','id_usuario_aud','logo_reporte'] 
                  '''
        '''def get_logo_reporte(self, obj):
            if obj.logo_reporte:
                return os.path.basename(obj.logo_reporte.name)
                '''