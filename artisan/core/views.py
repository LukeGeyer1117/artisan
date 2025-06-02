from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
import json
from .models import Artisan, Inventory, Product, Order, OrderItems

# Create your views here.
def home(request):
    return HttpResponse("Welcome to Artisan");

@csrf_exempt
def create_artisan(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        artisan = Artisan.objects.create(
            email = data['email'],
            username = data['username'],
            password = data['password'], #Might hash this
            shop_name = data['shop_name'],
            product_specialty = data.get('product_specialty', ''),
            price_range_low = data.get('price_range_low', 0),
            price_range_high = data.get('price_range_high', 0),
            accepting_custom_orders = data.get('accepting_custom_orders', False),
        )
        return JsonResponse({'message': 'Artisan created', 'id': artisan.id}, status=201)
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

@csrf_exempt
def login_artisan(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            e = data.get('email')
            password = data.get('password')

            print(e, password)

            try:
                artisan = Artisan.objects.get(email=e)
                print(artisan)
            except Artisan.DoesNotExist:
                return JsonResponse({'error': 'No Artisan Found'}, status=404)
            
            if check_password(password, artisan.password):
                request.session['artisan_id'] = artisan.id  # Django session
                return JsonResponse({'message': 'Login successful', 'artisan_id': artisan.id})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def create_product(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            inventory_id = data.get('inventory_id')

            # Fetch the Inventory record
            inventory = Inventory.objects.get(id=inventory_id)

            # Create the product linked to that inventory
            product = Product.objects.create(
                inventory = inventory,
                name = data['name'],
                price = data['price'],
                order_type = data['order_type']
            )

            return JsonResponse({'message': 'Product created', 'id': product.id}, status=201)
        
        except Inventory.DoesNotExist:
            return JsonResponse({'error': 'Artisan not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid method'}, status=405)

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
        print(products)
        return JsonResponse(list(products), safe=False)
    
    else:
        return JsonResponse({'error': "Method not allowed"}, status=405)
