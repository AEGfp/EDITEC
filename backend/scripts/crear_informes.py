import os
import django
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "editec.settings")
django.setup()


from informes.models import TipoInforme,Indicador




data = [
    {
        "tipo_informe_desc": "Informe de desarrollo a los 7 meses",
        "indicadores": [
            {"nombre": "Posición erguida", "descripcion": "Se halla en una etapa intermedia en el camino del dominio completo de la posición erguida"},
            {"nombre": "Sedente", "descripcion": "Se sienta sin ayuda y puede mantener el tronco erguido alrededor de un minuto"},
            {"nombre": "Articulación", "descripcion": "Chilla y carcarea, 'lalea'. Comienza a vocalizar consonantes, sílabas y diptongos"},
        ]
    },
    {
        "tipo_informe_desc": "Informe de desarrollo a los 10 meses",
        "indicadores": [
            {"nombre": "Sedente", "descripcion": "Equilibrio perfectamente dominado. Es capaz de cambiar de posición, puede inclinarse, volverse de costado y volver a la posición sedente"},
            {"nombre": "Posición erguida", "descripcion": "Aún no domina el equilibrio en esta posición, pero las piernas ya sostienen el peso total del cuerpo con ayuda"},
            {"nombre": "Prensión y manipulación", "descripcion": "El pulgar y el índice revelan movilidad y extensión especializadas para hurguetear, revolver y arrancar (motricidad fina)"},
            {"nombre": "Articulación", "descripcion": " La vocalización articulada se encuentra favorecida por la destreza de los labios y lengua y de la musculatura de masticación y deglución y por la facultad imitativa"},
            {"nombre": "Vocabulario", "descripcion": "Aparece el barboteo audible (blu blu), producido por la activación de la lengua comprimida entre los labios. Posee 1 o 2 palabras en su vocab. (generalmente mamá, papá, teté)"},
            {"nombre": "Comprensión", "descripcion": "Es sensible a impresiones sociales: tiende a imitar ademanes, gestos y sonidos. Responde a su nombre y entiende que el no es no"}
        ]
    },
    {
        "tipo_informe_desc": "Informe de desarrollo a los 12 meses",
        "indicadores": [
            {"nombre": "Características motrices", "descripcion": "Gatea con gran presteza, pero a pesar de esta gran destreza, no resiste el impulso de levantarse sobre los pies, aunque aún no logra un equilibrio estable, por lo cual solo puede desplazarse de costado, agarrándose de algún sostén"},
            {"nombre": "Conducta adaptativa", "descripcion": "Naciente apreciación de la forma y el n°. Ya puede colocar objetos en recipientes y revela una perceptividad espacial para el agujero redondo"},
            {"nombre": "Articulación", "descripcion": "Vocalizaciones que pronto desembocarán en una elocuente jerga y en multiplicación dellenguaje articulado"},
            {"nombre": "Vocabulario", "descripcion": "Agrega 2 o 3 palabras más a su vocab. Trata de atraer la atención con estas palabras o con toses o chillidos. Aparece la jerga en el lenguaje ('hago como que hablo'), estando en su punto máximo"},
            {"nombre": "Comprensión", "descripcion": "Manifiesta un alto grado de reciprocidad social, escucha las palabras con mayor atención y repite las palabras familiares. Empieza a subordinar la acción a la palabra"}
        ]
    },
    {
        "tipo_informe_desc": "Informe de desarrollo a los 1 año y 6 meses",
        "indicadores": [
            {"nombre": "Características motrices", "descripcion": "El niño logra un dominio parcial de sus piernas. Ya puede pararse perfectamente sin ayuda y avanza velozmente con paso tieso, extendido e impetuoso"},
            {"nombre": "Conducta adaptativa", "descripcion": "A esta edad, el discernimiento entre espacio y forma que a los 12m empezó a aparecer, es prácticamente natural ya. Su sentido de verticalidad ha madurado mucho, y puede apilar ya dos y hasta 3 cubos verticalmente. Imita trazos verticales"},
            {"nombre": "Articulación", "descripcion": "Articula lo bastante bien como para decir papá/mamá cuando tiene hambre y decir no cuando está satisfecho. Abandona la media lengua"},
            {"nombre": "Vocabulario", "descripcion": "10 palabras bien definidas. Hay un sentido del yo totalitario, su expresividad es altamente egocéntrica"},
            {"nombre": "Comprensión", "descripcion": "Se encuentra más bien en el plano de la jerga que en el plano articulado. Acompaña el no con una sacudida de cabeza pero sin una comprensión clara de su significado. Empieza a utilizar palabras con los ademanes o incluso en lugar de ellos"}
        ]
    },
    {
        "tipo_informe_desc": "Informe de desarrollo a los 2 años",
        "indicadores": [
            {"nombre": "Características motrices", "descripcion": "Tiene decididamente una mentalidad motriz. Presenta importantes progresos en el control postural. Disfruta del juego fuerte y los revolcones"},
            {"nombre": "Conducta adaptativa", "descripcion": "Progreso atencional, reflejado en la construcción de torres. Además, es capaz de concentrarse en tareas reposadas más tiempo que antes"},
            {"nombre": "Articulación", "descripcion": "Su habla se encuentra más articulada y perfeccionada. El soliloquio se ha convertido en una especie de canto, canta sus frase"},
            {"nombre": "Vocabulario", "descripcion": "Puede poseer hasta 1000 palabras, aunque por lo general posee alrededor de 300. Predominan los nombres de cosas, personas, acciones y situaciones"},
            {"nombre": "Comprensión", "descripcion": "Puede formar oraciones con 3 o 4 palabras, pero no piensa ni habla en párrafos. Con la misma frase, expresa la intención y la acción"}
        ]
    },
    {
        "tipo_informe_desc": "Informe de desarrollo a los 3 años",
        "indicadores": [
            {"nombre": "Características motrices", "descripcion": "Su correr es más suave, aumenta y disminuye la velocidad con mayor facilidad, da vueltas más cerradas y domina las frenadas bruscas. Puede subir las escaleras sin ayuda y ya alternando los pies"},
            {"nombre": "Conducta adaptativa", "descripcion": " Sus discriminaciones manuales, perceptuales y verbales son más numerosas y categóricas. Hay un nuevo sentido del orden, el arreglo y el aseo"},
            {"nombre":"Percepción", "descripcion": "Es observador de la naturaleza, pero todavía no se percibe a sí mismo como un individuo social. Su observación aumenta y frecuentemente hace preguntas que obedecen al proceso de clasificación, identificación y comprensión"},
            {"nombre": "Concepción numérica", "descripcion": "Puede contar hasta dos objetos, también distingue entre uno y mucho"},
            {"nombre": "Resolución de problemas", "descripcion": "Conserva todavía el dogmatismo motor, es decir, es capaz de insistir con un modo motor no adaptativo"},
            {"nombre": "Vocabulario", "descripcion": "El vocabulario aumenta rápidamente, triplicándose, aunque las palabras se encuentran en etapas de desarrollo muy desiguales"},
            {"nombre": "Comprensión", "descripcion": "Donde a los 2a adquiría palabras, ahora las usa verdaderamente. Las palabras están separadas ya del sist. motor grueso y se convierten en instrumentos para designar conceptos, ideas, relaciones..."}
        ]

    }
]

