from rest_framework import serializers
from .models import TipoInforme, Indicador, Informe, InformeIndicador


# Serializer de tipos de informe
class TipoInformeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoInforme
        fields = '__all__'


# Serializer de indicadores
class IndicadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicador
        fields = '__all__'


# Serializer para tabla intermedia informeindicador
class InformeIndicadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformeIndicador
        fields = ['id_informe','id_indicador','ind_logrado']
        extra_kwargs = {
            'id_informe': {'required': False}, 
        }           



# Serializer para Informes
class InformeSerializer(serializers.ModelSerializer):
    # Permitirá ver los indicadores anidados
    indicadores = InformeIndicadorSerializer(many= True, write_only= True) # Para crear en el Post
    indicadores_detalle = serializers.SerializerMethodField(read_only=True)
    descripcion_tipo_informe=serializers.SerializerMethodField(read_only=True)
    nombre_infante=serializers.SerializerMethodField(read_only=True)
    auditor_nombre_completo = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Informe
        fields = ['id', 'id_infante', 'id_tipo_informe', 'fecha_informe',
                  'observaciones', 'estado', 'id_usuario_aud', 'indicadores','indicadores_detalle', 'descripcion_tipo_informe',"nombre_infante","auditor_nombre_completo",]
    
    # Función para crear los indicadores del informe
    def create(self, data):
        indicadores_data = data.pop('indicadores',[])
        informe = Informe.objects.create(**data)

        for i in indicadores_data:
            InformeIndicador.objects.create(
                id_informe = informe,
                id_indicador = i['id_indicador'],
                ind_logrado = i['ind_logrado'],
                id_usuario_aud = informe.id_usuario_aud)
            
        return informe
    
    # Para obtener los indicadores asociados en el GET
    def get_indicadores_detalle(self, obj):
        relacionados = InformeIndicador.objects.filter(id_informe=obj).select_related('id_indicador')
        return [
            {
                'id_indicador': r.id_indicador.id,
                'nombre': r.id_indicador.nombre,  # ← ESTE CAMPO FALTABA
                'descripcion': r.id_indicador.descripcion,
                'ind_logrado': r.ind_logrado
            }
            for r in relacionados
        ]
        
    
    def get_descripcion_tipo_informe(self, obj):
        return obj.id_tipo_informe.descripcion if obj.id_tipo_informe else None

    def get_nombre_infante(self, obj):
        persona = obj.id_infante.id_persona
        if persona:
            return f"{persona.nombre} {persona.apellido} {persona.segundo_apellido}"
        return ""

    def get_auditor_nombre_completo(self, obj):
        persona = obj.id_usuario_aud.persona if obj.id_usuario_aud and hasattr(obj.id_usuario_aud, "persona") else None
        if persona:
            return f"{persona.nombre} {persona.apellido} {persona.segundo_apellido}".strip()
        return ""
