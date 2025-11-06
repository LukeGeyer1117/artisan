import os, json
from datetime import datetime, timedelta

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict

# CSRF and HTTP methods
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.views.decorators.http import require_GET, require_POST, require_http_methods

# Auth
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.contrib.auth import logout

# All Django models
from ..models import *
# All helper functions
from .helper import *

from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth import login
from django.db import transaction

### API VIEWS

@csrf_exempt
@require_http_methods(['POST', 'GET', 'PATCH'])
@transaction.atomic
def artisan(request):
    # Create an Artisan (Sign Up)
    if request.method == 'POST':
        try:
            #  Get the data from the request, and serialize it into individual fields
            data = json.loads(request.body)
            post_data = {}
            fields = ['email', 'username', 'shop_name', 'password', 'name', 'phone']
            for field in fields:
                post_data[field] = data[field]
            print(post_data)

            # Check if the email has been used
            if Artisan.objects.filter(email=post_data['email']):
                return JsonResponse({'error': "Email is already in use."}, status=400)

            # Use the custom manager to handle password hashing
            artisan = Artisan.objects.create_user(
                email=post_data['email'],
                username=post_data['username'],
                shop_name=post_data['shop_name'],
                password=post_data['password'],
                full_name=post_data['name'],
                phone_number=post_data['phone'],
                slug=generate_unique_slug(post_data['shop_name']),
                accepting_custom_orders=False,
            )

            # Related setup
            Inventory.objects.create(artisan=artisan)
            Theme.objects.create(artisan=artisan)
            LogoImage.objects.create(artisan=artisan)
            HeroImage.objects.create(artisan=artisan)
            ShopSettings.objects.create(artisan=artisan)
            Policies.objects.create(artisan=artisan)

            # Auto-login after signup
            login(request, artisan)

            return JsonResponse({'message': 'Artisan created', 'id': artisan.id}, status=201)

        except KeyError as e:
            return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    # Get the current Artisan
    elif request.method == 'GET':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'No Artisan logged in!'}, status=401)

        artisan = Artisan.objects.filter(id=request.user.id).values().first()
        if artisan:
            return JsonResponse({'message': "Artisan found!", 'artisan': artisan})
        return JsonResponse({'error': "No Artisan Found!"}, status=404)

    # Update the current Artisan
    elif request.method == 'PATCH':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'No Artisan logged in!'}, status=401)

        try:
            artisan_to_update = Artisan.objects.get(id=request.user.id)
            data = json.loads(request.body)

            for key, value in data.items():
                if key == "password":
                    artisan_to_update.set_password(value)
                elif hasattr(artisan_to_update, key):
                    setattr(artisan_to_update, key, value)
                else:
                    return JsonResponse({'error': f'Invalid field: {key}'}, status=400)

            artisan_to_update.save()
            return JsonResponse({
                'message': 'Artisan updated successfully',
                'artisan': Artisan.objects.filter(id=request.user.id).values().first()
            })

        except Artisan.DoesNotExist:
            return JsonResponse({'error': "Artisan not found."}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        
@csrf_exempt
@require_http_methods(['GET'])
def artisan_by_slug(request, slug):
    """
    Public view for customers to get artisan information by slug.
    Only returns safe, customer-facing data.
    """
    try:
        artisan = Artisan.objects.get(slug=slug)
        
        # Only return customer-safe fields
        artisan_data = {
            'shop_name': artisan.shop_name,
            'slug': artisan.slug,
            'contact_email': artisan.contact_email,
            'accepting_custom_orders': artisan.accepting_custom_orders,
            'image_url': artisan.image.url if artisan.image else None,
            'facebook_link': artisan.facebook_link,
            'instagram_link': artisan.instagram_link,
            'youtube_link': artisan.youtube_link,
        }
        
        return JsonResponse({
            'message': 'Artisan found',
            'artisan': artisan_data
        })
        
    except Artisan.DoesNotExist:
        return JsonResponse({'error': 'Artisan not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': 'An error occurred'}, status=500)
        
@login_required(login_url='/login/')
@require_POST
def artisan_upload_profile_image(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    try:
        
        # Check if an image file was included in the request
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file found in the request.'}, status=400)

        new_image = request.FILES['image']
        print(f"New Image: {new_image}")
        
        # Optionally, delete the old image file if it exists
        if artisan.image and os.path.exists(artisan.image.path):
            os.remove(artisan.image.path)

        # Update the image field with the new file
        artisan.image = new_image
        artisan.save()
        
        return JsonResponse({
            'message': 'Profile image uploaded successfully',
            'image_url': artisan.image.url
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required(login_url='/login/')
@require_http_methods(['DELETE'])
def artisan_remove_profile_image(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error1': "Not authenticated"}, status=401)
    
    try:
        if artisan.image:
            # Delete the file from the filepath if it exists
            if os.path.exists(artisan.image.path):
                os.remove(artisan.image.path)
        
            # Clear the image field
            artisan.image.delete(save=False) # Remove file from storage
            artisan.image = None
            artisan.save()

            return JsonResponse({
                'message': "Profile image removed successfully"
            }, status=200)
    
        else:
            return JsonResponse({'error': 'No profile image to remove'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Create an Inventory
@csrf_exempt
@require_POST
def create_inventory(request):
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

# Create a new order, and order item items
@csrf_exempt
@require_POST
def order(request):
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
            product=Product.objects.get(id=p)
            product.quantity -= int(products[p])
            product.save()
            orderItems.append(orderitem)
        request.session['cart-product-ids'] = {}
        return JsonResponse({'message': "Order Created", 'order': order.id, 'order-items': len(orderItems)},status=200)
    
    except Artisan.DoesNotExist:
        return JsonResponse({'error': 'Artisan not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# UPdate an order's status
@login_required(login_url='/login/')
@require_POST
def update_order_status(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    try:
        data = json.loads(request.body)
        order_id = data['order_id']
        status = data['status']

        order = Order.objects.get(id=order_id, artisan=artisan)
        order.status = status

        order.save()
        return JsonResponse({'message': 'Updated order status'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
@require_POST
def restock(request):
    artisan_id = request.session.get('artisan_id')
    if not artisan_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    artisan = Artisan.objects.get(id=artisan_id)

    try:
        data = json.loads(request.body)
        order_id = data['order_id']
    except (KeyError, json.JSONDecodeError):
        return JsonResponse({'error': 'Invalid request data'}, status=400)

    try:
        order = Order.objects.get(id=order_id, artisan=artisan)
    except Order.DoesNotExist:
        return JsonResponse({'error': 'No order found'}, status=404)

    order_items = OrderItems.objects.filter(order=order)

    for item in order_items:
        item.product.quantity += item.quantity
        item.product.save()

    return JsonResponse({'message': 'Restocked items'})

    

# Change status of custom request
@csrf_exempt
@require_POST
def change_custom_status(request):
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

# Get all orders under a certain merchant
@login_required(login_url='/login/')
@require_GET
def orders(request):
    try:
        artisan = request.user

        if not artisan.is_authenticated:
            return JsonResponse({'error': "Not authenticated"}, status=401)

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

# Get only orders with a 'pending' or 'approved' status
@login_required(login_url='/login/')
@require_GET
def active_orders(request):
    try:
        artisan = request.user
        
        if not artisan.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)

        orders = Order.objects.filter(
            artisan=artisan, 
            status__in=['pending', 'approved', 'in_progress']
        ).order_by('created_at')

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

@csrf_exempt
@require_GET
def inactive_orders(request):
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

# Get orders for analytics
@login_required(login_url='/login/')
@require_GET
def order_analytics(request, days: int):
    try:
        artisan = request.user
        if not artisan.is_authenticated:
            return JsonResponse({'error': "Not authenticated"}, status=401)
        
        if not days or type(days) != int:
            return JsonResponse({'error': "No valid range specified"}, status=400)
        
        date = days_to_datetime(days)

        # Only get 
        orders = Order.objects.filter(artisan=artisan, created_at__gt=date).order_by('-created_at')
        orders_data = [
            {
                'total_price': order.total_price,
                'status': order.status,
                'created_at': order.created_at.strftime('%Y-%m-%d'),
            } 
            for order in orders
        ]
        
        return JsonResponse({'message': "Retrieved Orders", "orders": orders_data[:3000]}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
        

        


@csrf_exempt
@require_POST
def order_items(request):
    try:
        data = json.loads(request.body)
        order_id = data['order_id']

        order = Order.objects.get(id=order_id)

        orderItems = OrderItems.objects.filter(order=order).values()
        print(orderItems)
        return JsonResponse({'message': 'Found Order Items', 'orderItems': list(orderItems)})
    except Exception as e:
        return JsonResponse({'error': "Error getting order items " + str(e)})

@csrf_protect
@require_POST
def login_artisan(request):
    try:
        data = json.loads(request.body)
        e = data.get('email')
        password = data.get('password')

        artisan = authenticate(request, username=e, password=password)
        if artisan is None:
            return JsonResponse({'error': "Invalid credentials"}, status=401)
        
        login(request, artisan)

        return JsonResponse({'message': 'Login successful', 'artisan_id': artisan.id})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)  
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_http_methods(['POST', 'DELETE'])
def product(request):
    # Authenticate the caller
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    ### POST
    if request.method == 'POST' and request.POST.get('_method') != "PATCH":
        # Get the inventory, if somehow there isn't one, create it
        inventory, _ = Inventory.objects.get_or_create(artisan=artisan)

        print(f'Inventory: {inventory}')

        ### Attempt the php script to make product in Troute
        data = {}
        fields = ['name', 'price', 'description', 'quantity']
        for field in fields:
           data[field] = request.POST.get(field)
        file_fields = ['image']
        for field in file_fields:
            data[field] = request.FILES.get(field)

        # Check the input
        if not data['name'] or not data['price'] or not data['description'] or not data['quantity'] or not data['image']:
            return JsonResponse({'error': "Invalid Request: One or more missing fields"}, status=400)

        # Create the troute product
        response_from_php = call_php_create_product(
            artisan.troute_login,
            artisan.troute_key,
            data['name'], 
            data['description'],
            data['price'],
        )

        # Before making the product, make sure Troute created it
        parsed = sanitize_troute_resp(response_from_php)
        
        ### Create the product in my db
        Product.objects.create(
            inventory=inventory,
            name=data['name'],
            price=data['price'],
            quantity=data['quantity'],
            description=data['description'],
            image=data['image'],
            troute_unique_id=parsed['product']['uniqueID']
            )

        if parsed['result'] != "success":
            return JsonResponse({'message': "Product Created, but Troute product not successfully created"}, status=200)
        
        return JsonResponse({'message': "Product Created"}, status=200)
        
    ### PATCH
    elif request.method == 'POST' and request.POST.get('_method') == 'PATCH':
        try:
            # Make sure the product id was given correctly
            product_id = request.POST.get('id')
            if not product_id:
                return JsonResponse({'error': "Invalid Request: Missing product ID"}, status=400)
            
            # Get the product, error if not found
            product = get_object_or_404(Product, id=product_id)

            # Get all the required fields for the request
            fields = ['name', 'price', 'quantity', 'description', 'category']
            data = {}
            for field in fields:
                data[field] = request.POST.get(field)

            file_fields = ['image']
            for field in file_fields:
                data[field] = request.FILES.get(field)

            # Try to update in troute first
            response_from_php = call_php_edit_product(
                artisan.troute_login,
                artisan.troute_key,
                product.troute_unique_id,
                data['name'],
                data['description'],
                data['price']
            )
            parsed = sanitize_troute_resp(response_from_php)
            print(f"Parsed result: {parsed['result']}")

            if parsed['result'] != "success":
                return JsonResponse({'error': "Internal Server Error: Could not edit product due to Troute issue"}, status=500)
                
            # Update fields if provided
            if data['name']:
                product.name = data['name']
            if data['price']:
                product.price = data['price']
            if data['quantity']:
                product.quantity = data['quantity']
            if data['description']:
                product.description = data['description']
            if data['image']:
                product.image = data['image']
            if data['category']:
                product.category_id = data['category']

            product.save()

            # Handle extra images
            extra_images = request.FILES.getlist('extra_images')
            for image_file in extra_images:
                ProductImage.objects.create(product=product, image=image_file)

            return JsonResponse({'message': "Updated Product"}, status=200)
            
        except Product.DoesNotExist:
            return JsonResponse({'error': "Not Found: Product with id could not be found"}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    ### DELETE
    elif request.method == 'DELETE':
        try:
            # Load product id from request
            data = json.loads(request.body)
            product_id = data['id']

            if not product_id:
                return JsonResponse({'error': "Invalid Request: No Product ID"}, status=400)
            
            # Use the product id to get the product
            product = Product.objects.get(id=product_id)

            # Make sure product has troute unique id and call delete to troute first
            if product.troute_unique_id:
                response_from_php = call_php_delete_product(
                    artisan.troute_login,
                    artisan.troute_key,
                    product.troute_unique_id
                )

                parsed = sanitize_troute_resp(response_from_php)
            product.delete()
            return JsonResponse({'message': "Product Deleted"}, status=200)
        
        except Product.DoesNotExist:
            return JsonResponse({'error': "Not Found: Product with id could not be found"}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_GET
def get_product(request, product_id):
    try:    
        product = Product.objects.filter(id=product_id).values().first()

        if not product:
            return JsonResponse({'error': 'Product not found'}, status=404)

        return JsonResponse({'message': 'Found proudct', 'product': product}, status=200)
    except Exception as e:
        return JsonResponse({'error': f'Error finding product: {e}'})

@csrf_exempt
@require_http_methods(['PUT'])
def set_product_category(request):
    artisan=Artisan.objects.get(id=request.session.get('artisan_id'))
    if not artisan:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    data = json.loads(request.body)
    print(data)

@login_required(login_url='/login/')
@require_GET
def get_inventory(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    inventory = Inventory.objects.filter(artisan=artisan).first()
    if not inventory:
        return JsonResponse({'error': 'Inventory not found'}, status=404)
    
    products = Product.objects.filter(inventory_id=inventory.id).values()
    return JsonResponse(list(products), safe=False)
    
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

@csrf_protect
def api_checkout(request):
    # Create the session checkout data
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request.session['checkout-total'] = data['total']
            request.session['products_and_quantities'] = data['products_and_quantities']
            print(request.session['products_and_quantities'])

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
@csrf_protect
@require_POST
def process_payment(request):
    return JsonResponse({'message': 'Payment Processed Successfully', 'payment_status': "SUCCEED"}, status=200)



@login_required(login_url='/login/')
@require_GET
def get_custom_order(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    custom_requests = CustomRequest.objects.filter(artisan=artisan).values()
    return JsonResponse({'message': 'Found requests', 'customRequests': list(custom_requests)})

@login_required(login_url='/login/')
@require_http_methods(['POST'])
def upload_image(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=201)

    """Handle image upload"""
    if 'image' not in request.FILES:
        return JsonResponse({'error': 'No image provided'}, status=400)
    
    image = request.FILES['image']

    # validate file type
    if not image.content_type.startswith('image/'):
        return JsonResponse({'error': 'Invalid file type'}, status=400)
    
    # Create gallery image instance
    gallery_image = GalleryImage(
        artisan=artisan,
        image=image
    )
    gallery_image.save()

    return JsonResponse({
        'id': gallery_image.id,
        'url': gallery_image.image.url,
        'order': gallery_image.order
    })

@login_required(login_url='/login/')
@require_POST
def save_gallery_order(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    """Save the new order of gallery images"""
    try:
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
                    print(f"Warning: Image {image_id} not found for artisan {artisan.id}")
                    continue
        
        return JsonResponse({'success': True})
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Save order error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required
@require_GET
def get_gallery_images(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)
    
    """Get all gallery images for the current merchant"""
    images = GalleryImage.objects.filter(artisan=artisan).order_by('order')
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

@login_required(login_url='/login/')
@require_http_methods(['DELETE'])
def delete_image(request, image_id):
    """Delete a gallery image and reorder remaining images"""
    try:
        # Get the artisan_id from session
        artisan = request.user
        if not artisan.is_authenticated:
            return JsonResponse({'error': "Not authenticated"}, status=401)
        
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

    except Exception as e:
        print(f"Delete error: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def get_hero_image_by_slug(request, slug):
    if request.method == 'GET':
        artisan = get_object_or_404(Artisan, slug=slug)
        hero = get_object_or_404(HeroImage, artisan=artisan)
        print(artisan, hero)

        try:
            # check if the image file exists
            if not hero.image or not os.path.exists(hero.image.path):
                return JsonResponse({'error': 'Image file not found'}, status=404)

            return JsonResponse({'message': 'Found hero image', 'image_url': hero.image.url}, status=200)
        except Exception as e:
            return JsonResponse({'error': 'Error serving image'}, status=500)
    return JsonResponse({'error': "Method Not Allowed"}, status=405)

@login_required(login_url='/login/')
@require_GET
def get_hero_image_by_session(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, stauts=401)

    hero, created = HeroImage.objects.get_or_create(artisan=artisan)

    message = 'Created hero image' if created else 'Found hero image'

    # Check if logo has an image and if the image has a URL
    if not hero.image or not hero.image.url:
        return JsonResponse({'error': 'Image not found'})
    
    return JsonResponse({'message': message, 'image_url': hero.image.url}, status=200)

@csrf_exempt
def get_logo_image_by_slug(request, slug):
    if request.method == 'GET':
        print(slug)
        artisan = get_object_or_404(Artisan, slug=slug)
        print(artisan)
        logo = get_object_or_404(LogoImage, artisan=artisan)

        try:
            # Check if the image file exists
            if not logo.image:
                return JsonResponse({'error': "Image not found"})
        
            return JsonResponse({'message': "Found logo_image", 'image_url': logo.image.url}, status=200)
        except Exception as e:
            return JsonResponse({'error': "Error serving image"}, status=500)
    return JsonResponse({'error': 'Method Not Allowed'}, status=405)


'''
API URL: '/api/logo/'
REQUIRES LOGIN
'''
@login_required(login_url='/login/')
@require_GET
def get_logo_image_by_session(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'})

    logo, created = LogoImage.objects.get_or_create(artisan=artisan)

    message = 'Created logo image' if created else 'Found logo image'

    # Check if logo has an image and if the image has a URL
    if not logo.image or not logo.image.url:
        return JsonResponse({'error': 'Image not found'})
    
    return JsonResponse({'message': message, 'image_url': logo.image.url}, status=200)

@csrf_exempt
def create_hero_image(request):
    pass

@login_required(login_url='/login/')
@require_POST
def create_logo_image(request):
    # Authenicate the artisan
    artisan = request.user
    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=403)

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
    logo, created = LogoImage.objects.get_or_create(artisan=artisan)

    logo.image = image_file

    if created:
        return JsonResponse({'message': "Logo image created successfully", 'image_url': logo.image_url, 'logo_id': logo.id}, status=200)
    return JsonResponse({'message': "Logo image updated", 'image_url': logo.image_url, 'logo_id': logo.id}, status=201)

@csrf_exempt
@require_GET
def get_categories_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    categories = Category.objects.filter(owner=artisan)

    categories_data = list(categories.values())

    return JsonResponse({'message': 'found categories', 'categories': categories_data})

@login_required(login_url='/login/')
@require_GET
def get_categories_by_session(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    categories = Category.objects.filter(owner=artisan).values()
    print(categories)

    return JsonResponse({'categories': list(categories)})

@csrf_exempt
@require_GET
def get_gallery_images_by_product_id(request, product_id):
    product = Product.objects.get(id=product_id)

    product_images = ProductImage.objects.filter(product=product).values()

    return JsonResponse({'message': 'found product_images', 'product_images': list(product_images)})

@login_required(login_url='/login/')
@require_POST
def create_new_category(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    data = json.loads(request.body)
    
    Category.objects.create(owner=artisan, name=data['name'])
    return JsonResponse({'message': 'created category'})

@login_required(login_url='/login/')
@require_http_methods(['DELETE'])
def alter_category(request, id):
    if request.method == 'DELETE':
        artisan = request.user

        if not artisan.is_authenticated:
            return JsonResponse({'error': "Not authenticated"}, status=401)
                
        category_id = id
        print(f'Category ID: {category_id}')

        if not category_id:
            return JsonResponse({'error': "No category id provided"}, status=400)
        

        category = get_object_or_404(Category, id=category_id, owner=artisan)

        category.delete()
        return JsonResponse({'message': 'Category deleted successfully.'}, status=200)

@csrf_exempt
@require_GET
def get_theme_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    theme = get_object_or_404(Theme, artisan=artisan)

    theme_data = {
        'text_color': theme.text_color,
        'text_color_secondary': theme.text_color_secondary,
        'background_color': theme.background_color,
        'accent_color': theme.accent_color,
        'link_hover_color': theme.link_hover_color,
        'ttl': theme.ttl
    }

    return JsonResponse({'message': 'Found theme', 'theme': theme_data}, status=200)

@login_required(login_url='/login/')
@require_GET
def get_theme_by_session(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    theme, created = Theme.objects.get_or_create(artisan=artisan)

    theme_data = {
        'text_color': theme.text_color,
        'text_color_secondary': theme.text_color_secondary,
        'background_color': theme.background_color,
        'accent_color': theme.accent_color,
        'link_hover_color': theme.link_hover_color,
        'ttl': theme.ttl
    }

    message = 'Created Theme' if created else 'found theme'

    return JsonResponse({'message': message, 'theme': theme_data}, status=200)

@login_required(login_url='/login/')
@csrf_protect
@require_POST
def update_theme(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    theme, created = Theme.objects.get_or_create(artisan=artisan)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Invalid JSON"})
    
    # Validate fields exist
    required_fields = ['text_color', 'text_color_secondary', 'background_color', 'accent_color', 'link_hover_color']
    if not all(field in data for field in required_fields):
        return JsonResponse({'error': "Missing required field(s)"}, status=400)

    theme.text_color = data['text_color']
    theme.text_color_secondary = data['text_color_secondary']
    theme.background_color = data['background_color']
    theme.accent_color = data['accent_color']
    theme.link_hover_color = data['link_hover_color']

    theme.save()

    if created:
        return JsonResponse({'message': 'Created theme'}, status=200)
    return JsonResponse({'message': "updated theme"}, status=200)

@login_required(login_url='/login/')
@require_http_methods(['POST'])
def update_logo(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)
    
    # Check if a file was uploaded
    if 'logo' not in request.FILES:
        return JsonResponse({'error': "No logo file provided"}, status=400)
    
    uploaded_file = request.FILES['logo']
    
    # Optional: Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
    if uploaded_file.content_type not in allowed_types:
        return JsonResponse({'error': "Invalid file type. Please upload an image file."}, status=400)
    
    # Optional: Validate file size (e.g., max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if uploaded_file.size > max_size:
        return JsonResponse({'error': "File too large. Maximum size is 5MB."}, status=400)
    
    # Get or create LogoImage for this artisan
    logo_image, created = LogoImage.objects.get_or_create(artisan=artisan)

    # Delete the old image file if it exists
    if not created and logo_image.image:
        logo_image.image.delete(save=False)
    
    # Save the new image
    logo_image.image = uploaded_file
    logo_image.save()
    
    return JsonResponse({'message': "Logo updated successfully"}, status=200)

@login_required(login_url='/login/')
@require_POST
def update_hero(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    # Check if a file was uploaded
    if 'hero' not in request.FILES:
        return JsonResponse({'error': "No hero file provided"}, status=400)
    uploaded_file = request.FILES['hero']

    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
    if uploaded_file.content_type not in allowed_types:
        return JsonResponse({'error': "Invalid file type. Please upload an image file."}, status=400)
    
    # Optional: Validate file size
    max_size = 5 * 1024 * 1024 # 5MB
    max_in_mb = max_size // 1024 // 1024
    if uploaded_file.size > max_size:
        return JsonResponse({'error': f"File too large. Max size is {max_in_mb}MB"}, status=400)

    # Get or create a HeroImage for this artisan
    hero_image, created = HeroImage.objects.get_or_create(artisan=artisan)

    # Delete the old image file if it exists (only if we're updating, not creating)
    if not created and hero_image.image:
        hero_image.image.delete(save=False)

    # Save the new image
    hero_image.image = uploaded_file
    hero_image.save()

    return JsonResponse({'message': "Hero image updated successfully"}, status=200)

@csrf_exempt
@require_GET
def get_text_content_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)
    text_content = get_object_or_404(TextContent, artisan=artisan)

    text_content_data = {
        'hero_sentence_draw': text_content.hero_sentence_draw,
        'hero_header_draw': text_content.hero_header_draw,
        'gallery_subtext': text_content.gallery_subtext,
        'custom_order_prompt': text_content.custom_order_prompt,
        'project_description_placeholder': text_content.project_description_placeholder
    }

    return JsonResponse({'message': 'Found Text Content', 'text_content': text_content_data})

@login_required(login_url='/login/')
@require_GET
def get_text_content_by_session(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    text_content, created = TextContent.objects.get_or_create(artisan=artisan)

    message = 'created new text content' if created else 'found text content'

    # Convert model instance to dict so it can be JSON serialized
    text_content_data = model_to_dict(text_content)

    return JsonResponse({'message': message, 'text_content': text_content_data}, status=200)

@login_required(login_url='/login/')
@require_http_methods(['POST', 'OPTIONS'])
def update_text_content(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    text_content = get_object_or_404(TextContent, artisan=artisan)

    data = json.loads(request.body)
    new_sentence = data['sentence']
    new_header = data['header']
    new_gallery_subtext = data['gallery_subtext']
    new_custom_order_prompt = data['custom_order_prompt']
    new_project_description_placeholder = data['project_description_placeholder']

    text_content.hero_sentence_draw = new_sentence[:100]
    text_content.hero_header_draw = new_header[:100]
    text_content.gallery_subtext = new_gallery_subtext
    text_content.custom_order_prompt = new_custom_order_prompt
    text_content.project_description_placeholder = new_project_description_placeholder

    text_content.save()

    return JsonResponse({'message': "Updated Text Content"}, status=200)

@login_required(login_url='/login/')
@require_GET
def get_shop_settings_by_session(request):
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    shop_settings, created = ShopSettings.objects.get_or_create(artisan=artisan)

    shop_settings_data = model_to_dict(shop_settings)
    message = 'created new shop settings' if created else 'found shop settings'

    return JsonResponse({'message': message, 'shop_settings': shop_settings_data, 'slug': artisan.slug})

@require_GET
def get_shop_settings_by_slug(request, slug):
    artisan = get_object_or_404(Artisan, slug=slug)

    shop_settings = get_object_or_404(ShopSettings, artisan=artisan)

    shop_settings_data = model_to_dict(shop_settings)
    message = 'found shop settings'

    return JsonResponse({'message': message, 'shop_settings': shop_settings_data})

@login_required(login_url='/login/')
@require_POST
def update_shop_settings(request):
    """
    Updates the shop settings for the authenticated artisan.
    """
    artisan = request.user

    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    try:
        # Get the JSON data from the request body
        data = json.loads(request.body)
        
        # Get the shop settings and policies
        shop_settings = get_object_or_404(ShopSettings, artisan=artisan)
        policies, _ = Policies.objects.get_or_create(artisan=artisan)

        # Check if the shop name has changed
        old_shop_name = shop_settings.shop_name
        if (old_shop_name != data.get('shopName')):
            new_slug = generate_unique_slug(data.get('shopName'))
            artisan.slug = new_slug
            artisan.shop_name = data.get('shopName')
            artisan.save()
            

        # Update the model fields with the data from the JSON
        # It's crucial to map the JSON keys to your model fields
        shop_settings.shop_name = data.get('shopName', shop_settings.shop_name)
        shop_settings.shop_description = data.get('shopDescription', shop_settings.shop_description)
        shop_settings.accepting_custom_orders = data.get('acceptingCustomOrders', shop_settings.accepting_custom_orders)
        shop_settings.maximum_active_orders = data.get('maximumActiveOrders', shop_settings.maximum_active_orders)
        shop_settings.standard_processing_days = data.get('standardProcessingDays', shop_settings.standard_processing_days)
        shop_settings.shop_location = data.get('shopLocation', shop_settings.shop_location)
        shop_settings.currency = data.get('currency', shop_settings.currency)
        shop_settings.shop_status = data.get('shopStatus', shop_settings.shop_status)
        shop_settings.status_message = data.get('statusMessage', shop_settings.status_message)
        shop_settings.minimum_order_amount = data.get('minimumOrderAmount', shop_settings.minimum_order_amount)
        #  Update the policies too
        policies.terms_and_conditions = data.get('termsAndConditions', policies.terms_and_conditions)
        policies.shipping_policy = data.get('shippingPolicy', policies.shipping_policy)
        policies.return_policy = data.get('returnPolicy', policies.return_policy)

        # Save the changes to the database
        shop_settings.save()
        policies.save()

        return JsonResponse({'message': "Updated shop settings and policies"}, status=200)

    except json.JSONDecodeError:
        # Handle cases where the request body is not valid JSON
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except KeyError as e:
        # Handle cases where a required key is missing from the JSON
        return JsonResponse({'error': f'Missing key: {e}'}, status=400)
    except Exception as e:
        # Catch any other unexpected errors
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required(login_url='/login/')
@require_http_methods(['POST', 'GET'])
def policy(request):
    """
    Create, Get, and Update (don't delete) merchant terms and conditions.
    """
    artisan = request.user
    if not artisan.is_authenticated:
        return JsonResponse({'error': "Not authenticated"}, status=401)

    elif request.method == "GET":
        policies, created = Policies.objects.get_or_create(artisan=artisan)

        message = ''
        if created:
            message += "Created Policies"
        else:
            message += "Found Policies"

        policies_data = model_to_dict(policies)
        return JsonResponse({'message': message, "policies": policies_data}, status=200)
    
@require_GET
def policy_by_slug(_, slug):
    artisan = get_object_or_404(Artisan, slug=slug)

    print(artisan)

    # If artisan, load the policies
    policies, _ = Policies.objects.get_or_create(artisan=artisan)
    policies_data = model_to_dict(policies)

    print(policies_data)

    return JsonResponse({'message': "Found policies", "policies": policies_data}, status=200)

    
# Clear session data when user logs out 
@csrf_exempt
@require_http_methods(['DELETE'])
def session(request):
    logout(request)
    request.session.flush()  # Clears all session data
    return JsonResponse({'message': 'Session cleared'})

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': "CSRF cookie set"})