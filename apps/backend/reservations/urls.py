from django.urls import path

from reservations.views import AvailabilityView, HoursView, ReservationCreateView

urlpatterns = [
    path("hours/", HoursView.as_view(), name="opening-hours"),
    path(
        "reservations/availability/",
        AvailabilityView.as_view(),
        name="reservation-availability",
    ),
    path("reservations/", ReservationCreateView.as_view(), name="reservation-create"),
]
