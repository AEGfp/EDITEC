from rest_framework import viewsets
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from .serializers import InscripcionSerializer
from .models import Inscripcion


# Create your views here.
@permission_classes([AllowAny])
class InscripcionView(viewsets.ModelViewSet):
    serializer_class = InscripcionSerializer
    queryset = Inscripcion.objects.all()

    def get_serializer_context(self):
        return {"request": self.request}
