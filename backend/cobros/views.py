from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.serializer import (
    PermisoSerializer,
    UserSerializer,
    PersonaSerializer,
    
)
from api.models import Permiso, Persona
from Roles.roles import (
    EsDirector,
    EsProfesor,
    EsAdministrador,
    EsTutor,
    ControlarRoles,
)


from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ParametrosCobros, SaldoCuotas
from .serializers import ParametrosCobrosSerializer, SaldoCuotasSerializer
from datetime import date 
from calendar import monthrange
from apps.educativo.models import Infante
from django.db import IntegrityError


# View para los parámetros
@permission_classes([AllowAny])
class ParametrosCobrosView(viewsets.ModelViewSet):
    queryset = ParametrosCobros.objects.all()
    serializer_class = ParametrosCobrosSerializer


# View para los saldos de las cuotas
@permission_classes([AllowAny])
class SaldoCuotasView(viewsets.ModelViewSet):
    queryset = SaldoCuotas.objects.all()
    serializer_class = SaldoCuotasSerializer



@api_view(["POST"])
@permission_classes([AllowAny])
# Función para generar las cuotas de un infante basado en los parámetros
def generar_cuotas(request):
        id_infante = request.data.get("id_infante")

        # Se valida que se tenga un id del infante
        if not id_infante:
            return Response({"Error:": "Se requiere seleccionar un infante para generar las cuotas"}, status=400)
        
        try: 
            infante = Infante.objects.get(id = id_infante)

            # Se valida que exista el infante
        except Infante.DoesNotExist:
            return Response({"Error": "El infante no se encuentra en la base de datos"}, status=404)
        
        # Se obtienen los parámetros
        parametros = ParametrosCobros.objects.filter(estado=True).first()
        
        # Se validan que existan parámetros activos
        if not parametros:
            return Response({"Error": "No existen parámetros activos para la generación de las cuotas"}, status=400)
        
        # Se obtiene la fecha actual
        hoy = date.today()
        c_generadas = [] # Lista vacía para las cuotas
        num = 1 # Para el número de cuotas

        for mes in range(parametros.mes_inicio, parametros.mes_fin + 1):
            if SaldoCuotas.objects.filter(id_infante = infante, anho= parametros.anho, mes = mes).exists():
                continue

            dia_vencimiento = min(parametros.dia_limite_pago, monthrange(parametros.anho, mes)[1])
            fecha_vencimiento = date(parametros.anho, mes, dia_vencimiento)

            try:
                cuota = SaldoCuotas.objects.create(
                    id_infante = infante,
                    anho = parametros.anho,
                    mes = mes,
                    fecha_vencimiento = fecha_vencimiento,
                    nro_cuota = num,
                    monto_cuota = parametros.monto_cuota,
                    monto_mora = 0,
                    monto_total = parametros.monto_cuota,
                    saldo = parametros.monto_cuota,
                )
                c_generadas.append(cuota)

            except IntegrityError as e:
                print(f"Cuota duplicada para {infante} {mes}/{parametros.anho}")
                continue
            num = num + 1

        serializer = SaldoCuotasSerializer(c_generadas, many= True)

        if not c_generadas:
            return Response({"detalle": "No se generaron nuevas cuotas. Ya existen para el infante."}, status=200)

        return Response(serializer.data, status=201)