print("--- Previsualización de Tipos de Informe e Indicadores ---")
print("-" * 50)

for item in data:
    tipo_informe_desc = item["tipo_informe_desc"]
    indicators_list = item["indicadores"]

    print(f"Tipo de Informe: {tipo_informe_desc}")
    print("  Indicadores:")
    for ind_data in indicators_list:
        ind_nombre = ind_data["nombre"]
        ind_descripcion = ind_data["descripcion"]
        print(f"    - Nombre: '{ind_nombre}'")
        print(f"      Descripción: '{ind_descripcion}'")
    print("-" * 50)

print("--- Fin de la previsualización ---")



for item in data:
    tipo_informe_desc = item["tipo_informe_desc"]
    indicators_list = item["indicadores"]

    tipo_informe, created = TipoInforme.objects.get_or_create(
        descripcion=tipo_informe_desc,
        defaults={'estado': True}
    )

    if created:
        print(f"Created TipoInforme: '{tipo_informe.descripcion}'")
    else:
        print(f"TipoInforme already exists: '{tipo_informe.descripcion}'")

    # Create or get Indicadores for this TipoInforme
    for ind_data in indicators_list:
        ind_nombre = ind_data["nombre"]
        ind_descripcion = ind_data["descripcion"]

        indicador, created = Indicador.objects.get_or_create(
            id_tipo_informe=tipo_informe,
            nombre=ind_nombre, # Use the 'nombre' field
            defaults={'descripcion': ind_descripcion, 'estado': True}
        )
        if created:
            print(f"  - Created Indicador: '{indicador.nombre}' (Description: '{indicador.descripcion}')")
        # else:
        #     print(f"  - Indicador already exists: '{indicador.nombre}' (Description: '{indicador.descripcion}')") # Uncomment if you want to see existing indicators

print("--- Finished creating records ---")