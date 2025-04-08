from django.contrib import admin
from .models import Infante, Tutor, Sala, AnhoLectivo, Inscripcion, Turno

admin.site.register(Infante)
admin.site.register(Tutor)
admin.site.register(Turno)
admin.site.register(Sala)
admin.site.register(AnhoLectivo)
admin.site.register(Inscripcion)