from django.contrib import admin
from .models import Artisan, Inventory, Product, Order, OrderItems, CustomRequest, ProductImage, GalleryImage, LogoImage, HeroImage, Category, Theme, TextContent, ShopSettings, Policies

admin.site.register(Artisan)
admin.site.register(Inventory)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItems)
admin.site.register(CustomRequest)
admin.site.register(GalleryImage)
admin.site.register(LogoImage)
admin.site.register(HeroImage)
admin.site.register(Category)
admin.site.register(ProductImage)
admin.site.register(Theme)
admin.site.register(TextContent)
admin.site.register(ShopSettings)
admin.site.register(Policies)

# Register your models here.
