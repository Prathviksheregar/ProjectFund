# Generated migration for SBTApplication model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('APIs', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SBTApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('applicant_address', models.CharField(max_length=42, unique=True)),
                ('voter_hash', models.CharField(max_length=66)),
                ('application_tx_hash', models.CharField(blank=True, max_length=66)),
                ('approval_tx_hash', models.CharField(blank=True, max_length=66)),
                ('status', models.CharField(choices=[('pending', 'Pending Admin Approval'), ('approved', 'Approved - SBT Minted'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('nullifier', models.BigIntegerField(blank=True, null=True)),
                ('token_id', models.IntegerField(blank=True, null=True)),
                ('applied_at', models.DateTimeField(auto_now_add=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('approved_by', models.CharField(blank=True, max_length=42)),
                ('synced_from_blockchain', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['-applied_at'],
            },
        ),
    ]
