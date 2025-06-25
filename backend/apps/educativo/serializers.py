from rest_framework import serializers
from .models import Infante, Tutor, Turno, Sala, AnhoLectivo, Persona, TransferenciaInfante, TransferenciaProfesor
from datetime import datetime, date
from api.serializer import PersonaSerializer
from inscripciones.models import PeriodoInscripcion
from django.db import transaction
from datetime import date
import traceback
from apps.notificaciones.utils import notificar_transferencia_a_tutores



def obtener_periodo_activo():
    periodo = PeriodoInscripcion.objects.filter(activo=True).order_by("fecha_inicio").first()
    if not periodo:
        raise serializers.ValidationError("No hay un período de inscripción activo actualmente.")
    print(periodo)
    return periodo

class InfanteSerializer(serializers.ModelSerializer):
    id_persona = PersonaSerializer(read_only=True)
    nombre_sala=serializers.SerializerMethodField(read_only=True)
    es_propio=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Infante
        fields = '__all__'
        read_only_fields=["sala","nombre_sala","es_propio"]

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
        except Tutor.DoesNotExist:
            return False
    def validate(self, data):
        nueva_sala = data.get("id_sala") or getattr(self.instance, "id_sala", None)
        if not nueva_sala:
            return data  

        ya_estaba_en_sala = (
            self.instance and self.instance.id_sala_id == nueva_sala.id
        )

        with transaction.atomic():
            total_actual = nueva_sala.infantes.select_for_update().count()


            if not ya_estaba_en_sala:
                if (
                    nueva_sala.limite_infantes is not None and
                    total_actual >= nueva_sala.limite_infantes
                ):
                    raise serializers.ValidationError(
                        "La sala ya alcanzó el límite de infantes."
                    )

        return data

    def create(self, validated_data):
        validated_data["periodo_inscripcion"] = obtener_periodo_activo()
        return super().create(validated_data)

class InfanteCreateUpdateSerializer(serializers.ModelSerializer):
    id_persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all())

    class Meta:
        model = Infante
        fields = '__all__'

    def validate(self, data):
        nueva_sala = data.get("id_sala") or getattr(self.instance, "id_sala", None)
        if not nueva_sala:
            return data  

        ya_estaba_en_sala = (
            self.instance and self.instance.id_sala_id == nueva_sala.id
        )

        with transaction.atomic():
            total_actual = nueva_sala.infantes.select_for_update().count()


            if not ya_estaba_en_sala:
                if (
                    nueva_sala.limite_infantes is not None and
                    total_actual >= nueva_sala.limite_infantes
                ):
                    raise serializers.ValidationError(
                        "La sala ya alcanzó el límite de infantes."
                    )

        return data

    def create(self, validated_data):
        validated_data["periodo_inscripcion"] = obtener_periodo_activo()
        return super().create(validated_data)
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

    def create(self, validated_data):
        validated_data["periodo_inscripcion"] = obtener_periodo_activo()
        return super().create(validated_data)
class TutorCreateUpdateSerializer(serializers.ModelSerializer):
    id_persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all(),required=False)

    class Meta:
        model = Tutor
        fields = '__all__'

    def create(self, validated_data):
        validated_data["periodo_inscripcion"] = obtener_periodo_activo()
        print(validated_data)
        return super().create(validated_data)



class TurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = "__all__"


class SalaSerializer(serializers.ModelSerializer):
    nombre_profesor = serializers.SerializerMethodField(read_only=True)
    profesor_encargado_obj = PersonaSerializer(source="profesor_encargado", read_only=True)
    profesor_encargado = serializers.PrimaryKeyRelatedField(
        queryset=Persona.objects.all(),
        required=False
    )

    class Meta:
        model = Sala
        fields = "__all__"
        read_only_fields = ["nombre_profesor", "periodo_inscripcion"]

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

    def validate(self, data):
        hora_entrada = data.get('hora_entrada') or getattr(self.instance, 'hora_entrada', None)
        hora_salida = data.get('hora_salida') or getattr(self.instance, 'hora_salida', None)

        if hora_entrada and hora_salida:
            if hora_salida <= hora_entrada:
                raise serializers.ValidationError("La hora de salida debe ser posterior a la hora de entrada.")
            diferencia_horas = (
                datetime.combine(date.min, hora_salida) - datetime.combine(date.min, hora_entrada)
            ).total_seconds() / 3600
            if diferencia_horas > 5:
                raise serializers.ValidationError("La diferencia entre hora de entrada y salida no puede ser mayor a 5 horas.")
        return data

    def create(self, validated_data):
        validated_data["periodo_inscripcion"] = obtener_periodo_activo()
        return super().create(validated_data)


class AnhoLectivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnhoLectivo
        fields = "__all__"






#transferir sala
# En serializers.py
'''
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
    
'''

#Nueva transferenciaSalaSerializer para validaciones, cantidad que se puede en una sala 
#y meses del infante que debe pertenecer a dicha sala
class TransferenciaSalaSerializer(serializers.Serializer):
    id_infante = serializers.IntegerField()
    id_nueva_sala = serializers.IntegerField()
    motivo = serializers.CharField()

    def validate(self, data):
        try:
            infante = Infante.objects.select_related('id_persona').get(pk=data['id_infante'])
        except Infante.DoesNotExist:
            raise serializers.ValidationError("El infante no existe.")

        try:
            nueva_sala = Sala.objects.get(pk=data['id_nueva_sala'])
        except Sala.DoesNotExist:
            raise serializers.ValidationError("La sala no existe.")
        
        # Verificar si ya está en la misma sala
        if infante.id_sala_id == nueva_sala.id:
           raise serializers.ValidationError("Este infante ya está asignado a esta sala.")

        # Validar capacidad
        if nueva_sala.infantes.count() >= nueva_sala.limite_infantes:
            raise serializers.ValidationError("La sala ya alcanzó su capacidad máxima.")

        # Validar edad del infante en meses
        fecha_nac = infante.id_persona.fecha_nacimiento
        hoy = date.today()
        edad_meses = (hoy.year - fecha_nac.year) * 12 + (hoy.month - fecha_nac.month)
        if hoy.day < fecha_nac.day:
            edad_meses -= 1

        if nueva_sala.meses and edad_meses > nueva_sala.meses:
            raise serializers.ValidationError(
                f"El infante tiene {edad_meses} meses y supera el límite de {nueva_sala.meses} meses permitido para esta sala."
            )

        # Guardar referencias para el método save()
        data['infante'] = infante
        data['nueva_sala'] = nueva_sala
        return data

    def save(self):
        try:
            infante = self.validated_data["infante"]
            nueva_sala = self.validated_data["nueva_sala"]
            motivo = self.validated_data["motivo"]
            sala_origen = infante.id_sala  # puede ser None

            # Registrar transferencia
            TransferenciaInfante.objects.create(
                infante=infante,
                sala_origen=sala_origen,
                sala_destino=nueva_sala,
                motivo=motivo
            )

            # Actualizar asignación de sala
            infante.id_sala = nueva_sala
            infante.save()

            # Enviar notificación al tutor
            notificar_transferencia_a_tutores(infante, sala_origen, nueva_sala, motivo)

            return infante

        except Exception as e:
            print("🔥 Error en transferencia de infante:", e)
            traceback.print_exc()
            raise serializers.ValidationError("Error inesperado en el servidor al guardar la transferencia.")


    ###transferir profesor

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
            nueva_sala = Sala.objects.get(pk=data['id_sala_destino'])
        except Sala.DoesNotExist:
            raise serializers.ValidationError("La sala no existe.")

        # ✅ Validar si ya está asignado como encargado en la sala destino
        if nueva_sala.profesor_encargado_id == persona.id:
            raise serializers.ValidationError("Este profesor ya está asignado a esta sala.")

        data['nueva_sala'] = nueva_sala
        data['profesor'] = persona
        return data

    def save(self):
        profesor = self.validated_data["profesor"]
        nueva_sala = self.validated_data["nueva_sala"]
        motivo = self.validated_data["motivo"]

        # Buscar sala origen, si existe
        sala_origen = Sala.objects.filter(profesor_encargado=profesor).first()

        # Registrar historial de transferencia
        TransferenciaProfesor.objects.create(
            profesor=profesor,
            sala_origen=sala_origen,
            sala_destino=nueva_sala,
            motivo=motivo
        )

        # Asignar profesor a la nueva sala
        nueva_sala.profesor_encargado = profesor
        nueva_sala.save()
        return nueva_sala



 







