import os
import django
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "editec.settings")
django.setup()

from pagos.models import TipoComprobante, Condicion

tipo_comprobante_data = [
    {
        "id": 1,
        "tipo_saldo": "S",
        "descripcion": "FACTURA",
        "estado": True,
        "id_usuario_aud": None
    }
]

condicion_data = [
    {
        "id": 1,
        "descripcion": "CONTADO",
        "estado": True,
        "cantidad_cuotas": 1,
        "id_usuario_aud": None
    },
    {
        "id": 2,
        "descripcion": "CREDITO 3 CUOTAS",
        "estado": True,
        "cantidad_cuotas": 3,
        "id_usuario_aud": None
    },
    {
        "id": 3,
        "descripcion": "CREDITO 5 CUOTAS",
        "estado": True,
        "cantidad_cuotas": 5,
        "id_usuario_aud": None
    },
    {
        "id": 4,
        "descripcion": "CREDITO 10 CUOTAS",
        "estado": True,
        "cantidad_cuotas": 10,
        "id_usuario_aud": None
    }
]

print("--- Previsualización de Tipos de Comprobante y Condiciones ---")
print("-" * 50)

print("Tipos de Comprobante:")
for item in tipo_comprobante_data:
    print(f"  - ID: {item['id']}")
    print(f"    Tipo Saldo: {item['tipo_saldo']}")
    print(f"    Descripción: {item['descripcion']}")
    print(f"    Estado: {item['estado']}")
    print(f"    ID Usuario Aud: {item['id_usuario_aud']}")
print("-" * 50)

print("Condiciones:")
for item in condicion_data:
    print(f"  - ID: {item['id']}")
    print(f"    Descripción: {item['descripcion']}")
    print(f"    Estado: {item['estado']}")
    print(f"    Cantidad Cuotas: {item['cantidad_cuotas']}")
    print(f"    ID Usuario Aud: {item['id_usuario_aud']}")
print("-" * 50)

print("--- Fin de la previsualización ---")

# Create or get TipoComprobante records
for item in tipo_comprobante_data:
    tipo_comprobante, created = TipoComprobante.objects.get_or_create(
        id=item['id'],
        defaults={
            'tipo_saldo': item['tipo_saldo'],
            'descripcion': item['descripcion'],
            'estado': item['estado'],
            'id_usuario_aud': item['id_usuario_aud']
        }
    )
    if created:
        print(f"Created TipoComprobante: '{tipo_comprobante.descripcion}' (ID: {tipo_comprobante.id})")
    else:
        print(f"TipoComprobante already exists: '{tipo_comprobante.descripcion}' (ID: {tipo_comprobante.id})")

# Create or get Condicion records
for item in condicion_data:
    condicion, created = Condicion.objects.get_or_create(
        id=item['id'],
        defaults={
            'descripcion': item['descripcion'],
            'estado': item['estado'],
            'cantidad_cuotas': item['cantidad_cuotas'],
            'id_usuario_aud': item['id_usuario_aud']
        }
    )
    if created:
        print(f"Created Condicion: '{condicion.descripcion}' (ID: {condicion.id})")
    else:
        print(f"Condicion already exists: '{condicion.descripcion}' (ID: {condicion.id})")

print("--- Finished creating records ---")
