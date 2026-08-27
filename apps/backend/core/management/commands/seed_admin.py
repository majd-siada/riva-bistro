import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create/update a staff admin user from environment variables (dev-friendly)."

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_ADMIN_USERNAME", "admin")
        email = os.getenv("DJANGO_ADMIN_EMAIL", "admin@rivabistro.se")
        # Dev-only fallback password. In production, always set DJANGO_ADMIN_PASSWORD.
        password = os.getenv("DJANGO_ADMIN_PASSWORD", "riva-admin-dev")

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(f"{action} admin user '{username}'.")
        )
