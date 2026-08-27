from django.urls import path

from core.inquiry_views import ContactView, EventInquiryView
from core.views import HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("contact/", ContactView.as_view(), name="contact"),
    path("events/inquiry/", EventInquiryView.as_view(), name="event-inquiry"),
]
