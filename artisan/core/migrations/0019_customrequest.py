# Generated by Django 5.2.3 on 2025-07-03 21:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_alter_product_product_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_name', models.CharField(max_length=100)),
                ('customer_email', models.EmailField(max_length=100)),
                ('customer_phone', models.CharField(max_length=12)),
                ('budget', models.DecimalField(decimal_places=2, max_digits=7)),
                ('description', models.CharField(max_length=1500)),
                ('artisan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.artisan')),
            ],
        ),
    ]
