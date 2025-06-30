from .models import Empresa
from locales.models import Local
from django.utils import timezone

def obtener_datos_institucionales():
    return {
        "empresa": Empresa.objects.first(),
        "local": Local.objects.first(),
        "now": timezone.now()
    }
