from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Inscripcion, PeriodoInscripcion
from api.models import Persona, User
from apps.educativo.models import Tutor, Infante, TutorInfante
from api.serializer import UserSerializer, PersonaSerializer
from apps.educativo.serializers import TutorSerializer, InfanteSerializer,InfanteCreateUpdateSerializer,TutorCreateUpdateSerializer,obtener_periodo_activo
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.models import Group
from archivos.serializers import ArchivosSerializer
from archivos.models import Archivos
from .utils import asignar_sala_automatica


def validar_inscripcion_pendiente(tutor, infante):
    if (
        Inscripcion.objects.filter(id_tutor=tutor, id_infante=infante)
        .exclude(estado="rechazado")
        .exists()
    ):
        raise ValidationError(
            "Ya existe una inscripción pendiente entre ese tutor y ese infante."
        )


class InscripcionSerializer(serializers.ModelSerializer):
    nombre_tutor = serializers.SerializerMethodField()
    nombre_infante = serializers.SerializerMethodField()
    nombre_usuario = serializers.SerializerMethodField()
    fecha_inscripcion = serializers.DateField(format="%d/%m/%Y", read_only=True)
    fecha_revision = serializers.DateTimeField(format="%d/%m/%Y", read_only=True)
    id_persona_infante = serializers.SerializerMethodField()
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
            "id_persona_infante"
        ]

    def get_nombre_tutor(self, obj):
        persona = obj.id_tutor.id_persona
        return f"{persona.nombre} {persona.apellido}"

    def get_nombre_infante(self, obj):
        persona = obj.id_infante.id_persona
        return f"{persona.nombre} {persona.apellido}"

    def get_id_persona_infante(self,obj):
        return obj.id_infante.id_persona.id

    def get_nombre_usuario(self, obj):
        if obj.usuario_auditoria:
            return (
                obj.usuario_auditoria.get_full_name() or obj.usuario_auditoria.username
            )
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
        inscripcion= super().create(validated_data)

        TutorInfante.objects.get_or_create(tutor=tutor, infante=infante)

        return inscripcion

class InscripcionCompletaSerializer(serializers.Serializer):
    user_data_tutor = UserSerializer()
    tutor_data = TutorSerializer()
    persona_data_infante = PersonaSerializer()
    infante_data = InfanteSerializer()
    hora_entrada = serializers.TimeField(write_only=True) 

    def validate(self, data):
        return data

    def create(self, validated_data):
        request = self.context.get("request")

        user_data_tutor = validated_data["user_data_tutor"]
        tutor_data = validated_data["tutor_data"]
        persona_data_infante = validated_data["persona_data_infante"]
        infante_data = validated_data["infante_data"]
        hora_entrada = validated_data["hora_entrada"]

        with transaction.atomic():
            user_serializer = UserSerializer(data=user_data_tutor)
            user_serializer.is_valid(raise_exception=True)
            user_tutor = user_serializer.save()
            user_tutor.groups.add(Group.objects.get(name="tutor"))

            tutor_data["id_persona"] = user_tutor.persona.id
            tutor_serializer = TutorCreateUpdateSerializer(data=tutor_data)
            tutor_serializer.is_valid(raise_exception=True)
            tutor = tutor_serializer.save()

            persona_infante_serializer = PersonaSerializer(data=persona_data_infante)
            persona_infante_serializer.is_valid(raise_exception=True)
            persona_infante = persona_infante_serializer.save()

            sala = asignar_sala_automatica(
                persona_infante.fecha_nacimiento,
                hora_entrada,
            )
            if not sala:
                raise serializers.ValidationError(
                    "No se encontró una sala adecuada para el infante según la edad y horario seleccionado."
                )

            infante_data["id_persona"] = persona_infante.id
            infante_data["id_sala"] = sala.id
            infante_data["periodo_inscripcion"] = obtener_periodo_activo().id

            infante_serializer = InfanteCreateUpdateSerializer(data=infante_data)
            infante_serializer.is_valid(raise_exception=True)
            infante = infante_serializer.save()

            for nombre_campo, archivo in request.FILES.items():
                if nombre_campo.startswith("archivo_"):
                    descripcion = nombre_campo.replace("archivo_", "")
                    Archivos.objects.create(
                        persona=persona_infante,
                        archivo=archivo,
                        descripcion=f"{descripcion}_{persona_infante.ci}",
                    )

            validar_inscripcion_pendiente(tutor, infante)

            inscripcion = Inscripcion.objects.create(
                id_tutor=tutor,
                id_infante=infante,
                estado="pendiente"
            )

            TutorInfante.objects.get_or_create(tutor=tutor, infante=infante)

        return inscripcion


