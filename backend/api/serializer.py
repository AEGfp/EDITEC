from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Permiso, Persona 
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = "__all__"

    def validate_ci(self, value):
        persona_instance = self.instance
        if Persona.objects.filter(ci=value).exclude(pk=persona_instance.pk if persona_instance else None).exists():
            raise serializers.ValidationError("Este CI ya está registrado para otra persona.")
        return value



class UserSerializer(serializers.ModelSerializer):
    persona = PersonaSerializer()
    password = serializers.CharField(write_only=True,required=False,validators=[validate_password])
    groups = serializers.SlugRelatedField(
        many=True,
        queryset=Group.objects.all(),
        slug_field="name",
        required=False,
    )
    email=serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "groups", "password", "persona"]


    def validate_email(self,value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("El correo electrónico es obligatorio")

        user_id = self.instance.id if self.instance else None
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("El correo electrónico es utilizado por otro usuario")

        return value


    def create(self, validated_data):
        persona_data = validated_data.pop("persona")
        groups_data = validated_data.pop("groups", [])
        password = validated_data.pop("password")

        with transaction.atomic():
            user = User(**validated_data)
            user.set_password(password)
            user.save()

            user.groups.set(groups_data)
            Persona.objects.create(**persona_data, user=user)

        return user

    def update(self, instance, validated_data):
        persona_data = validated_data.pop("persona", None)
        groups_data = validated_data.pop("groups", [])
        password = validated_data.pop("password", None)

        request = self.context.get("request")
        partial = request.method == "PATCH"

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if password and password.strip():
                instance.set_password(password)

            instance.groups.set(groups_data)
            instance.save()

            if persona_data:
                try:
                    persona = Persona.objects.get(user=instance)
                except Persona.DoesNotExist:
                    raise serializers.ValidationError({"persona": "No se encontró la persona asociada a este usuario"})

                persona_serializer = PersonaSerializer(
                    instance=persona,
                    data=persona_data,
                    partial=partial
                )

                if not persona_serializer.is_valid():
                    print("Error al validar persona:", persona_serializer.errors)
                    raise serializers.ValidationError({"persona": persona_serializer.errors})

                persona_serializer.save()

        return instance
class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = "__all__"
