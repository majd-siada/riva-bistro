from decimal import Decimal

from django.core.management.base import BaseCommand

from catalog.models import Category, ModifierGroup, ModifierOption, Product

IMG = "https://images.unsplash.com/photo-{id}?w=800"


class Command(BaseCommand):
    help = "Seed sample menu data for Riva Bistro"

    def handle(self, *args, **options):
        categories_data = [
            ("Förrätter", "forratter", "Små rätter med säsongens råvaror."),
            ("Huvudrätter", "huvudratter", "Klassiska och moderna rätter från köket."),
            ("Desserter", "desserter", "Avsluta måltiden med något sött."),
            ("Drycker", "drycker", "Viner, cocktails och alkoholfria alternativ."),
        ]

        products_data = [
            (
                "forratter",
                "Gravad lax",
                "gravad-lax",
                "Hovmästarsås, dill, rostat bröd.",
                145,
                IMG.format(id="1519708227418-c8fd9a32b9a2"),
            ),
            (
                "forratter",
                "Skagenröra",
                "skagenrora",
                "Toast Skagen med löjrom och citron.",
                165,
                IMG.format(id="1544025162-d76694265947"),
            ),
            (
                "huvudratter",
                "Wallenbergare",
                "wallenbergare",
                "Potatispuré, gröna ärtor, lingon.",
                245,
                IMG.format(id="1546833999-b9f581a1996d"),
            ),
            (
                "huvudratter",
                "Halstrad röding",
                "rodling",
                "Brynt smör, haricots verts, citron.",
                285,
                IMG.format(id="1467003909585-2f8a72700288"),
            ),
            (
                "huvudratter",
                "Entrecôte",
                "entrecote",
                "Rödvinssås, pommes, bearnaisesås.",
                325,
                IMG.format(id="1600891964092-4316c288032e"),
            ),
            (
                "desserter",
                "Pannacotta",
                "pannacotta",
                "Vanilj, bärkompott, mynta.",
                115,
                IMG.format(id="1488477181946-6428a0291777"),
            ),
            (
                "desserter",
                "Chokladfondant",
                "chokladfondant",
                "Varm choklad, vaniljglass.",
                125,
                IMG.format(id="1624353368356-a1ab7033d422"),
            ),
            (
                "drycker",
                "Husets röda",
                "husets-roda",
                "Ett glas utvalt rödvin.",
                95,
                IMG.format(id="1510812431401-41e2bd2722f3"),
            ),
        ]

        for i, (name, slug, desc) in enumerate(categories_data):
            Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "description": desc, "sort_order": i, "is_active": True},
            )

        for cat_slug, name, slug, desc, price, image in products_data:
            category = Category.objects.get(slug=cat_slug)
            product, created = Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "category": category,
                    "name": name,
                    "description": desc,
                    "base_price": Decimal(str(price)),
                    "image_url": image,
                    "is_available": True,
                    "inventory_count": 50,
                },
            )
            if created and slug == "entrecote":
                group, _ = ModifierGroup.objects.get_or_create(
                    product=product,
                    name="Stekning",
                    defaults={"required": True, "min_selections": 1, "max_selections": 1},
                )
                for opt_name, delta in [("Rare", 0), ("Medium", 0), ("Well done", 0)]:
                    ModifierOption.objects.get_or_create(
                        group=group,
                        name=opt_name,
                        defaults={"price_delta": Decimal(str(delta)), "is_available": True},
                    )
                addon_group, _ = ModifierGroup.objects.get_or_create(
                    product=product,
                    name="Tillbehör",
                    defaults={"required": False, "min_selections": 0, "max_selections": 3},
                )
                ModifierOption.objects.get_or_create(
                    group=addon_group,
                    name="Extra bearnaisesås",
                    defaults={"price_delta": Decimal("25"), "is_available": True},
                )

        self.stdout.write(self.style.SUCCESS("Seeded menu data successfully."))
