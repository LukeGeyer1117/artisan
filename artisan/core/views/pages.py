
# Auth
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.shortcuts import render, get_object_or_404

from ..models import Artisan, Product

### PAGE VIEWS
def splash(request):
    return render(request, 'client/customer/splash.html')

# ---------------CUSTOMER VIEWS--------------------

def home(request, slug=None):
    if 'cart-product-ids' not in request.session:
        request.session['cart-product-ids'] = []
    if slug:
        artisan = get_object_or_404(Artisan, slug=slug)
        return render(request, 'client/customer/home.html', {'artisan': artisan})
    else:
        return render(request, 'client/customer/home.html')

def slug_home(request, slug):
    print(slug)
    return render(request, 'client/customer/home.html', {'slug': slug})

def gallery(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/gallery.html', {'artisan': artisan})

def shop(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/shop.html', {'artisan': artisan})

def cart(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/cart.html', {'artisan': artisan})

def checkout(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/checkout.html', {'artisan': artisan})

def order_complete(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/order-complete.html', {'artisan': artisan})

def custom(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/custom.html', {'artisan': artisan})

def policies(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/policies.html', {'artisan': artisan})

def item(request, slug, item_id):
    artisan = get_object_or_404(Artisan, slug=slug)
    item = get_object_or_404(Product, id=item_id)
    return render(request, 'client/customer/item.html', {'artisan': artisan, 'item': item})

def about(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/about.html', {'artisan': artisan})

# -------------Merchant Views--------------------

def login_view(request):
    return render(request, 'client/merchant/login.html')

@login_required(login_url='/login/')
def dashboard_view(request):
    artisan = request.user
    return render(request, 'client/merchant/dashboard.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def inventory_view(request):
    artisan = request.user
    return render(request, 'client/merchant/inventory.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def orders_view(request):
    artisan = request.user
    return render(request, 'client/merchant/orders.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def custom_orders_view(request):
    artisan = request.user
    return render(request, 'client/merchant/custom-orders.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def reporting_view(request):
    artisan = request.user
    return render(request, 'client/merchant/reporting.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def gallery_view(request):
    artisan = request.user
    return render(request, 'client/merchant/gallery.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def settings_view(request):
    artisan = request.user
    return render(request, 'client/merchant/settings.html', {
        "artisan": artisan
    })

@login_required(login_url='/login/')
def new_item_view(request):
    artisan = request.user
    return render(request, 'client/merchant/add_item.html', {
        "artisan": artisan
    })