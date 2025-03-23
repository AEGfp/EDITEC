from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Permiso

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields='__all__'
class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Permiso
        fields='__all__'
