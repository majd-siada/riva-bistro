from django.contrib import admin

from commerce.models import Cart, CartLine, Customer, Order, OrderLine, Payment


class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone", "created_at"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "session_key", "customer", "updated_at"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["ref", "customer", "status", "payment_status", "total_inc_vat", "created_at"]
    list_filter = ["status", "payment_status"]
    inlines = [OrderLineInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "provider", "status", "created_at"]
