from rest_framework import serializers
from .models import Inscripcion
from api.models import Persona
from apps.educativo.models import Tutor


class InscripcionSerializer(serializers.ModelSerializer):
    nombre_tutor=serializers.SerializerMethodField()
    nombre_infante = serializers.SerializerMethodField()    
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
        ]

    def get_nombre_tutor(self,obj):
        persona=obj.id_tutor.id_persona
        return f"{persona.nombre} {persona.apellido}"

    def get_nombre_infante(self,obj):
        persona=obj.id_infante.id_persona
        return f"{persona.nombre} {persona.apellido}"

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
