from django.core.management.base import BaseCommand

from core.models import RestaurantProfile, SiteContent


class Command(BaseCommand):
    help = "Ensure RestaurantProfile and SiteContent singletons exist with defaults."

    def handle(self, *args, **options):
        profile = RestaurantProfile.load()
        site = SiteContent.load()
        self.stdout.write(
            self.style.SUCCESS(
                f"RestaurantProfile pk={profile.pk} name={profile.name}; "
                f"SiteContent pk={site.pk} hero={site.hero_title!r}"
            )
        )
