from __future__ import annotations

from django.db import models
from django.utils.text import slugify


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    subject = models.CharField(max_length=120, blank=True)
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Kontaktmeddelande"
        verbose_name_plural = "Kontaktmeddelanden"

    def __str__(self) -> str:
        return f"{self.name} — {self.created_at:%Y-%m-%d}"


class EventInquiry(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    event_type = models.CharField(max_length=120, blank=True)
    guests = models.CharField(max_length=40, blank=True)
    date = models.CharField(max_length=40, blank=True)
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Eventförfrågan"
        verbose_name_plural = "Eventförfrågningar"

    def __str__(self) -> str:
        return f"{self.name} — {self.event_type or 'event'}"


class NewsItem(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    body = models.TextField()
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        verbose_name = "Nyhet"
        verbose_name_plural = "Nyheter"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class GalleryItem(models.Model):
    """Published gallery images. Prefer uploaded files; image_url holds static scene paths."""

    title = models.CharField(max_length=200, blank=True)
    alt = models.CharField(max_length=240)
    image = models.FileField(upload_to="gallery/", null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "Galleriobjekt"
        verbose_name_plural = "Galleri"

    def __str__(self) -> str:
        return self.title or self.alt


class RestaurantProfile(models.Model):
    """Singleton NAP / brand facts for public site + Admin Restaurang."""

    name = models.CharField(max_length=120, default="Riva Bistro")
    tagline = models.CharField(max_length=200, blank=True, default="Goda smaker, äkta upplevelser")
    street = models.CharField(max_length=200, blank=True, default="Hornsbergs Strand 57")
    postal_code = models.CharField(max_length=20, blank=True, default="112 16")
    city = models.CharField(max_length=80, blank=True, default="Stockholm")
    country = models.CharField(max_length=2, blank=True, default="SE")
    area = models.CharField(max_length=80, blank=True, default="Kungsholmen")
    phone = models.CharField(max_length=40, blank=True, default="087042050")
    phone_e164 = models.CharField(max_length=40, blank=True, default="+4687042050")
    email = models.EmailField(blank=True, default="info@rivabistro.se")
    map_url = models.URLField(
        blank=True,
        default=(
            "https://www.google.com/maps/search/?api=1"
            "&query=Hornsbergs+Strand+57+112+16+Stockholm"
        ),
    )
    social_instagram = models.URLField(blank=True, default="")
    social_facebook = models.URLField(blank=True, default="")
    social_verified = models.BooleanField(default=False)
    kitchen_hours = models.CharField(max_length=200, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Restaurangprofil"
        verbose_name_plural = "Restaurangprofil"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls) -> RestaurantProfile:
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self) -> str:
        return self.name


class SiteContent(models.Model):
    """Singleton homepage marketing copy (hero + about)."""

    hero_title = models.CharField(
        max_length=200,
        default="Goda smaker, äkta upplevelser",
    )
    hero_body = models.TextField(
        blank=True,
        default=(
            "Medelhavsinspirerad mat på Kungsholmen — lunch, middag och "
            "privata tillställningar vid vattnet."
        ),
    )
    hero_image = models.FileField(upload_to="site/", null=True, blank=True)
    hero_image_url = models.CharField(
        max_length=500, blank=True, default="/scenes/hero-food.jpg"
    )
    primary_cta_label = models.CharField(max_length=80, default="Boka bord")
    primary_cta_href = models.CharField(max_length=200, default="/boka")
    secondary_cta_label = models.CharField(max_length=80, default="Se menyn")
    secondary_cta_href = models.CharField(max_length=200, default="/meny")
    about_title = models.CharField(max_length=200, default="Välkommen till Riva")
    about_body = models.TextField(
        blank=True,
        default=(
            "Vi lagar mat med råvaror i säsong, generösa portioner och en "
            "avslappnad stämning vid Hornsbergs Strand."
        ),
    )
    about_image = models.FileField(upload_to="site/", null=True, blank=True)
    about_image_url = models.CharField(
        max_length=500, blank=True, default="/scenes/home-interior.jpg"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Startsida"
        verbose_name_plural = "Startsida"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls) -> SiteContent:
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self) -> str:
        return "Startsida"


class Offer(models.Model):
    """Scheduled promotional offer shown on the public homepage when active."""

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.FileField(upload_to="offers/", null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    price_label = models.CharField(max_length=80, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-updated_at", "id"]
        verbose_name = "Erbjudande"
        verbose_name_plural = "Erbjudanden"

    def __str__(self) -> str:
        return self.title
