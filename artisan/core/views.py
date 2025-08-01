from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth.hashers import check_password
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
from django.db import transaction
import os

import json
from .models import Artisan, Inventory, Product, Order, OrderItems, CustomRequest, GalleryImage, LogoImage, HeroImage, Category, ProductImage, Theme, TextContent

# Create your views here.
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

@csrf_exempt
def session(request):
    if request.method == 'DELETE':
        request.session.flush()  # Clears all session data
        return JsonResponse({'message': 'Session cleared'})
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def artisan(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        artisan = Artisan.objects.create(
            email = data['email'],
            username = data['username'],
            password = data['password'], #Might hash this
            shop_name = data['shop_name'],
            slug = generate_unique_slug(data['shop_name']),
            product_specialty = data.get('product_specialty', ''),
            price_range_low = data.get('price_range_low', 0),
            price_range_high = data.get('price_range_high', 0),
            accepting_custom_orders = data.get('accepting_custom_orders', False),
        )

        # Create the inventory and theme for the artisan
        Inventory.objects.create(artisan=artisan)
        Theme.objects.create(artisan=artisan)
        return JsonResponse({'message': 'Artisan created', 'id': artisan.id}, status=201)
    elif request.method == 'GET':
        artisan_id = request.session.get('artisan_id', '')
        # Make sure there is an artisan logged in
        if artisan_id == '':
            return JsonResponse({'error': 'No Artisan logged in!'}, status=400)
        
        try:
            artisan = Artisan.objects.filter(id=artisan_id).values().first()
            return JsonResponse({'message': "Artisan found!", 'artisan': artisan})
        except Artisan.DoesNotExist:
            return JsonResponse({'error': "No Artisan Found!"}, status=404)
        
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def create_inventory(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            artisan_id = data.get('artisan_id')

            # Fetch the Artisan instance
            artisan = Artisan.objects.get(id=artisan_id)

            # Create the Inventory linked to that Artisan
            inventory = Inventory.objects.create(artisan=artisan)

            return JsonResponse({'message': 'Inventory created', 'id': inventory.id}, status=201)

        except Artisan.DoesNotExist:
            return JsonResponse({'error': 'Artisan not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid method'}, status=405)

# Create a new order, and order item items
@csrf_exempt
def order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            fullname = data.get('full_name')
            email = data.get('email')
            phone = data.get('phone')
            shipping_addr = data.get('shipping_addr')
            city = data.get('city')
            state = data.get('state')
            zip_code = data.get('zip_code')
            slug = data.get('slug')
            total_price = data.get('total_price')

            order = Order.objects.create(
                customer_name=fullname,
                customer_email=email,
                customer_phone=phone,
                shipping_addr=shipping_addr,
                city=city,
                state=state,
                zip_code=zip_code,
                total_price=total_price,
                artisan=Artisan.objects.get(slug=slug)
            )

            products = request.session.get('cart-product-ids')
            orderItems = []
            for p in products:
                orderitem = OrderItems.objects.create(
                    order=order,
                    product=Product.objects.get(id=p),
                    quantity=int(products[p])
                )
                orderItems.append(orderitem)
            request.session['cart-product-ids'] = {}
            return JsonResponse({'message': "Order Created", 'order': order.id, 'order-items': len(orderItems)},status=200)
        
        except Artisan.DoesNotExist:
            return JsonResponse({'error': 'Artisan not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': "Method Not Allowed"}, status=405)

@csrf_exempt
def update_order_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data['order_id']
            status = data['status']

            order = Order.objects.get(id=order_id)
            order.status = status

            order.save()
            return JsonResponse({'message': 'Updated order status'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def change_custom_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            request_id = data['request_id']
            status = data['status']
            
            request = CustomRequest.objects.get(id=request_id)
            request.status = status

            request.save()
            return JsonResponse({'message': 'Updated order status'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Get all orders under a certain merchant
@csrf_exempt
def orders(request):
    if request.method == 'GET':
        try:
            artisan_id = request.session.get('artisan_id')
            artisan = Artisan.objects.get(id=artisan_id)

            orders = Order.objects.filter(artisan=artisan).order_by('created_at')
            orders_data = [
                {
                    'id': order.id,
                    'customer_name': order.customer_name,
                    'customer_email': order.customer_email,
                    'customer_phone': order.customer_phone,
                    'shipping_addr': order.shipping_addr,
                    'city': order.city,
                    'state': order.state,
                    'zip_code': order.zip_code,
                    'status': order.status,
                    'created_at': order.created_at.strftime('%Y-%m-%d %H:%M'),
                    'total_price': order.total_price,
                }
                for order in orders
            ]

            return JsonResponse({'message': 'Retrieved Orders', 'orders': orders_data}, status=200)
        except Order.DoesNotExist:
            return JsonResponse({'message': 'No Orders Found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f"Could not get orders: {e}"})
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

# Get only orders with a 'pending' or 'approved' status
@csrf_exempt 
def active_orders(request):
    if request.method == "GET":
        try:
            artisan_id = request.session.get('artisan_id')
            artisan = Artisan.objects.get(id=artisan_id)

            orders = Order.objects.filter(artisan=artisan, status__in=['pending', 'approved', 'in_progress']).order_by('created_at')
            orders_data = [
                {
                    'id': order.id,
                    'customer_name': order.customer_name,
                    'customer_email': order.customer_email,
                    'customer_phone': order.customer_phone,
                    'shipping_addr': order.shipping_addr,
                    'city': order.city,
                    'state': order.state,
                    'zip_code': order.zip_code,
                    'status': order.status,
                    'created_at': order.created_at.strftime('%Y-%m-%d %H:%M'),
                    'total_price': order.total_price,
                }
                for order in orders
            ]

            return JsonResponse({'message': 'Retrieved Orders', 'orders': orders_data}, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Could not get active orders!: {e}'}, status=400)
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def inactive_orders(request):
    if request.method == "GET":
        try:
            artisan_id = request.session.get('artisan_id')
            artisan = Artisan.objects.get(id=artisan_id)

            orders = Order.objects.filter(artisan=artisan, status__in=['completed', 'denied']).order_by('status')
            orders_data = [
                {
                    'id': order.id,
                    'customer_name': order.customer_name,
                    'customer_email': order.customer_email,
                    'customer_phone': order.customer_phone,
                    'shipping_addr': order.shipping_addr,
                    'city': order.city,
                    'state': order.state,
                    'zip_code': order.zip_code,
                    'status': order.status,
                    'created_at': order.created_at.strftime('%Y-%m-%d %H:%M'),
                }
                for order in orders
            ]

            return JsonResponse({'message': 'Retrieved Orders', 'orders': orders_data}, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Could not get active orders!: {e}'}, status=400)
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def order_items(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            order_id = data['order_id']

            order = Order.objects.get(id=order_id)

            orderItems = OrderItems.objects.filter(order=order).values()
            print(orderItems)
            return JsonResponse({'message': 'Found Order Items', 'orderItems': list(orderItems)})
        except Exception as e:
            return JsonResponse({'error': "Error getting order items " + str(e)})
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def login_artisan(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            e = data.get('email')
            password = data.get('password')

            try:
                artisan = Artisan.objects.get(email=e)
            except Artisan.DoesNotExist:
                return JsonResponse({'error': 'No Artisan Found'}, status=404)
            
            if check_password(password, artisan.password):
                request.session['artisan_id'] = artisan.id  # Django session
                inventory = Inventory.objects.get(artisan=artisan)
                inventory_id = inventory.id
                request.session['inventory_id'] = inventory_id
                print("artisan id: ", request.session.get('artisan_id'), "inventory id: ", request.session['inventory_id'])
                return JsonResponse({'message': 'Login successful', 'artisan_id': artisan.id})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
@require_http_methods(['POST', 'DELETE', 'GET'])
def product(request):
    actual_method = request.POST.get('_method', '').upper()
    if request.method == 'POST':
        # Check to see if the acutal method tag is a 'PATCH'
        if actual_method == 'PATCH':
            try:
                product_id = request.POST.get('id')
                if not product_id:
                    return JsonResponse({'error': 'Missing product ID'}, status=400)

                product = Product.objects.get(id=product_id)

                # Update fields if provided
                if 'name' in request.POST:
                    product.name = request.POST['name']
                if 'price' in request.POST:
                    product.price = request.POST['price']
                if 'quantity' in request.POST:
                    product.quantity = request.POST['quantity']
                if 'description' in request.POST:
                    product.description = request.POST['description']
                if 'image' in request.FILES:
                    product.image = request.FILES['image']

                product.save()
                return JsonResponse({'message': 'Product updated', 'id': product.id})

            except Product.DoesNotExist:
                return JsonResponse({'error': 'Product not found'}, status=404)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
            
        try:
            inventory_id = request.session.get('inventory_id')
            print(inventory_id)

            # Fetch the Inventory record
            inventory = Inventory.objects.get(id=inventory_id)

            # Create the product linked to that inventory
            product = Product.objects.create(
                inventory = inventory,
                name = request.POST.get('name'),
                price = request.POST.get('price'),
                quantity = request.POST.get('quantity'),
                description = request.POST.get('description'),
                image = request.FILES.get('image')
            )

            return JsonResponse({'message': 'Product created', 'id': product.id}, status=201)
        
        except Inventory.DoesNotExist:
            return JsonResponse({'error': 'Artisan not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    elif request.method == 'DELETE':
        try:
            product_id = request.GET.get('id')
            if not product_id:
                return JsonResponse({'error': 'Missing product ID'}, status=400)

            product = Product.objects.get(id=product_id)
            product.delete()

            return JsonResponse({'message': 'Product deleted'}, status=200)
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        

    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def get_product(request, product_id):
    if request.method == 'GET':
        try:    
            product = Product.objects.filter(id=product_id).values().first()

            if not product:
                return JsonResponse({'error': 'Product not found'}, status=404)

            return JsonResponse({'message': 'Found proudct', 'product': product}, status=200)
        except Exception as e:
            return JsonResponse({'error': f'Error finding product: {e}'})
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def get_inventory(request):
    if request.method == 'GET':
        artisan_id = request.session.get('artisan_id')
        if not artisan_id:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        inventory = Inventory.objects.filter(artisan_id=artisan_id).first()
        if not inventory:
            return JsonResponse({'error': 'Inventory not found'}, status=404)
        
        products = Product.objects.filter(inventory_id=inventory.id).values()
        return JsonResponse(list(products), safe=False)
    
    else:
        return JsonResponse({'error': "Method not allowed"}, status=405)
    
@csrf_exempt
@require_GET
def get_products_by_artisan_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    
    inventory = Inventory.objects.filter(artisan=artisan).first()
    if not inventory:
        return JsonResponse({'error': 'Inventory not found'}, status=404)

    products = Product.objects.filter(inventory=inventory).order_by('price').values()
    return JsonResponse(list(products), safe=False)

@csrf_exempt
@require_GET
def get_products_by_artisan_slug_limited(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)

    inventory = Inventory.objects.filter(artisan=artisan).first()
    if not inventory:
        return JsonResponse({'error': "Inventory not found"}, status=404)
    
    products = Product.objects.filter(inventory=inventory).order_by('price').values()[:20]
    return JsonResponse(list(products), safe=False)

@require_GET
def get_all_products(request):
    try:
        products = Product.objects.all().values()
        return JsonResponse(list(products), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt    
def add_product_to_cart(request):
    # Called when customer adds an item to their cart
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            if not data or 'product_id' not in data or 'quantity' not in data:
                return JsonResponse({'error': 'No product ID or No quantity'}, status=400)
            try:
                cart = request.session.get('cart-product-ids', {})
                if cart == []: 
                    cart = {}
                print(cart)
                cart[data['product_id']] = data['quantity']
                request.session['cart-product-ids'] = cart

                print(request.session['cart-product-ids'])
                return JsonResponse({'message': 'Product ID added to cart'}, status=200)
            except:
                return JsonResponse({'error': 'Could not add product id to cart'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'could not add to cart: {e}'}, status=500)
    # Automatically called to get all the customer's cart items
    elif request.method == "GET":
        try:
            raw_items = request.session.get('cart-product-ids', [])

            product_ids = []
            for item in raw_items:
                product_ids.append(item)

            print(product_ids)

            products = Product.objects.filter(id__in=product_ids).values()
            return JsonResponse({'products': list(products), 'raw_data': raw_items}, safe=False, status=200)
        except Exception as e:
            return JsonResponse({'error': f'could not retrieve cart products: {e}'}, status=500)
    # Allow the customer to change the quantity of an item in their cart
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            if not data or 'product_id' not in data or 'quantity' not in data:
                return JsonResponse({'error': 'Invalid Data'})
            try:
                cart = request.session.get('cart-product-ids')
                cart[data['product_id']] = int(data['quantity'])
                request.session['cart-product-ids'] = cart

                return JsonResponse({'message': 'Product Quantity Edited in Cart', 'value': data['quantity']}, status=200)
            except:
                return JsonResponse({'error': 'Could not edit item-in-cart quantity'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Could not edit cart product: {e}'}, status=500)
    # Allow the customer to remove a product from their cart
    elif request.method == "DELETE":
        try:
            data = json.loads(request.body)
            print(data)
            product_id = data.get('product_id')
            if not product_id:
                return JsonResponse({'error': 'Product ID missing'}, status=400)
            
            product_id = str(product_id)

            # Get the current cart list from the session
            cart = request.session.get('cart-product-ids', {})
            print(cart)

            # Try to remove the product ID if it exists
            if product_id in cart:
                del cart[product_id]
                request.session['cart-product-ids'] = cart  # Save updated list back to session
                return JsonResponse({'message': 'Product removed from cart'})
            else:
                return JsonResponse({'error': 'Product not found in cart'}, status=404)

        except Exception as e:
            return JsonResponse({'error': f'Failed to remove item: {e}'}, status=500)


    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_checkout(request):
    # Create the session checkout data
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request.session['checkout-total'] = data['total']

            return JsonResponse({'message': "Checkout Created"}, status=200)
        except Exception as e:
            return JsonResponse({'error': f'Failed to create a checkout: {e}'}, status=500)
    # Get the session checkout data
    elif request.method == "GET":
        try:
            total = request.session.get('checkout-total', 0)
            if total == 0:
                return JsonResponse({'error': 'No Checkout Total'})
            return JsonResponse({'message': 'Found total', 'total': total})
        except Exception as e:
            return JsonResponse({'error': f'Failed to retrieve a checkout: {e}'}, status=500)
    return JsonResponse({"error": 'Method not allowed'}, status=405)

# This is just a throwaway endpoint to simulate processing a payment.
# This will always return a success.
@csrf_exempt
def process_payment(request):
    if request.method == "POST":
        return JsonResponse({'message': 'Payment Processed Successfully', 'payment_status': "SUCCEED"}, status=200)
    else:
        return JsonResponse({'message': 'Payment Processed Successfully, but use the right method!!'}, status=200)


@csrf_exempt
def get_custom_order(request):
    if request.method == 'GET':
        artisan_id = request.session.get('artisan_id')

        artisan = Artisan.objects.get(id=artisan_id)

        custom_requests = CustomRequest.objects.filter(artisan=artisan).values()
        return JsonResponse({'message': 'Found requests', 'customRequests': list(custom_requests)})

    return JsonResponse({'error': 'method not allowed'}, status=405)

@csrf_exempt
@require_http_methods(['POST'])
def upload_image(request):
    """Handle image upload"""
    if 'image' not in request.FILES:
        return JsonResponse({'error': 'No image provided'}, status=400)
    
    image = request.FILES['image']

    # validate file type
    if not image.content_type.startswith('image/'):
        return JsonResponse({'error': 'Invalid file type'}, status=400)
    
    # Create gallery image instance
    gallery_image = GalleryImage(
        artisan=Artisan.objects.get(id=request.session.get('artisan_id')), 
        image=image
    )
    gallery_image.save()

    return JsonResponse({
        'id': gallery_image.id,
        'url': gallery_image.image.url,
        'order': gallery_image.order
    })

@csrf_exempt
@require_http_methods(['POST'])
def save_gallery_order(request):
    """Save the new order of gallery images"""
    try:
        # Get the artisan_id from session
        artisan_id = request.session.get('artisan_id')
        if not artisan_id:
            return JsonResponse({'error': 'No artisan session found'}, status=400)
        
        # Get the specific artisan object
        artisan = Artisan.objects.get(id=artisan_id)
        
        # Parse JSON data
        data = json.loads(request.body)
        images_data = data.get('images', [])
        
        if not images_data:
            return JsonResponse({'error': 'No images provided'}, status=400)
        
        # Use transaction to ensure data consistency
        with transaction.atomic():
            # First, temporarily set all orders to negative values to avoid unique constraint conflicts
            gallery_images = GalleryImage.objects.filter(artisan=artisan).order_by('order')
            for i, image in enumerate(gallery_images):
                image.order = -(i + 1)
                image.save()
            
            # Then update with the new order values
            for image_data in images_data:
                image_id = image_data.get('id')
                new_order = image_data.get('order')
                
                # Verify the image exists and belongs to this artisan
                try:
                    image = GalleryImage.objects.get(id=image_id, artisan=artisan)
                    image.order = new_order
                    image.save()
                except GalleryImage.DoesNotExist:
                    print(f"Warning: Image {image_id} not found for artisan {artisan_id}")
                    continue
        
        return JsonResponse({'success': True})
    
    except Artisan.DoesNotExist:
        return JsonResponse({'error': 'Artisan not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Save order error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def get_gallery_images(request):
    """Get all gallery images for the current merchant"""
    images = GalleryImage.objects.filter(artisan=Artisan.objects.get(id=request.session.get('artisan_id'))).order_by('order')

    images_data = [
        {
            'id': img.id,
            'url': img.image.url,
            'order': img.order
        } for img in images
    ]

    return JsonResponse({'images': images_data})

@csrf_exempt
@require_GET
def get_gallery_images_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)

    images = GalleryImage.objects.filter(artisan=artisan).order_by('order')
    images_data = [
        {
            'id': img.id,
            'url': img.image.url,
            'order': img.order
        } for img in images
    ]

    if len(images_data) > 0:
        return JsonResponse({'images': images_data})
    return JsonResponse({'error': 'No images found'}, status=404)

@csrf_exempt
@require_http_methods(['DELETE'])
def delete_image(request, image_id):
    """Delete a gallery image and reorder remaining images"""
    try:
        # Get the artisan_id from session
        artisan_id = request.session.get('artisan_id')
        if not artisan_id:
            return JsonResponse({'error': 'No artisan session found'}, status=400)
        
        # Get the specific artisan object
        artisan = Artisan.objects.get(id=artisan_id)
        
        # Get the image to delete
        image = get_object_or_404(GalleryImage, id=image_id, artisan=artisan)
        deleted_order = image.order
        
        # Use transaction to ensure data consistency
        with transaction.atomic():
            # Delete the image
            image.delete()
            
            # Reorder remaining images to fill the gap
            remaining_images = GalleryImage.objects.filter(
                artisan=artisan,
                order__gt=deleted_order
            ).order_by('order')
            
            for idx, img in enumerate(remaining_images):
                img.order = deleted_order + idx
                img.save()
        
        return JsonResponse({'success': True})
    
    except Artisan.DoesNotExist:
        return JsonResponse({'error': 'Artisan not found'}, status=404)
    except Exception as e:
        print(f"Delete error: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def get_hero_image(request, slug):
    if request.method == 'GET':
        artisan = get_object_or_404(Artisan, slug=slug)
        hero = get_object_or_404(HeroImage, artisan=artisan)
        print(artisan, hero)

        try:
            # check if the image file exists
            if not hero.image or not os.path.exists(hero.image.path):
                return JsonResponse({'error': 'Image file not found'}, status=404)

            return JsonResponse({'message': 'Found hero image', 'image_url': hero.image.url}, status= 200)
        except Exception as e:
            return JsonResponse({'error': 'Error serving image'}, status=500)
    return JsonResponse({'error': "Method Not Allowed"}, status=405)

@csrf_exempt
def get_logo_image(request, slug):
    if request.method == 'GET':
        artisan = get_object_or_404(Artisan, slug=slug)
        logo = get_object_or_404(LogoImage, artisan=artisan)

        try:
            # Check if the image file exists
            if not logo.image:
                return JsonResponse({'error': "Image not found"})
        
            return JsonResponse({'message': "Found logo_image", 'image_url': logo.image.url}, status=200)
        except Exception as e:
            return JsonResponse({'error': "Error serving image"}, status=500)
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def create_hero_image(request):
    pass

@csrf_exempt
def create_logo_image(request):
    if request.method == 'POST':
        artisan_id = request.session.get('artisan_id')

        if not artisan_id:
            return JsonResponse({'error': 'Not authenticated'})
        artisan = get_object_or_404(Artisan, id=artisan_id)
        
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'no image file provided'}, status=400)
        
        image_file = request.FILES['image']
        
        # validate file types
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if image_file.content_type not in allowed_types:
            return JsonResponse({'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP allowed'}, status=400)
        
        # validate file size (max 5mb)
        max_size = 5 * 1024**2
        if image_file.size > max_size:
            return JsonResponse({'error': 'File too large, maximum size is 5MB'}, status=400)
        
        # Check if the artisan already has a logo image. Create new if not, update if so.
        try:
            logo = LogoImage.objects.get(artisan=artisan)
            logo.image = image_file
            logo.save()
            message = "Logo image updated successfully"
        except LogoImage.DoesNotExist:
            logo = LogoImage.objects.create(artisan=artisan, image=image_file)
            message = "Logo image created successfully"

        return JsonResponse({
            'message': message,
            'image_url': logo.image_url,
            'logo_id': logo.id
        }, status=201)
    return JsonResponse({'error': "Method Not Allowed"}, status=405)

@csrf_exempt
@require_GET
def get_categories_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    categories = Category.objects.filter(owner=artisan)

    categories_data = list(categories.values())

    return JsonResponse({'message': 'found categories', 'categories': categories_data})

@csrf_exempt
@require_GET
def get_categories(request):
    artisan = get_object_or_404(Artisan, id=request.session.get('artisan_id'))

    categories = Category.objects.filter(owner=artisan).values()

    return JsonResponse({'categories': list(categories)})

@csrf_exempt
@require_GET
def get_gallery_images_by_product_id(request, product_id):

    product = Product.objects.get(id=product_id)

    product_images = ProductImage.objects.filter(product=product).values()

    return JsonResponse({'message': 'found product_images', 'product_images': list(product_images)})

@csrf_exempt
@require_POST
def create_new_category(request):
    artisan = Artisan.objects.get(id=request.session.get('artisan_id'))

    if not artisan:
        return JsonResponse({'error': 'Not authenticated'}, status=400)
    
    data = json.loads(request.body)
    
    Category.objects.create(owner=artisan, name=data['name'])
    return JsonResponse({'message': 'created category'})

@csrf_exempt
@require_GET
def get_theme_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    theme = get_object_or_404(Theme, artisan=artisan)

    theme_data = {
        'text_color': theme.text_color,
        'background_color': theme.background_color,
        'accent_color': theme.accent_color,
        'link_hover_color': theme.link_hover_color,
    }

    return JsonResponse({'message': 'Found theme', 'theme': theme_data}, status=200)

@csrf_exempt
@require_GET
def get_text_content_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    text_content = get_object_or_404(TextContent, artisan=artisan)

    text_content_data = {
        'hero_sentence_draw': text_content.hero_sentence_draw,
        'hero_header_draw': text_content.hero_header_draw
    }

    return JsonResponse({'message': 'Found Text Content', 'text_content': text_content_data})


### Creates a 'slug' that django uses to route. Converts "Great Scott's Doughnuts" => "great-scotts-doughnuts"
### Adds an integer to the end of new slugs when an equivalent slug already exists in db. i.e. "blindr" => "blindr-1"
def generate_unique_slug(shop_name):
    base_slug = slugify(shop_name)
    slug = base_slug
    i = 1
    while Artisan.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{i}"
        i += 1
    return slug