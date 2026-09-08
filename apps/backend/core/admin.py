from django.contrib import admin

from core.models import (
    ContactMessage,
    EventInquiry,
    GalleryItem,
    NewsItem,
    Offer,
    RestaurantProfile,
    SiteContent,
)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "email_sent", "created_at")
    readonly_fields = ("name", "email", "phone", "subject", "message", "email_sent", "created_at")


@admin.register(EventInquiry)
class EventInquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "event_type", "email_sent", "created_at")
    readonly_fields = (
        "name",
        "email",
        "phone",
        "event_type",
        "guests",
        "date",
        "message",
        "email_sent",
        "created_at",
    )


@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    list_display = ("title", "is_published", "published_at")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ("alt", "sort_order", "is_published")
    list_editable = ("sort_order", "is_published")


@admin.register(RestaurantProfile)
class RestaurantProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "updated_at")


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ("hero_title", "updated_at")


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "starts_at", "ends_at", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active",)
