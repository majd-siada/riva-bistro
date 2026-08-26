from django.urls import path

from commerce.views import (
    AccountOrderDetailView,
    AccountOrdersView,
    CartLineCreateView,
    CartLineDetailView,
    CartView,
    CheckoutView,
    OrderDetailView,
    OrderStatusView,
)
from catalog.views import (
    AdminCategoryListView,
    AdminCustomerListView,
    AdminInventoryView,
    AdminOrderDetailView,
    AdminOrderListView,
    AdminOverviewView,
    AdminProductDetailView,
    AdminProductListView,
    AdminSalesView,
)

urlpatterns = [
    # Cart & checkout
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/lines/", CartLineCreateView.as_view(), name="cart-line-create"),
    path("cart/lines/<int:line_id>/", CartLineDetailView.as_view(), name="cart-line-detail"),
    path("orders/checkout/", CheckoutView.as_view(), name="checkout"),
    path("orders/<str:ref>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<str:ref>/status/", OrderStatusView.as_view(), name="order-status"),
    # Account
    path("account/orders/", AccountOrdersView.as_view(), name="account-orders"),
    path("account/orders/<int:order_id>/", AccountOrderDetailView.as_view(), name="account-order-detail"),
    # Admin
    path("admin/overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-orders"),
    path("admin/orders/<int:order_id>/", AdminOrderDetailView.as_view(), name="admin-order-detail"),
    path("admin/products/", AdminProductListView.as_view(), name="admin-products"),
    path("admin/products/<int:product_id>/", AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("admin/categories/", AdminCategoryListView.as_view(), name="admin-categories"),
    path("admin/inventory/", AdminInventoryView.as_view(), name="admin-inventory"),
    path("admin/customers/", AdminCustomerListView.as_view(), name="admin-customers"),
    path("admin/sales/", AdminSalesView.as_view(), name="admin-sales"),
]
