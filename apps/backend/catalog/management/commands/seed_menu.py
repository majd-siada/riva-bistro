from decimal import ROUND_HALF_UP, Decimal

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import models

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
    ("Förrätter", "forratter", "Små rätter som väcker aptiten."),
    ("Varmrätter", "varmratter", "Husets varma rätter, tillagade med omsorg."),
    ("Sallader", "sallader", "Fräscha sallader med säsongens råvaror."),
    ("Pasta", "pasta", "Italienskt hantverk, à la Riva."),
    ("Barnmeny", "barnmeny", "För våra minsta gäster."),
    ("Desserter", "desserter", "Söta avslut på måltiden."),
]

# (category_slug, name, slug, description, price_inc_vat)
PRODUCTS = [
    (
        "forratter",
        "Toast skagen Mediterranio",
        "toast-skagen-mediterranio",
        "Handskalade räkor, örtmajonnäs, löjrom och rostat bröd, Kökets rekommendation",
        95,
    ),
    (
        "forratter",
        "Vitlöksgratinerade blå musslor",
        "vitloksgratinerade-bla-musslor",
        "Blåmusslor, vitlökssmör, örter och bröd",
        90,
    ),
    ("forratter", "Råraka", "raraka", "Klassisk tillbehör", 105),
    (
        "forratter",
        "Ost & Chark för två",
        "ost-chark-for-tva",
        "Urval av lagrade ostar och charkuterier, tillbehör",
        245,
    ),
    ("forratter", "Vitlöksbröd", "vitloksbrod", "", 49),
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

# Named stock photos under frontend/public (served same-origin by Next).
PRODUCT_IMAGES = {
    "entrecote": "/menu/entrecote.jpg",
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
            defaults = {
                "category": category,
                "name": name,
                "description": desc,
                "base_price": ex_vat(price),
                "vat_rate": FOOD_VAT,
                "is_available": True,
                "is_featured": slug in FEATURED,
                "featured_order": FEATURED.get(slug, 0),
                "sort_order": i,
                "inventory_count": 999,
            }
            # Only seed stock images when the product has none — never wipe
            # staff uploads from Admin → Meny.
            if slug in PRODUCT_IMAGES:
                existing = Product.objects.filter(slug=slug).only("image_url").first()
                if existing is None or not (existing.image_url or "").strip():
                    defaults["image_url"] = PRODUCT_IMAGES[slug]

            Product.objects.update_or_create(slug=slug, defaults=defaults)

        keep_product_slugs = {p[2] for p in PRODUCTS}
        keep_category_slugs = {c[1] for c in CATEGORIES}
        # Never prune top-level menu sections (or any category that still has
        # children / products). Destructive category deletes wiped section
        # hierarchy on re-seed.
        from catalog.management.commands.seed_menu_sections import TOP_LEVEL_SECTIONS

        protected_slugs = {slug for _, slug, _ in TOP_LEVEL_SECTIONS} | keep_category_slugs
        removed_products = Product.objects.exclude(slug__in=keep_product_slugs).delete()
        # Only remove orphan course categories that are not protected sections
        # and have no products left. Do not delete top-level sections.
        removable = (
            Category.objects.exclude(slug__in=protected_slugs)
            .annotate(product_total=models.Count("products"))
            .annotate(child_total=models.Count("children"))
            .filter(product_total=0, child_total=0)
        )
        removed_categories = removable.delete()

        # Ensure six top-level sections exist and course categories nest under
        # RIVAS MENY (idempotent; does not invent items).
        call_command("seed_menu_sections")

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded Riva menu successfully "
                f"(pruned products={removed_products[0]}, categories={removed_categories[0]})."
            )
        )
