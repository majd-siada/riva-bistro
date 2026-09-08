from django.urls import path

from core.content_views import (
    AdminContactMessageListView,
    AdminEventInquiryListView,
    AdminGalleryDetailView,
    AdminGalleryListCreateView,
    AdminNewsDetailView,
    AdminNewsListCreateView,
    AdminOfferDetailView,
    AdminOfferListCreateView,
    AdminRestaurantProfileView,
    AdminSiteContentView,
)

urlpatterns = [
    path(
        "inquiries/contact/",
        AdminContactMessageListView.as_view(),
        name="admin-contact-messages",
    ),
    path(
        "inquiries/events/",
        AdminEventInquiryListView.as_view(),
        name="admin-event-inquiries",
    ),
    path("news/", AdminNewsListCreateView.as_view(), name="admin-news"),
    path("news/<int:pk>/", AdminNewsDetailView.as_view(), name="admin-news-detail"),
    path("gallery/", AdminGalleryListCreateView.as_view(), name="admin-gallery"),
    path(
        "gallery/<int:pk>/",
        AdminGalleryDetailView.as_view(),
        name="admin-gallery-detail",
    ),
    path(
        "restaurant/",
        AdminRestaurantProfileView.as_view(),
        name="admin-restaurant-profile",
    ),
    path("site-content/", AdminSiteContentView.as_view(), name="admin-site-content"),
    path("offers/", AdminOfferListCreateView.as_view(), name="admin-offers"),
    path("offers/<int:pk>/", AdminOfferDetailView.as_view(), name="admin-offer-detail"),
]
