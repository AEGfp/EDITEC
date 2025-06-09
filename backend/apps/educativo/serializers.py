from rest_framework import serializers
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, Persona

from api.serializer import PersonaSerializer


class InfanteSerializer(serializers.ModelSerializer):
    id_persona = PersonaSerializer(read_only=True)
    nombre_sala=serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Infante
        fields = '__all__'
        read_only_fields=["sala"]

    def get_nombre_sala(self, obj):
        sala = obj.id_sala 
        if sala is None:
            return ""
        return sala.descripcion

class InfanteCreateUpdateSerializer(serializers.ModelSerializer):
    id_persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all())

    class Meta:
        model = Infante
        fields = '__all__'

# TUTORES
class TutorSerializer(serializers.ModelSerializer):
    id_persona = PersonaSerializer(read_only=True)

    class Meta:
        model = Tutor
        fields = '__all__'

class TutorCreateUpdateSerializer(serializers.ModelSerializer):
    id_persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all())

    class Meta:
        model = Tutor
        fields = '__all__'



class TurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = "__all__"


class SalaSerializer(serializers.ModelSerializer):
    nombre_profesor=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Sala
        fields = "__all__"
        read_only_fields=["nombre_profesor"]
        
    
    def get_nombre_profesor(self, obj):
        persona = obj.profesor_encargado
        if persona is None:
            return ""  
        return f"{persona.nombre} {persona.apellido}"

    def validate_profesor_encargado(self, persona):
        user = getattr(persona, "user", None)
        if not user:
            raise serializers.ValidationError("El profesor encargado no tiene un usuario asociado.")
        if not user.groups.filter(name="profesor").exists():
            raise serializers.ValidationError("El usuario no pertenece al grupo 'profesor'.")
        return persona


class AnhoLectivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnhoLectivo
        fields = "__all__"

