from django.urls import path

from catalog.views import CategoryListView, ProductDetailView, ProductListView

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="menu-categories"),
    path("products/", ProductListView.as_view(), name="menu-products"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="menu-product-detail"),
]
