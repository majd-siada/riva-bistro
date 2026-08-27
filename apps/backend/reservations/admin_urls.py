from django.urls import path

from reservations.admin_views import (
    AdminClosureDetailView,
    AdminClosureListView,
    AdminHoursView,
    AdminReservationDetailView,
    AdminReservationListView,
    AdminReservationOverviewView,
    AdminSettingsView,
)

urlpatterns = [
    path("overview/", AdminReservationOverviewView.as_view(), name="admin-reservation-overview"),
    path("reservations/", AdminReservationListView.as_view(), name="admin-reservations"),
    path(
        "reservations/<int:pk>/",
        AdminReservationDetailView.as_view(),
        name="admin-reservation-detail",
    ),
    path("hours/", AdminHoursView.as_view(), name="admin-hours"),
    path("closures/", AdminClosureListView.as_view(), name="admin-closures"),
    path("closures/<int:pk>/", AdminClosureDetailView.as_view(), name="admin-closure-detail"),
    path("settings/", AdminSettingsView.as_view(), name="admin-reservation-settings"),
]
