from django.contrib import admin

from core.models import ContactMessage, EventInquiry, GalleryItem
from core.revalidate import GALLERY_PATHS, schedule_frontend_revalidation


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


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ("alt", "sort_order", "is_published")
    list_editable = ("sort_order", "is_published")

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        schedule_frontend_revalidation(GALLERY_PATHS)

    def delete_model(self, request, obj):
        super().delete_model(request, obj)
        schedule_frontend_revalidation(GALLERY_PATHS)
