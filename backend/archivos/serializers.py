from rest_framework import serializers
from .models import Archivos


class ArchivosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Archivos
        fields = "__all__"
