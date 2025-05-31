from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('educativo', '0001_initial'), 
    ]

    operations = [
        migrations.AddField(
            model_name='tutor',
            name='email',
            field=models.EmailField(max_length=255, null=True, blank=True),
        ),
    ]