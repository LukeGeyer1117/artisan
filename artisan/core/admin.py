from django.contrib import admin
from .models import Artisan, Inventory, Product, Order, OrderItems

admin.site.register(Artisan)
admin.site.register(Inventory)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItems)

# Register your models here.
