from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
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
            product_specialty = data['product_specialty'],
            price_range_low = data['price_range_low'],
            price_range_high = data['price_range_high'],
            accepting_custom_orders = data['accepting_custom_orders'],
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