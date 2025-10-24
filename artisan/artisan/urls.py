"""
URL configuration for artisan project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from core import views

urlpatterns = [
    path('', views.splash),
    path('admin/', admin.site.urls),
    path('home/', views.home, name="home"),
    path('home/<slug:slug>/', views.home, name="slug_home"),
    path('gallery/<slug:slug>/', views.gallery, name="gallery"),
    path('shop/<slug:slug>/', views.shop, name="shop"),
    path('cart/<slug:slug>/', views.cart, name="cart"),
    path('checkout/<slug:slug>/', views.checkout, name="checkout"),
    path('custom/<slug:slug>/', views.custom, name="custom"),
    path('order-complete/<slug:slug>/', views.order_complete, name="order_complete"),
    path('item/<slug:slug>/<int:item_id>/', views.item),
    path('about/<slug:slug>/', views.about, name='about'),
    path('api/logo/<slug:slug>/', views.get_logo_image_by_slug),
    path('api/logo/', views.get_logo_image_by_session),
    path('api/hero/<slug:slug>/', views.get_hero_image_by_slug),
    path('api/hero/', views.get_hero_image_by_session),
    path('api/csrf/', views.get_csrf_token), 
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('inventory/', views.inventory_view),
    path('orders/', views.orders_view),
    path('custom-orders/', views.custom_orders_view),
    path('reporting/', views.reporting_view),
    path('gallery/', views.gallery_view),
    path('settings/', views.settings_view),
    path('add-item/', views.new_item_view),
    path('api/artisan/', views.artisan),
    path('api/artisan/upload_profile_image/', views.artisan_upload_profile_image),
    path('api/artisan/remove_profile_image/', views.artisan_remove_profile_image),
    path('api/artisan/<slug:slug>/', views.artisan_by_slug),
    path('api/inventories/', views.create_inventory),
    path('api/inventory/', views.get_inventory),
    path('api/<slug:slug>/products/', views.get_products_by_artisan_slug, name="get_products_by_artisan_slug"),
    path('api/<slug:slug>/products-limit/', views.get_products_by_artisan_slug_limited),
    path('api/product/', views.product),
    path('api/product/<str:product_id>/', views.get_product),
    path('api/products/', views.get_all_products),
    path('api/login/', views.login_artisan),
    path('api/cart/', views.add_product_to_cart),
    path('api/checkout/', views.api_checkout, name="checkout"),
    path('api/process_payment/', views.process_payment, name="process_payment"),
    path('api/order/', views.order, name="order"),
    path('api/order/status/', views.update_order_status),
    path('api/orders/', views.orders, name="orders"),
    path('api/orders/active/', views.active_orders),
    path('api/orders/inactive/', views.inactive_orders),
    path('api/orders/<int:days>/', views.order_analytics),
    path('api/order/restock/', views.restock),
    path('api/orderitems/', views.order_items, name="orderitems"),
    path('api/custom/', views.get_custom_order),
    path('api/custom/status', views.change_custom_status),
    path('api/gallery/upload/', views.upload_image, name='upload_image'),
    path('api/gallery/save-order/', views.save_gallery_order, name='save_gallery_order'),
    path('api/gallery/', views.get_gallery_images, name='get_gallery_images'),
    path('api/gallery/<slug:slug>/', views.get_gallery_images_by_slug),
    path('api/gallery/delete/<int:image_id>/', views.delete_image, name='delete_image'),
    path('api/product-image/<int:product_id>/', views.get_gallery_images_by_product_id),
    path('api/categories/<slug:slug>/', views.get_categories_by_slug),
    path('api/categories/', views.get_categories_by_session),
    path('api/category/', views.create_new_category),
    path('api/category/<int:id>/', views.alter_category), 
    path('api/theme/<slug:slug>/', views.get_theme_by_slug),
    path('api/theme/', views.get_theme_by_session),
    path('api/update/theme/', views.update_theme, name='update_theme'),
    path('api/update/logo/', views.update_logo),
    path('api/update/hero/', views.update_hero),
    path('api/text/<slug:slug>/', views.get_text_content_by_slug),
    path('api/text/', views.get_text_content_by_session),
    path('api/edit/text/', views.update_text_content),
    path('api/shop-settings/', views.get_shop_settings_by_session),
    path('api/edit/shop-settings/', views.update_shop_settings),
    path('api/session/', views.session)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
