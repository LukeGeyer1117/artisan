from django.shortcuts import render, get_object_or_404

from ..models import Artisan, Product

### PAGE VIEWS
def splash(request):
    return render(request, 'client/customer/splash.html')

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

def item(request, slug, item_id):
    artisan = get_object_or_404(Artisan, slug=slug)
    item = get_object_or_404(Product, id=item_id)
    return render(request, 'client/customer/item.html', {'artisan': artisan, 'item': item})

def about(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    return render(request, 'client/customer/about.html', {'artisan': artisan})

def login_view(request):
    return render(request, 'client/merchant/login.html')

def dashboard_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/dashboard.html')

def inventory_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/inventory.html')

def orders_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/orders.html')

def custom_orders_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/custom-orders.html')

def reporting_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/reporting.html')

def gallery_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/gallery.html')

def settings_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/settings.html')

def new_item_view(request):
    if 'artisan_id' not in request.session:
        return render(request, 'client/merchant/login.html')
    return render(request, 'client/merchant/add_item.html')