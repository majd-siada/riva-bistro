from decimal import ROUND_HALF_UP, Decimal

from django.core.management.base import BaseCommand

from catalog.models import Category, Product

# Swedish restaurant food VAT is 12%. Menu prices below are the real
# customer-facing prices (inkl. moms); we store the ex-VAT base so the
# displayed inc-VAT price matches the printed menu.
FOOD_VAT = Decimal("0.12")


def ex_vat(inc: int) -> Decimal:
    return (Decimal(inc) / (Decimal("1") + FOOD_VAT)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )


CATEGORIES = [
    ("Varmrätter", "varmratter", "Husets varma rätter, tillagade med omsorg."),
    ("Sallader", "sallader", "Fräscha sallader med säsongens råvaror."),
    ("Pasta", "pasta", "Italienskt hantverk, à la Riva."),
    ("Barnmeny", "barnmeny", "För våra minsta gäster."),
    ("Desserter", "desserter", "Söta avslut på måltiden."),
]

# (category_slug, name, slug, description, price_inc_vat)
PRODUCTS = [
    ("varmratter", "Entrecôte", "entrecote", "Grillad entrecôte med tillbehör.", 305),
    ("varmratter", "Grillad lammracks", "grillad-lammracks", "Grillad lammracks, säsongens tillbehör.", 315),
    ("varmratter", "Rivas köttbullar", "rivas-kottbullar", "Husets köttbullar med gräddsås och lingon.", 185),
    ("varmratter", "Halstrad röding", "halstrad-roding", "Halstrad röding med brynt smör.", 265),
    ("varmratter", "Havets delikatesser", "havets-delikatesser", "Utvalda delikatesser från havet.", 299),
    ("varmratter", "Hängmörad ryggbiff", "hangmorad-ryggbiff", "Hängmörad ryggbiff, grillad till perfektion.", 299),
    ("varmratter", "Rivas Fisk & Skaldjurssoppa", "fisk-skaldjurssoppa", "Rustik soppa på fisk och skaldjur.", 199),
    ("varmratter", "Rivas burgare / halloumi", "rivas-burgare", "Rivas burgare — välj nötfärs eller halloumi.", 175),
    ("sallader", "Caesarsallad", "caesarsallad", "Klassisk caesarsallad.", 175),
    ("sallader", "Räksallad deluxe", "raksallad-deluxe", "Generös räksallad med handskalade räkor.", 185),
    ("sallader", "Grekisk sallad", "grekisk-sallad", "Fetaost, oliver, tomat och gurka.", 165),
    ("pasta", "Pasta Filetto di manzo premium", "filetto-di-manzo", "Premiumpasta med oxfilé.", 245),
    ("pasta", "Pesto Pollo", "pesto-pollo", "Pasta med kyckling och pesto.", 169),
    ("pasta", "Vegetariano", "vegetariano", "Vegetarisk pasta med säsongens grönsaker.", 169),
    ("barnmeny", "Rivas Köttbullar", "barn-kottbullar", "Köttbullar med potatismos.", 80),
    ("barnmeny", "Pannkakor", "barn-pannkakor", "Pannkakor med sylt och grädde.", 75),
    ("barnmeny", "Hamburgare", "barn-hamburgare", "Liten hamburgare med pommes.", 105),
    ("barnmeny", "Rivas köttbullar med pasta", "barn-kottbullar-pasta", "Köttbullar med pasta.", 75),
    ("barnmeny", "Barnglass", "barn-glass", "En kula glass.", 30),
    ("barnmeny", "Barndricka", "barn-dricka", "Läsk eller saft.", 25),
    ("desserter", "Varm Chokladfondant", "varm-chokladfondant", "Varm chokladfondant med glass.", 85),
    ("desserter", "Crème Brûlée", "creme-brulee", "Klassisk crème brûlée.", 75),
    ("desserter", "Klassisk Tiramisu", "klassisk-tiramisu", "Italiensk tiramisu.", 89),
    ("desserter", "Pavlova", "pavlova", "Maräng med bär och grädde.", 79),
    ("desserter", "Vaniljglass", "vaniljglass", "Vaniljglass med tillbehör.", 89),
    ("desserter", "Husets ostar", "husets-ostar", "Utvalda ostar med tillbehör.", 145),
    ("desserter", "KTC", "ktc", "Husets specialdessert.", 135),
    ("desserter", "Dagens Cheesecake", "dagens-cheesecake", "Dagens cheesecake.", 75),
]

# Dishes shown on the homepage. Editable later from the admin.
FEATURED = {
    "entrecote": 0,
    "grillad-lammracks": 1,
    "halstrad-roding": 2,
    "rivas-kottbullar": 3,
}


class Command(BaseCommand):
    help = "Seed the real Riva Bistro menu (idempotent)."

    def handle(self, *args, **options):
        for i, (name, slug, desc) in enumerate(CATEGORIES):
            Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "description": desc, "sort_order": i, "is_active": True},
            )

        for i, (cat_slug, name, slug, desc, price) in enumerate(PRODUCTS):
            category = Category.objects.get(slug=cat_slug)
            Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "category": category,
                    "name": name,
                    "description": desc,
                    "base_price": ex_vat(price),
                    "vat_rate": FOOD_VAT,
                    "image_url": "",
                    "is_available": True,
                    "is_featured": slug in FEATURED,
                    "featured_order": FEATURED.get(slug, 0),
                    "sort_order": i,
                    "inventory_count": 999,
                },
            )

        keep_product_slugs = {p[2] for p in PRODUCTS}
        keep_category_slugs = {c[1] for c in CATEGORIES}
        removed_products = Product.objects.exclude(slug__in=keep_product_slugs).delete()
        removed_categories = Category.objects.exclude(slug__in=keep_category_slugs).delete()

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded Riva menu successfully "
                f"(pruned products={removed_products[0]}, categories={removed_categories[0]})."
            )
        )
