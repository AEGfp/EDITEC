# Generated by Django 5.1.5 on 2025-05-31 21:39

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("educativo", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Notificacion",
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
                ("titulo", models.CharField(max_length=255)),
                ("contenido", models.TextField()),
                ("fecha_envio", models.DateTimeField(auto_now_add=True)),
                (
                    "evento",
                    models.CharField(
                        choices=[
                            ("cumple", "Cumpleaños"),
                            ("cancelacion", "Cancelación"),
                            ("personalizado", "Personalizado"),
                        ],
                        max_length=100,
                    ),
                ),
                ("activa", models.BooleanField(default=True)),
                (
                    "excluir_salas",
                    models.ManyToManyField(
                        blank=True,
                        related_name="notificaciones_excluidas",
                        to="educativo.sala",
                    ),
                ),
                (
                    "salas_destinatarias",
                    models.ManyToManyField(
                        blank=True, related_name="notificaciones", to="educativo.sala"
                    ),
                ),
            ],
        ),
    ]
