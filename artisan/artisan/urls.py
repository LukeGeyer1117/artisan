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
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core import views
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    # Customer URLS
    path('', views.splash),
    path('home/<slug:slug>/', views.home, name="home"),
    path('gallery/<slug:slug>/', views.gallery, name="gallery"),
    path('shop/<slug:slug>/', views.shop, name="shop"),
    path('cart/<slug:slug>/', views.cart, name="cart"),
    path('checkout/<slug:slug>/', views.checkout, name="checkout"),
    path('custom/<slug:slug>/', views.custom, name="custom"),
    path('policies/<slug:slug>/', views.policies, name="policies"),
    path('item/<slug:slug>/<int:item_id>/', views.item),
    path('about/<slug:slug>/', views.about, name='about'),
    path('order-complete/<slug:slug>/', views.order_complete, name="order_complete"),

    # Merchant URLS
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('inventory/', views.inventory_view),
    path('orders/', views.orders_view),
    path('custom-orders/', views.custom_orders_view),
    path('reporting/', views.reporting_view),
    path('gallery/', views.gallery_view),
    path('settings/', views.settings_view),
    path('add-item/', views.new_item_view),

    # Administrator URLS
    path('admin/', admin.site.urls),

    # Documentation
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    #                                                         #
    #--------------------API Endpoint URLS--------------------#
    #                                                         #

    # Artisan
    path('api/artisan/', views.artisan),
    path('api/artisan/pfp/', views.ArtisanPFPView.as_view()),
    path('api/artisan/<slug:slug>/', views.ArtisanBySlugView.as_view()),
    # Product
    path('api/products/', views.ProductsMerchantView.as_view()),
    path('api/product/', views.ProductMerchantView.as_view()),
    path('api/product/<int:product_id>/', views.get_product),
    path('api/products/<slug:slug>/', views.get_products_by_artisan_slug, name="get_products_by_artisan_slug"),
    path('api/products/<slug:slug>/limit/', views.get_products_by_artisan_slug_limited),
    path('api/product/images/<int:product_id>/', views.get_gallery_images_by_product_id),
    path('api/products/<slug:slug>/featured/', views.get_featured_products_by_slug),
    # Orders
    path('api/order/', views.OrderView.as_view(), name="order"),
    path('api/order/status/', views.UpdateOrderStatusView.as_view()),
    path('api/orders/', views.OrdersMerchantView.as_view()),
    path('api/orders/active/', views.ActiveOrdersMerchantView.as_view()),
    path('api/orders/inactive/', views.inactive_orders),
    path('api/orders/<int:days>/', views.order_analytics),
    path('api/order/restock/', views.restock),
    path('api/orderitems/', views.order_items, name="orderitems"),
    # Custom Request
    path('api/custom/', views.CustomOrderMerchantView.as_view()),
    path('api/custom/status', views.CustomOrderMerchantView.as_view()),
    # Policy
    path('api/policy/', views.PolicyView.as_view()),
    path('api/policy/<slug:slug>/', views.PolicyBySlugView.as_view()),
    # Category
    path('api/categories/', views.get_categories_by_session),
    path('api/category/', views.create_new_category),
    path('api/categories/<slug:slug>/', views.get_categories_by_slug),
    path('api/category/<int:id>/', views.alter_category), 
    # Text Content
    path('api/text/<slug:slug>/', views.TextContentCustomerView.as_view()),
    path('api/text/', views.TextContentMerchantView.as_view()),
    # Settings
    path('api/shop-settings/', views.ShopSettingsMerchantView.as_view()),
    path('api/shop-settings/<slug:slug>/', views.ShopSettingsCustomerView.as_view()),
    # Imagery
    path('api/logo/<slug:slug>/', views.LogoImageCustomerView.as_view()),
    path('api/logo/', views.LogoImageMerchantView.as_view()),
    path('api/hero/<slug:slug>/', views.HeroImageCustomerView.as_view()),
    path('api/hero/', views.HeroImageMerchantView.as_view()),
    # Gallery
    path('api/gallery/upload/', views.upload_image, name='upload_image'),
    path('api/gallery/save-order/', views.save_gallery_order, name='save_gallery_order'),
    path('api/gallery/', views.get_gallery_images, name='get_gallery_images'),
    path('api/gallery/<slug:slug>/', views.get_gallery_images_by_slug),
    path('api/gallery/delete/<int:image_id>/', views.delete_image, name='delete_image'),
    # Theme
    path('api/theme/<slug:slug>/', views.ThemeCustomerView.as_view()),
    path('api/theme/', views.ThemeMerchantView.as_view()),
    # Payments  
    path('api/checkout/<slug:slug>/', views.api_checkout, name="checkout"),

    # MISCELLANEOUS
    path('api/csrf/', views.get_csrf_token), 
    path('api/inventory/', views.get_inventory),
    path('api/login/', views.login_artisan),
    path('api/cart/', views.add_product_to_cart),
    path('api/session/', views.SessionView.as_view()),
    path('api/proxy/gateway/', views.gateway_proxy),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
  urlpatterns += [
    path("__reload__/", include("django_browser_reload.urls")),
  ]
