from django.db import migrations, models

PLACEHOLDER_IG = {
    "https://instagram.com/rivabistro",
    "https://www.instagram.com/rivabistro",
}
PLACEHOLDER_FB = {
    "https://facebook.com/rivabistro",
    "https://www.facebook.com/rivabistro",
}


def clear_placeholder_social(apps, schema_editor):
    Profile = apps.get_model("core", "RestaurantProfile")
    for row in Profile.objects.all():
        changed = False
        ig = (row.social_instagram or "").strip().rstrip("/")
        fb = (row.social_facebook or "").strip().rstrip("/")
        if ig in {p.rstrip("/") for p in PLACEHOLDER_IG}:
            row.social_instagram = ""
            changed = True
        if fb in {p.rstrip("/") for p in PLACEHOLDER_FB}:
            row.social_facebook = ""
            changed = True
        if changed:
            row.save(update_fields=["social_instagram", "social_facebook"])


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_restaurant_profile_site_content_offers"),
    ]

    operations = [
        migrations.AlterField(
            model_name="restaurantprofile",
            name="social_instagram",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="restaurantprofile",
            name="social_facebook",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.RunPython(clear_placeholder_social, migrations.RunPython.noop),
    ]
