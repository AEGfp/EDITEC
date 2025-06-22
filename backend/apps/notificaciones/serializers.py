from rest_framework import serializers
from .models import Notificacion
from datetime import date

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'

    def validate(self, data):
        errores = {}

        # Validar título no vacío
        if not data.get('titulo', '').strip():
            errores['titulo'] = 'El título no puede estar vacío.'

        # Validar contenido no vacío
        if not data.get('contenido', '').strip():
            errores['contenido'] = 'El mensaje no puede estar vacío.'

        # Validar que la fecha no sea pasada
        if 'fecha' in data and data['fecha'] < date.today():
            errores['fecha'] = 'La fecha no puede ser anterior a hoy.'

        # Validar que se seleccione un evento válido
        if not data.get('evento'):
            errores['evento'] = 'Debe seleccionar un evento.'

        # ✅ Si NO se marca enviar a todos, validar que haya salas
        if not data.get('enviar_a_todos', False):
            if not data.get('salas_destinatarias') and not data.get('salas_excluidas'):
                errores['salas_destinatarias'] = (
                    'Debe seleccionar al menos una sala destinataria o excluir alguna sala.'
                )

        if errores:
            raise serializers.ValidationError(errores)

        return data
