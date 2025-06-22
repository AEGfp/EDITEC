from rest_framework import serializers
from .models import Notificacion
from datetime import date, datetime

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'

    def validate(self, data):
        errores = {}

        titulo = self.initial_data.get("titulo", "").strip()
        contenido = self.initial_data.get("contenido", "").strip()
        evento = self.initial_data.get("evento")
        enviar_a_todos = self.initial_data.get("enviar_a_todos", False)
        salas_destinatarias = self.initial_data.get("salas_destinatarias", [])
        salas_excluidas = self.initial_data.get("salas_excluidas", [])

        if not titulo:
            errores['titulo'] = 'El título no puede estar vacío.'

        if not contenido:
            errores['contenido'] = 'El mensaje no puede estar vacío.'

        fecha_raw = self.initial_data.get("fecha")
        try:
            fecha_obj = datetime.strptime(fecha_raw, "%Y-%m-%d").date()
            if fecha_obj < date.today():
                errores['fecha'] = 'La fecha no puede ser anterior a hoy.'
        except Exception:
            errores['fecha'] = 'Fecha inválida.'

        if not evento:
            errores['evento'] = 'Debe seleccionar un evento.'

        if not enviar_a_todos and not salas_destinatarias and not salas_excluidas:
            errores['salas_destinatarias'] = (
                'Debe seleccionar al menos una sala destinataria o excluir alguna sala.'
            )

        if errores:
            raise serializers.ValidationError(errores)

        return data
