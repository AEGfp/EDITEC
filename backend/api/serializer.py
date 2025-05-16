from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Permiso, Persona, PerfilUsuario
from django.db import models


class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = "__all__"


# ! REVISAR
class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    persona = PersonaSerializer()
    password = serializers.CharField(write_only=True)
    groups = serializers.SlugRelatedField(
        many=True,
        queryset=Group.objects.all(),
        slug_field="name",
        #! Revisar
        required=False,
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "persona", "groups", "password"]

    def create(self, validated_data):
        persona_data = validated_data.pop("persona")
        groups_data = validated_data.pop("groups", [])
        password = validated_data.pop("password")

        # Validar los datos de persona explícitamente
        persona_serializer = PersonaSerializer(data=persona_data)
        persona_serializer.is_valid(raise_exception=True)

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Asignar grupos si hay
        user.groups.set(groups_data)

        # Crear persona asociada al usuario
        persona_serializer.save(user=user)

        return user

class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = "__all__"