class InscripcionExistenteSerializer(serializers.Serializer):
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    tutor_data = TutorCreateUpdateSerializer(required=False)
    persona_data_infante = PersonaSerializer()
    infante_data = InfanteSerializer()
    hora_entrada = serializers.TimeField(write_only=True)

    def validate(self, data):
        user = data["user_id"]
        persona = user.persona

        # Si ya tiene tutor, no permitir tutor_data (opcional)
        if hasattr(persona, "tutor") and "tutor_data" in data:
            data.pop("tutor_data", None)

        return data

    def create(self, validated_data):
        request = self.context.get("request")

        user = validated_data["user_id"]
        tutor_data = validated_data.get("tutor_data")
        persona = user.persona
        infante_data = validated_data["infante_data"]
        hora_entrada = validated_data["hora_entrada"]

        tutor = Tutor.objects.filter(id_persona=persona).first()
        periodo_actual = obtener_periodo_activo()
        with transaction.atomic():
            if tutor:
                tutor.periodo_inscripcion = periodo_actual
                
                if tutor_data:
                    tutor_serializer = TutorCreateUpdateSerializer(
                        tutor, data=tutor_data, partial=True
                    )
                    tutor_serializer.is_valid(raise_exception=True)
                    tutor = tutor_serializer.save()
                else:
                    tutor.save()
            else:
                if user.groups.filter(name="tutor").exists():
                    raise serializers.ValidationError(
                        "El usuario ya pertenece al grupo 'tutor' pero no tiene un objeto Tutor asociado."
                    )
                if not tutor_data:
                    raise serializers.ValidationError(
                        "Datos del tutor requeridos para crear uno nuevo"
                    )
                
                tutor_data["id_persona"] = persona.id
                tutor_serializer = TutorCreateUpdateSerializer(data=tutor_data)
                tutor_serializer.is_valid(raise_exception=True)
                tutor = tutor_serializer.save()

                if not user.groups.filter(name="tutor").exists():
                    user.groups.add(Group.objects.get(name="tutor"))

            persona_infante_serializer = PersonaSerializer(data=validated_data["persona_data_infante"])
            persona_infante_serializer.is_valid(raise_exception=True)
            persona_infante = persona_infante_serializer.save()

            sala = asignar_sala_automatica(
                persona_infante.fecha_nacimiento,
                hora_entrada,
            )
            if not sala:
                raise serializers.ValidationError(
                    "No se encontró una sala adecuada para el infante según la edad y horario seleccionado."
                )

            infante_data["id_persona"] = persona_infante.id
            infante_data["id_sala"] = sala.id
            infante_data["periodo_inscripcion"] = obtener_periodo_activo().id

            infante_serializer = InfanteCreateUpdateSerializer(data=infante_data)
            infante_serializer.is_valid(raise_exception=True)
            infante = infante_serializer.save()

            for nombre_campo, archivo in request.FILES.items():
                if nombre_campo.startswith("archivo_"):
                    descripcion = nombre_campo.replace("archivo_", "")
                    Archivos.objects.create(
                        persona=persona_infante,
                        archivo=archivo,
                        descripcion=f"{descripcion}_{persona_infante.ci}",
                    )

            validar_inscripcion_pendiente(tutor, infante)

            inscripcion = Inscripcion.objects.create(
                id_tutor=tutor,
                id_infante=infante,
                estado="pendiente"
            )

            TutorInfante.objects.get_or_create(tutor=tutor, infante=infante)

        return inscripcion



class PeriodoInscripcionSerializer(serializers.ModelSerializer):
    es_abierto = serializers.ReadOnlyField()
    es_pendiente = serializers.ReadOnlyField()
    es_cerrado = serializers.ReadOnlyField()

    class Meta:
        model = PeriodoInscripcion
        fields = ['id', 'fecha_inicio', 'fecha_fin', 'activo', 'es_abierto', 'es_pendiente', 'es_cerrado']

    def validate(self, data):
        fecha_inicio = data.get('fecha_inicio', getattr(self.instance, 'fecha_inicio', None))
        fecha_fin = data.get('fecha_fin', getattr(self.instance, 'fecha_fin', None))

        if fecha_inicio >= fecha_fin:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")

        queryset = PeriodoInscripcion.objects.filter(
            fecha_inicio__lte=fecha_fin,
            fecha_fin__gte=fecha_inicio
        )
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("Ya existe un período de inscripción que se solapa con estas fechas.")

        ahora = timezone.now()
        activo = data.get('activo', getattr(self.instance, 'activo', True))

        sera_activo = fecha_inicio > ahora or (activo and fecha_inicio <= ahora <= fecha_fin)

        if sera_activo:
            otros_activos = PeriodoInscripcion.objects.exclude(pk=self.instance.pk if self.instance else None)
            for periodo in otros_activos:
                if periodo.es_abierto or periodo.es_pendiente:
                    raise serializers.ValidationError("Ya existe un período activo (abierto o pendiente). Solo puede haber uno a la vez.")

        return data
