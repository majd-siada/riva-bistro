from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=40)),
                ("subject", models.CharField(blank=True, max_length=120)),
                ("message", models.TextField()),
                ("email_sent", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Kontaktmeddelande",
                "verbose_name_plural": "Kontaktmeddelanden",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="EventInquiry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=40)),
                ("event_type", models.CharField(blank=True, max_length=120)),
                ("guests", models.CharField(blank=True, max_length=40)),
                ("date", models.CharField(blank=True, max_length=40)),
                ("message", models.TextField()),
                ("email_sent", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Eventförfrågan",
                "verbose_name_plural": "Eventförfrågningar",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="NewsItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("slug", models.SlugField(max_length=220, unique=True)),
                ("body", models.TextField()),
                ("is_published", models.BooleanField(default=False)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Nyhet",
                "verbose_name_plural": "Nyheter",
                "ordering": ["-published_at", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="GalleryItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(blank=True, max_length=200)),
                ("alt", models.CharField(max_length=240)),
                ("image", models.FileField(blank=True, null=True, upload_to="gallery/")),
                ("image_url", models.CharField(blank=True, max_length=500)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Galleriobjekt",
                "verbose_name_plural": "Galleri",
                "ordering": ["sort_order", "id"],
            },
        ),
    ]
