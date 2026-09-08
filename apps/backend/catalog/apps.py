from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"
    verbose_name = "Catalog"

    def ready(self) -> None:
        # Register per-section proxy models for Django Admin / migrations.
        from catalog import section_proxies  # noqa: F401

