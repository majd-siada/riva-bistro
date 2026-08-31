from decimal import ROUND_HALF_UP, Decimal

from django.core.management.base import BaseCommand

from catalog.models import Category, Product

FOOD_VAT = Decimal("0.12")
WINE_VAT = Decimal("0.25")


def ex_vat(inc: int, vat: Decimal = FOOD_VAT) -> Decimal:
    return (Decimal(inc) / (Decimal("1") + vat)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )


CATEGORIES = [
    ("Förrätter", "forratter", "Små rätter som väcker aptiten."),
    ("Varmrätter", "varmratter", "Husets varma rätter, tillagade med omsorg."),
    ("Pasta", "pasta", "Italienskt hantverk, à la Riva."),
    ("Sallader", "sallader", "Fräscha sallader med säsongens råvaror."),
    ("Sidor", "sidor", "Tillbehör som kompletterar måltiden."),
    ("Desserter", "desserter", "Söta avslut på måltiden."),
    ("Drycker", "drycker", "Förfriskande drycker."),
    ("Viner", "viner", "Noggrant utvalda viner per glas."),
]

# (category_slug, name, slug, description, price_inc_vat)
PRODUCTS = [
    ("forratter", "Burrata", "burrata", "Krämig burrata med tomater, basilika, olivolja och balsamico.", 129),
    ("forratter", "Carpaccio", "carpaccio", "Tunnskivad oxfilé med ruccola, parmesan och citronolja.", 129),
    ("forratter", "Skagen på brioche", "skagen-pa-brioche", "Räkor i krämig majonnäs med dill, citron och rödlök.", 119),
    ("forratter", "Tomatsoppa", "tomatsoppa", "Krämig tomatsoppa med basilika och rostad vitlök.", 99),
    ("forratter", "Getost", "getost", "Varm getost med honung, valnötter och ruccola.", 119),
    ("forratter", "Marinerade oliver", "marinerade-oliver", "Blandade oliver marinerade med örter och citron.", 59),
    ("varmratter", "Entrecôte", "entrecote", "Grillad entrecôte med rödvinssås, rostad potatis och säsongens grönsaker.", 269),
    ("varmratter", "Laxfilé", "laxfile", "Stekt lax med dillsås, färskpotatis och säsongens grönsaker.", 229),
    ("varmratter", "Ribs", "ribs", "Halstrade ribs med BBQ-sås, coleslaw och pommes.", 219),
    ("pasta", "Pasta Alfredo", "pasta-alfredo", "Krämig pasta med kyckling, parmesan och färsk persilja.", 159),
    ("pasta", "Pasta Carbonara", "pasta-carbonara", "Pasta med guanciale, äggula, pecorino och svartpeppar.", 149),
    ("pasta", "Pasta Scampi", "pasta-scampi", "Pasta med scampi, vitlök, chili, persilja och körsbärstomater.", 179),
    ("sallader", "Caesarsallad", "caesarsallad", "Romansallad med caesardressing, krutonger, parmesan och kyckling.", 139),
    ("sallader", "Räksallad", "raksallad", "Räkor med blandad sallad, avocado, ägg, körsbärstomater och citron.", 149),
    ("sallader", "Halloumisallad", "halloumisallad", "Grillad halloumi med sallad, quinoa, rostade rötter och balsamico.", 139),
    ("sidor", "Pommes frites", "pommes-frites", "Krispiga pommes frites med örtsalt.", 49),
    ("sidor", "Sötpotatispommes", "sotpotatispommes", "Krispiga sötpotatispommes med aioli.", 59),
    ("sidor", "Grillade grönsaker", "grillade-gronsaker", "Grillade säsongens grönsaker med olivolja.", 59),
    ("desserter", "Chokladfondant", "chokladfondant", "Varm chokladfondant med vaniljglass och bär.", 99),
    ("desserter", "Tiramisu", "tiramisu", "Klassisk tiramisu med mascarpone och kaffe.", 89),
    ("desserter", "Crème Brûlée", "creme-brulee", "Vaniljkräm med knäckigt täcke och färska bär.", 89),
    ("drycker", "Lemonad", "lemonad", "Hemgjord citronlemonad med mynta.", 49),
    ("drycker", "Coca-Cola", "coca-cola", "Klassisk Coca-Cola.", 39),
    ("drycker", "Mineralvatten", "mineralvatten", "Kolsyrat eller stilla vatten.", 29),
    ("viner", "Rött vin", "rott-vin", "Noggrant utvalda röda viner.", 89),
    ("viner", "Vitt vin", "vitt-vin", "Noggrant utvalda vita viner.", 89),
    ("viner", "Rosé vin", "rose-vin", "Noggrant utvalda roséviner.", 89),
]

FEATURED = {
    "entrecote": 0,
    "laxfile": 1,
    "burrata": 2,
    "carpaccio": 3,
}


class Command(BaseCommand):
    help = "Seed the Riva Bistro menu to match the reference (idempotent)."

    def handle(self, *args, **options):
        for i, (name, slug, desc) in enumerate(CATEGORIES):
            Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "description": desc, "sort_order": i, "is_active": True},
            )

        for i, (cat_slug, name, slug, desc, price) in enumerate(PRODUCTS):
            category = Category.objects.get(slug=cat_slug)
            vat = WINE_VAT if cat_slug == "viner" else FOOD_VAT
            Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "category": category,
                    "name": name,
                    "description": desc,
                    "base_price": ex_vat(price, vat),
                    "vat_rate": vat,
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
                "Seeded reference menu successfully "
                f"(pruned products={removed_products[0]}, categories={removed_categories[0]})."
            )
        )
