from django.contrib import admin
from .models import Artisan, Inventory, Product, Order, OrderItems, CustomRequest

admin.site.register(Artisan)
admin.site.register(Inventory)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItems)
admin.site.register(CustomRequest)

# Register your models here.
