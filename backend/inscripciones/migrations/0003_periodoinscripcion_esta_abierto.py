# Generated by Django 5.1.5 on 2025-06-17 20:23

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("inscripciones", "0002_periodoinscripcion_inscripcion_periodo_inscripcion"),
    ]

    operations = [
        migrations.AddField(
            model_name="periodoinscripcion",
            name="esta_abierto",
            field=models.BooleanField(default=True),
        ),
    ]
