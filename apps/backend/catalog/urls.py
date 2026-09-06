from django.urls import path

from catalog.views import (
    CategoryDetailView,
    CategoryItemsView,
    CategoryListView,
    FeaturedProductListView,
    ProductDetailView,
    ProductListView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="menu-categories"),
    path(
        "categories/<slug:slug>/",
        CategoryDetailView.as_view(),
        name="menu-category-detail",
    ),
    path(
        "categories/<slug:slug>/items/",
        CategoryItemsView.as_view(),
        name="menu-category-items",
    ),
    path("products/", ProductListView.as_view(), name="menu-products"),
    path("featured/", FeaturedProductListView.as_view(), name="menu-featured"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="menu-product-detail"),
]
