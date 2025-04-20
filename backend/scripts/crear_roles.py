import os
import django
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "editec.settings")
django.setup()

from django.contrib.auth.models import Group

roles = ["director", "profesor", "tutor", "administrador"]

for rol in roles:
    grupo = Group.objects.get_or_create(name=rol)
