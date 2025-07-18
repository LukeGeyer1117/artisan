from django.contrib import admin
from .models import Artisan, Inventory, Product, Order, OrderItems, CustomRequest, GalleryImage

admin.site.register(Artisan)
admin.site.register(Inventory)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItems)
admin.site.register(CustomRequest)
admin.site.register(GalleryImage)

# Register your models here.
