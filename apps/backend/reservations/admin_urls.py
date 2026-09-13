from django.urls import path

from reservations.admin_views import (
    AdminClosureDetailView,
    AdminClosureListView,
    AdminHoursView,
    AdminReservationBulkDeleteView,
    AdminReservationDetailView,
    AdminReservationListView,
    AdminReservationOverviewView,
    AdminReservationResendNotificationsView,
    AdminSettingsView,
)

urlpatterns = [
    path("overview/", AdminReservationOverviewView.as_view(), name="admin-reservation-overview"),
    path("reservations/", AdminReservationListView.as_view(), name="admin-reservations"),
    path(
        "reservations/bulk-delete/",
        AdminReservationBulkDeleteView.as_view(),
        name="admin-reservations-bulk-delete",
    ),
    path(
        "reservations/<int:pk>/",
        AdminReservationDetailView.as_view(),
        name="admin-reservation-detail",
    ),
    path(
        "reservations/<int:pk>/resend-notifications/",
        AdminReservationResendNotificationsView.as_view(),
        name="admin-reservation-resend-notifications",
    ),
    path("hours/", AdminHoursView.as_view(), name="admin-hours"),
    path("closures/", AdminClosureListView.as_view(), name="admin-closures"),
    path("closures/<int:pk>/", AdminClosureDetailView.as_view(), name="admin-closure-detail"),
    path("settings/", AdminSettingsView.as_view(), name="admin-reservation-settings"),
]
