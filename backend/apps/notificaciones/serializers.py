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
        if not fecha:
            errores['fecha'] = 'Fecha inválida.'
        elif fecha < date.today():
            errores['fecha'] = 'La fecha no puede ser anterior a hoy.'

        if not evento:
            errores['evento'] = 'Debe seleccionar un evento.'

        if errores:
            raise serializers.ValidationError(errores)

        return data