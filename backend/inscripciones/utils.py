from datetime import date
from apps.educativo.models import Sala

def calcular_edad_meses(fecha_nacimiento):
    hoy = date.today()
    return (hoy.year - fecha_nacimiento.year) * 12 + hoy.month - fecha_nacimiento.month

def asignar_sala_automatica(fecha_nacimiento, hora_entrada):
    edad_meses = calcular_edad_meses(fecha_nacimiento)

    salas_disponibles = Sala.objects.filter(
        meses__gte=edad_meses,
        hora_entrada__lte=hora_entrada,
        hora_salida__gt=hora_entrada,
    ).order_by('meses')

    for sala in salas_disponibles:
        if sala.puede_agregar_infante():
            return sala

    return None 