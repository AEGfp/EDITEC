from rest_framework import serializers
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, Inscripcion, Persona
from api.serializer import PersonaSerializer


class InfanteSerializer(serializers.ModelSerializer):
    id_persona = PersonaSerializer(read_only=True)

    class Meta:
        model = Infante
        fields = '__all__'

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
        fields = '__all__'

class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = '__all__'

class AnhoLectivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnhoLectivo
        fields = '__all__'

class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = '__all__'
