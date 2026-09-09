from django.core.management.base import BaseCommand

from core.models import GalleryItem

# Real photographs already shipped in the Next.js public folder.
# First item is the named signature dish photo used on the homepage.
SCENES = [
    (
        0,
        "Entrecôte",
        "Grillad entrecôte med örtsmör på mörk tallrik — Riva Bistro",
        "/menu/entrecote.jpg",
    ),
    (1, "Matsalen", "Interiör på Riva Bistro med varm belysning", "/scenes/home-interior.jpg"),
    (2, "Dukat bord", "Dukat bord med vinglas i mörk restaurangmiljö", "/scenes/booking-table.jpg"),
    (
        3,
        "Mysig hörna",
        "Sammetsarmstol och marmorbord vid fönstret — Riva Bistro",
        "/scenes/menu-tabletop.jpg",
    ),
    (4, "Privat middag", "Privat tillställning i elegant miljö", "/scenes/private-event.jpg"),
    (5, "Baren", "Baren och interiör med varm belysning", "/scenes/contact-interior.jpg"),
]


class Command(BaseCommand):
    help = "Seed gallery items pointing at existing public scene photographs."

    def handle(self, *args, **options):
        for order, title, alt, src in SCENES:
            # Match by sort_order so renaming a stock URL updates in place
            # instead of leaving an orphan row on the old path.
            item = GalleryItem.objects.filter(sort_order=order).first()
            if item is None:
                GalleryItem.objects.create(
                    sort_order=order,
                    title=title,
                    alt=alt,
                    image_url=src,
                    is_published=True,
                )
            else:
                item.title = title
                item.alt = alt
                item.image_url = src
                item.is_published = True
                item.save(
                    update_fields=["title", "alt", "image_url", "is_published"]
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(SCENES)} gallery items."))
