from rest_framework import serializers
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, Persona

from api.serializer import PersonaSerializer


class InfanteSerializer(serializers.ModelSerializer):
    id_persona = PersonaSerializer(read_only=True)
    nombre_sala=serializers.SerializerMethodField(read_only=True)
    es_propio=serializers.SerializerMethodField(read_only=True)
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
    email = serializers.SerializerMethodField(read_only=True)
    es_propio=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Tutor
        fields = '__all__'

    def get_email(self, obj):
        try:
            return obj.id_persona.user.email
        except AttributeError:
            return None

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

    # Esta línea permite incluir el objeto completo de la persona
    profesor_encargado_obj = PersonaSerializer(source="profesor_encargado", read_only=True)

    profesor_encargado = serializers.PrimaryKeyRelatedField(
        queryset=Persona.objects.all(),
        required=False
     )
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


#Tranferencia de sala
class TransferenciaSalaSerializer(serializers.Serializer):
    id_infante = serializers.IntegerField()
    id_nueva_sala = serializers.IntegerField()

    def validate(self, data):
        try:
            data['infante'] = Infante.objects.get(pk=data['id_infante'])
        except Infante.DoesNotExist:
            raise serializers.ValidationError("El infante no existe.")

        try:
            data['nueva_sala'] = Sala.objects.get(pk=data['id_nueva_sala'])
        except Sala.DoesNotExist:
            raise serializers.ValidationError("La sala no existe.")

        return data

    def save(self):
        infante = self.validated_data["infante"]
        nueva_sala = self.validated_data["nueva_sala"]
        infante.id_sala = nueva_sala
        infante.save()
        return infante

#tranferir profesor
# En serializers.py
class TransferenciaProfesorSerializer(serializers.Serializer):
    id_profesor = serializers.IntegerField()
    id_sala_destino = serializers.IntegerField()

    def validate(self, data):
        try:
            persona = Persona.objects.get(pk=data['id_profesor'])
        except Persona.DoesNotExist:
            raise serializers.ValidationError("El profesor no existe.")

        try:
            data['nueva_sala'] = Sala.objects.get(pk=data['id_sala_destino'])
        except Sala.DoesNotExist:
            raise serializers.ValidationError("La sala no existe.")

        data['profesor'] = persona
        return data

    def save(self):
        sala = self.validated_data["nueva_sala"]
        sala.profesor_encargado = self.validated_data["profesor"]
        sala.save()
        return sala


