from django.urls import path

from core.content_views import (
    GalleryListView,
    NewsListView,
    OfferListView,
    RestaurantProfileView,
    SiteContentView,
)
from core.inquiry_views import ContactView, EventInquiryView
from core.revalidate_auth import RevalidateAuthView
from core.views import HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("contact/", ContactView.as_view(), name="contact"),
    path("events/inquiry/", EventInquiryView.as_view(), name="event-inquiry"),
    path("news/", NewsListView.as_view(), name="news"),
    path("gallery/", GalleryListView.as_view(), name="gallery"),
    path("restaurant/", RestaurantProfileView.as_view(), name="restaurant-profile"),
    path("site-content/", SiteContentView.as_view(), name="site-content"),
    path("offers/", OfferListView.as_view(), name="offers"),
    path("revalidate-auth/", RevalidateAuthView.as_view(), name="revalidate-auth"),
]
