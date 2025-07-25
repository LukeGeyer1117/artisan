# Generated by Django 5.2.3 on 2025-07-25 15:34

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0029_productimage'),
    ]

    operations = [
        migrations.CreateModel(
            name='Theme',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text_color', models.CharField(default='#ffffff', max_length=7)),
                ('background_color', models.CharField(default='#000000', max_length=7)),
                ('accent_color', models.CharField(default='#007bff', max_length=7)),
                ('link_hover_color', models.CharField(default='#007bff', max_length=7)),
                ('artisan', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='core.artisan')),
            ],
        ),
    ]
