# Generated by Django 5.1.5 on 2025-06-22 14:56

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('educativo', '0007_merge_20250621_1613'),
        ('inscripciones', '0004_rename_esta_abierto_periodoinscripcion_activo'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SaldoCuotas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('anho', models.IntegerField()),
                ('mes', models.IntegerField()),
                ('nro_cuota', models.IntegerField()),
                ('fecha_generacion', models.DateField(auto_now_add=True)),
                ('fecha_vencimiento', models.DateField()),
                ('monto_cuota', models.DecimalField(decimal_places=2, max_digits=10)),
                ('estado', models.CharField(choices=[('PENDIENTE', 'Pendiente'), ('VENCIDA', 'Vencida'), ('PAGADA', 'Pagada')], default='PENDIENTE', max_length=20)),
                ('fecha_pago', models.DateField(blank=True, null=True)),
                ('id_infante', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='cuotas', to='educativo.infante')),
                ('periodo', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='cuotas', to='inscripciones.periodoinscripcion')),
            ],
        ),
        migrations.CreateModel(
            name='CobroCuotaInfante',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_cobro', models.DateField(default=django.utils.timezone.now)),
                ('monto_cobrado', models.DecimalField(decimal_places=2, max_digits=10)),
                ('metodo_pago', models.CharField(choices=[('EFECTIVO', 'Efectivo'), ('TRANSFERENCIA', 'Transferencia'), ('TARJETA', 'Tarjeta')], default='EFECTIVO', max_length=20)),
                ('observacion', models.TextField(blank=True, null=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('usuario', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cobros_registrados', to=settings.AUTH_USER_MODEL)),
                ('cuota', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='cobros', to='cobros.saldocuotas')),
            ],
        ),
        migrations.CreateModel(
            name='ParametrosCobros',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mes_inicio', models.IntegerField()),
                ('mes_fin', models.IntegerField()),
                ('dia_limite_pago', models.IntegerField(default=10)),
                ('dias_gracia', models.IntegerField(default=5)),
                ('monto_cuota', models.DecimalField(decimal_places=2, max_digits=10)),
                ('mora_por_dia', models.DecimalField(decimal_places=2, max_digits=10)),
                ('estado', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('periodo', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='parametros', to='inscripciones.periodoinscripcion')),
            ],
            options={
                'constraints': [models.CheckConstraint(condition=models.Q(('mes_inicio__gte', 1), ('mes_inicio__lte', 12)), name='valid_mes_inicio'), models.CheckConstraint(condition=models.Q(('mes_fin__gte', 1), ('mes_fin__lte', 12)), name='valid_mes_fin'), models.CheckConstraint(condition=models.Q(('dia_limite_pago__gte', 1), ('dia_limite_pago__lte', 31)), name='valid_dia_limite_pago'), models.UniqueConstraint(condition=models.Q(('estado', True)), fields=('periodo', 'estado'), name='unique_active_parametros_por_periodo')],
            },
        ),
        migrations.AddIndex(
            model_name='saldocuotas',
            index=models.Index(fields=['id_infante', 'periodo', 'mes'], name='cobros_sald_id_infa_504aa6_idx'),
        ),
        migrations.AddIndex(
            model_name='saldocuotas',
            index=models.Index(fields=['estado'], name='cobros_sald_estado_a51134_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='saldocuotas',
            unique_together={('id_infante', 'periodo', 'mes', 'nro_cuota')},
        ),
        migrations.AddConstraint(
            model_name='cobrocuotainfante',
            constraint=models.UniqueConstraint(fields=('cuota',), name='unique_cobro_por_cuota'),
        ),
    ]
