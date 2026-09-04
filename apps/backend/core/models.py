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
