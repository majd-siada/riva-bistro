from django.db import migrations, models


def align_max_party_size(apps, schema_editor):
    """Raise stored max_party_size to 30 when below the published online limit."""
    Settings = apps.get_model("reservations", "ReservationSettings")
    for row in Settings.objects.all():
        if row.max_party_size < 30:
            row.max_party_size = 30
            row.save(update_fields=["max_party_size"])


class Migration(migrations.Migration):
    dependencies = [
        ("reservations", "0002_reservation_staff_notification_flags"),
    ]

    operations = [
        migrations.AlterField(
            model_name="reservationsettings",
            name="max_party_size",
            field=models.PositiveIntegerField(default=30),
        ),
        migrations.RunPython(align_max_party_size, migrations.RunPython.noop),
    ]
