from django.urls import path

from catalog.views import (
    CategoryListView,
    FeaturedProductListView,
    ProductDetailView,
    ProductListView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="menu-categories"),
    path("products/", ProductListView.as_view(), name="menu-products"),
    path("featured/", FeaturedProductListView.as_view(), name="menu-featured"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="menu-product-detail"),
]
