from rest_framework import serializers
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, Persona, TransferenciaInfante, TransferenciaProfesor

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
    
    def get_es_propio(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        user = request.user
        try:
            tutor = Tutor.objects.get(id_persona__user=user)
            return obj.tutores.filter(tutor=tutor).exists()
        except:
            return False

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

    def get_es_propio(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.id_persona.user == request.user

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
#tranferencia infante



#tranferir profesor
# En serializers.py
class TransferenciaSalaSerializer(serializers.Serializer):
    id_infante = serializers.IntegerField()
    id_nueva_sala = serializers.IntegerField()
    motivo = serializers.CharField()

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
        motivo = self.validated_data["motivo"]
        sala_origen = infante.id_sala  # Puede ser None

        # Registrar historial
        TransferenciaInfante.objects.create(
            infante=infante,
            sala_origen=sala_origen,
            sala_destino=nueva_sala,
            motivo=motivo
        )

        # Actualizar sala del infante
        infante.id_sala = nueva_sala
        infante.save()
        return infante
    

    ###
class TransferenciaProfesorSerializer(serializers.Serializer):
    id_profesor = serializers.IntegerField()
    id_sala_destino = serializers.IntegerField()
    motivo = serializers.CharField()

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
        sala_destino = self.validated_data["nueva_sala"]
        profesor = self.validated_data["profesor"]
        motivo = self.validated_data["motivo"]

        # Buscar sala de origen (si la tiene)
        sala_origen = Sala.objects.filter(profesor_encargado=profesor).first()

        # Guardar historial de transferencia
        TransferenciaProfesor.objects.create(
            profesor=profesor,
            sala_origen=sala_origen,
            sala_destino=sala_destino,
            motivo=motivo
        )

        # Actualizar profesor en sala nueva
        sala_destino.profesor_encargado = profesor
        sala_destino.save()
        return sala_destino


