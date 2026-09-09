from django.urls import path

from catalog.admin_views import (
    AdminCategoryDetailView,
    AdminCategoryListCreateView,
    AdminEnsureMenuSectionsView,
    AdminProductDetailView,
    AdminProductImageView,
    AdminProductListCreateView,
)

urlpatterns = [
    path(
        "ensure-sections/",
        AdminEnsureMenuSectionsView.as_view(),
        name="admin-menu-ensure-sections",
    ),
    path("categories/", AdminCategoryListCreateView.as_view(), name="admin-menu-categories"),
    path(
        "categories/<int:pk>/",
        AdminCategoryDetailView.as_view(),
        name="admin-menu-category-detail",
    ),
    path("products/", AdminProductListCreateView.as_view(), name="admin-menu-products"),
    path(
        "products/<int:pk>/",
        AdminProductDetailView.as_view(),
        name="admin-menu-product-detail",
    ),
    path(
        "products/<int:pk>/image/",
        AdminProductImageView.as_view(),
        name="admin-menu-product-image",
    ),
]
