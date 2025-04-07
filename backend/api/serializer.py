from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Permiso, Persona, PerfilUsuario
from django.db import models


class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = "__all__"


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilUsuarioSerializer()

    class Meta:
        model = User
        fields = ["id", "username", "email", "perfil"]

    def create(self, validated_data):
        perfil_data = validated_data.pop("perfil")
        persona_data = perfil_data.pop("persona")

        persona = Persona.objects.create(**persona_data)
        user = User.objects.create(**validated_data)
        PerfilUsuario.objects.create(usuario=user, persona=persona)

        return user


class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = "__all__"
