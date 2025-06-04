from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Inscripcion
from api.models import Persona, User
from apps.educativo.models import Tutor,Infante
from api.serializer import UserSerializer,PersonaSerializer
from apps.educativo.serializers import TutorSerializer,InfanteSerializer
from django.db import transaction
from django.contrib.auth.models import Group

def validar_inscripcion_pendiente(tutor, infante):
    if Inscripcion.objects.filter(id_tutor=tutor, id_infante=infante).exclude(estado="rechazado").exists(): 
        raise ValidationError("Ya existe una inscripción pendiente entre ese tutor y ese infante.")  


class InscripcionSerializer(serializers.ModelSerializer):
    nombre_tutor=serializers.SerializerMethodField()
    nombre_infante = serializers.SerializerMethodField()    
    nombre_usuario=serializers.SerializerMethodField()    
    fecha_inscripcion = serializers.DateField(format="%d/%m/%Y", read_only=True)
    fecha_revision = serializers.DateTimeField(format="%d/%m/%Y", read_only=True)
    class Meta:
        model = Inscripcion
        fields = "__all__"
        read_only_fields = [
            "fecha_inscripcion",
            "usuario_auditoria",
            "fecha_revision",
            "id_tutor",
            "nombre_tutor",
            "nombre_infante",
            "nombre_usuario",
        ]

    def get_nombre_tutor(self,obj):
        persona=obj.id_tutor.id_persona
        return f"{persona.nombre} {persona.apellido}"

    def get_nombre_infante(self,obj):
        persona=obj.id_infante.id_persona
        return f"{persona.nombre} {persona.apellido}"

    def get_nombre_usuario(self,obj):
        if obj.usuario_auditoria:
            return obj.usuario_auditoria.get_full_name() or obj.usuario_auditoria.username
        return None

    def create(self, validated_data):
        request = self.context.get("request")

        try:
            persona = request.user.persona
        except Persona.DoesNotExist:
            raise serializers.ValidationError(
                "El usuario no tiene una persona asociada"
            )

        tutor = persona.tutor_set.first() 
        if not tutor:
            raise serializers.ValidationError("El usuario no tiene un tutor asociado")

        infante = validated_data["id_infante"]
        print(type(tutor))
        if Inscripcion.objects.filter(
            id_tutor=tutor, id_infante=infante, estado="pendiente"
        ).exists():
            raise serializers.ValidationError("Ya existe una inscripción pendiente")

        validated_data["id_tutor"] = tutor
        return super().create(validated_data)


class InscripcionCompletaSerializer(serializers.Serializer):
    user_data_tutor = UserSerializer()
    tutor_data = TutorSerializer()
    persona_data_infante = PersonaSerializer()
    infante_data = InfanteSerializer()

    def validate(self, data):
        return data

    def create(self, validated_data):
        user_data_tutor = validated_data["user_data_tutor"]
        tutor_data = validated_data["tutor_data"]
        persona_data_infante = validated_data["persona_data_infante"]
        infante_data = validated_data["infante_data"]

        with transaction.atomic():
            user_serializer = UserSerializer(data=user_data_tutor)
            user_serializer.is_valid(raise_exception=True)
            user_tutor = user_serializer.save()
            tutor_group = Group.objects.get(name="tutor")
            user_tutor.groups.add(tutor_group)

            tutor = Tutor.objects.create(
                id_persona=user_tutor.persona,
                **tutor_data
            )

            persona_infante_serializer = PersonaSerializer(data=persona_data_infante)
            persona_infante_serializer.is_valid(raise_exception=True)
            persona_infante = persona_infante_serializer.save()

            infante = Infante.objects.create(
                id_persona=persona_infante,
                **infante_data
            )

            validar_inscripcion_pendiente(tutor,infante)

            inscripcion = Inscripcion.objects.create(
                id_tutor=tutor,
                id_infante=infante,
                estado="pendiente"
            )

        return inscripcion

class InscripcionExistenteSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    tutor_data = serializers.DictField(required=False)  
    persona_data_infante = PersonaSerializer()
    infante_data = InfanteSerializer()

    def validate_user_id(self, value):
        try:
            return User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado")

    def validate(self, data):
        user = data["user_id"]

        if not hasattr(user, "persona"):
            raise serializers.ValidationError("El usuario no tiene una persona asociada")

        tutor_group = Group.objects.get(name="tutor")

        if not user.groups.filter(name="tutor").exists():
            user.groups.add(tutor_group)
            print(f"Usuario {user.username} agregado al grupo 'tutor' automáticamente")
        else:
            if "tutor_data" in data:
                print(f"Ignorando tutor_data para usuario {user.username} porque ya es tutor")
                data.pop("tutor_data", None)

        return data

    def create(self, validated_data):
        user = validated_data["user_id"]
        persona = user.persona

        tutor = getattr(persona, "tutor", None)

        with transaction.atomic():
            if not tutor:
                tutor_data = validated_data.get("tutor_data")
                if not tutor_data:
                    raise serializers.ValidationError("Datos del tutor requeridos para crear uno nuevo")
                tutor = Tutor.objects.create(id_persona=persona, **tutor_data)

            persona_data_infante = validated_data["persona_data_infante"]
            infante_data = validated_data["infante_data"]

            persona_infante_serializer = PersonaSerializer(data=persona_data_infante)
            persona_infante_serializer.is_valid(raise_exception=True)
            persona_infante = persona_infante_serializer.save()

            infante = Infante.objects.create(
                id_persona=persona_infante,
                **infante_data
            )

            validar_inscripcion_pendiente(tutor, infante)

            inscripcion = Inscripcion.objects.create(
                id_tutor=tutor,
                id_infante=infante,
                estado="pendiente"
            )

        return inscripcion