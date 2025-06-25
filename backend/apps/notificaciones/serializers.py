from rest_framework import serializers
from .models import Notificacion
from datetime import date, datetime
import json

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'

    def validate(self, data):
        errores = {}

        titulo = data.get("titulo", "").strip()
        contenido = data.get("contenido", "").strip()
        evento = data.get("evento")
        enviar_a_todos = data.get("enviar_a_todos", False)

        salas_destinatarias = data.get("salas_destinatarias", [])
        salas_excluidas = data.get("salas_excluidas", [])

        # Validaciones
        if not titulo:
            errores['titulo'] = 'El título no puede estar vacío.'

        if not contenido:
            errores['contenido'] = 'El mensaje no puede estar vacío.'

        fecha = data.get("fecha")
        hora = data.get("hora")

        if not fecha:
            errores['fecha'] = 'Fecha inválida.'
        elif hora:
            try:
                fecha_hora = datetime.combine(fecha, hora)
                if fecha_hora < datetime.now():
                    errores['fecha'] = 'La fecha y hora no pueden ser anteriores al momento actual.'
            except Exception:
                errores['fecha'] = 'Fecha y hora inválidas.'
        else:
            if fecha < date.today():
                errores['fecha'] = 'La fecha no puede ser anterior a hoy.'

        if not evento:
            errores['evento'] = 'Debe seleccionar un evento.'

        if errores:
            raise serializers.ValidationError(errores)

        return data
