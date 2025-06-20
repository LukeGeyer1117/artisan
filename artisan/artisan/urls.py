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
    path('custom/<slug:slug>/', views.custom, name="custom"),
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('api/artisan/', views.create_artisan),
    path('api/inventories/', views.create_inventory),
    path('api/inventory/', views.get_inventory),
    path('api/<slug:slug>/products/', views.get_products_by_artisan_slug, name="get_products_by_artisan_slug"),
    path('api/product/', views.product),
    path('api/products/', views.get_all_products),
    path('api/login/', views.login_artisan),
    path('api/cart/', views.add_product_to_cart),
    path('api/session/', views.clear_session)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
