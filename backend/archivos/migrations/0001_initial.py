# Generated by Django 5.1.5 on 2025-05-31 21:39

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Archivos",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("descripcion", models.CharField(max_length=70)),
                ("archivo", models.FileField(upload_to="")),
            ],
        ),
    ]
