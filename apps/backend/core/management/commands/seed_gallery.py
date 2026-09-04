from django.core.management.base import BaseCommand

from core.models import GalleryItem

# Real photographs already shipped in the Next.js public/scenes folder.
SCENES = [
    (0, "Kvällens tallrik", "Grillad entrecôte på mörk tallrik — Riva Bistro", "/scenes/hero-food.jpg"),
    (1, "Matsalen", "Interiör på Riva Bistro med varm belysning", "/scenes/home-interior.jpg"),
    (2, "Dukat bord", "Dukat bord med vinglas i mörk restaurangmiljö", "/scenes/booking-table.jpg"),
    (3, "Bordddukning", "Upplagd middag på mörk tabletop", "/scenes/menu-tabletop.jpg"),
    (4, "Privat middag", "Privat tillställning i elegant miljö", "/scenes/private-event.jpg"),
    (5, "Baren", "Baren och interiör med varm belysning", "/scenes/contact-interior.jpg"),
]


class Command(BaseCommand):
    help = "Seed gallery items pointing at existing public scene photographs."

    def handle(self, *args, **options):
        for order, title, alt, src in SCENES:
            GalleryItem.objects.update_or_create(
                image_url=src,
                defaults={
                    "title": title,
                    "alt": alt,
                    "sort_order": order,
                    "is_published": True,
                },
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(SCENES)} gallery items."))
