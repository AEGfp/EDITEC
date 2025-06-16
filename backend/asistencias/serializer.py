from rest_framework import serializers
from .models import Asistencia
from apps.educativo.serializers import InfanteSerializer
from django.utils.timezone import now, localtime


class AsistenciaSerializer(serializers.ModelSerializer):
    nombre_infante = serializers.SerializerMethodField()
    apellido_infante = serializers.SerializerMethodField()
    nombre_usuario = serializers.SerializerMethodField()
    apellido_usuario = serializers.SerializerMethodField()
    hora_entrada_formateada = serializers.SerializerMethodField()
    hora_salida_formateada = serializers.SerializerMethodField()
    fecha_formateada = serializers.SerializerMethodField()

    class Meta:
        model = Asistencia
        fields = "__all__"
        read_only_fields = ["fecha", "hora_entrada", "usuario_auditoria"]

    def get_nombre_infante(self, obj):
        return (
            obj.id_infante.id_persona.nombre
            if obj.id_infante and obj.id_infante.id_persona
            else ""
        )

    def get_apellido_infante(self, obj):
        return (
            obj.id_infante.id_persona.apellido
            if obj.id_infante and obj.id_infante.id_persona
            else ""
        )

    def get_nombre_usuario(self, obj):
        if obj.usuario_auditoria and obj.usuario_auditoria.persona:
            return obj.usuario_auditoria.persona.nombre
        return ""

    def get_apellido_usuario(self, obj):
        if obj.usuario_auditoria and obj.usuario_auditoria.persona:
            return obj.usuario_auditoria.persona.apellido
        return ""

    def get_hora_entrada_formateada(self, obj):
        if obj.hora_entrada:
            return obj.hora_entrada.strftime("%H:%M")
        return "-"

    def get_hora_salida_formateada(self, obj):
        if obj.hora_salida:
            return obj.hora_salida.strftime("%H:%M")
        return "-"

    def get_fecha_formateada(self, obj):
        if obj.fecha:
            return obj.fecha.strftime("%d/%m/%Y")
        return "-"

    def create(self, validated_data):
        usuario = self.context["request"].user
        from django.utils.timezone import now

        fecha_hoy = now().date()

        id_infante = validated_data["id_infante"]
        estado = validated_data["estado"]

        asistencia, created = Asistencia.objects.update_or_create(
            id_infante=id_infante,
            fecha=fecha_hoy,
            defaults={
                "estado": estado,
                "usuario_auditoria": usuario,
            },
        )
        return asistencia


class InfanteConAsistenciaSerializer(serializers.Serializer):
    infante = serializers.SerializerMethodField()
    asistencia = serializers.SerializerMethodField()

    def get_infante(self, obj):
        return InfanteSerializer(obj).data

    def get_asistencia(self, obj):
        hoy = localtime(now()).date()
        try:
            asistencia = Asistencia.objects.get(id_infante=obj, fecha=hoy)
            return AsistenciaSerializer(asistencia).data
        except Asistencia.DoesNotExist:
            return None
