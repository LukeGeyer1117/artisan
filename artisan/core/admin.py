from django.contrib import admin
from .models import Artisan, Inventory, Product, Order, OrderItems, CustomRequest, GalleryImage, LogoImage, HeroImage

admin.site.register(Artisan)
admin.site.register(Inventory)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItems)
admin.site.register(CustomRequest)
admin.site.register(GalleryImage)
admin.site.register(LogoImage)
admin.site.register(HeroImage)

# Register your models here.
