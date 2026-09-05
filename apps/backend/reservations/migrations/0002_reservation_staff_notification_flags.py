# Generated manually for reservation staff notification flags.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reservations", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="reservation",
            name="telegram_notified",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="reservation",
            name="staff_email_notified",
            field=models.BooleanField(default=False),
        ),
    ]
