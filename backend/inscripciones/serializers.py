from rest_framework import serializers
from .models import Inscripcion
from api.models import Persona
from apps.educativo.models import Tutor


class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = "__all__"
        read_only_fields = ["id_tutor", "fecha_inscripcion"]

    def create(self, validated_data):
        request = self.context.get("request")

        try:
            persona = request.user.persona
        except Persona.DoesNotExist:
            raise serializers.ValidationError("El usuario no tiene una persona asociada")

        try:
            tutor = persona.tutor
        except Tutor.DoesNotExist:
            raise serializers.ValidationError("El usuario no tiene un tutor asociado")

        infante = validated_data["id_infante"]

        if Inscripcion.objects.filter(
            id_tutor=tutor, id_infante=infante, estado="pendiente"
        ).exists():
            raise serializers.ValidationError("Ya existe una inscripción pendiente")

        validated_data["id_tutor"] = tutor
        return super().create(validated_data)