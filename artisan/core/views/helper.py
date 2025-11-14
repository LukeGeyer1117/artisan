from django.utils.text import slugify
from ..models import Artisan
from datetime import datetime, timedelta

# For PHP
import requests
import json


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

############### Not Django Views, Just Helper funcs!!!!! ################################

# Create a product on Troute
def call_php_create_product(login, secret, name, description, price):
    url = "http://127.0.0.1:8001/createproduct.php"
    data = {
        "x_login": login,
        "x_merchant_key": secret,
        "x_product_name": name,
        "x_product_description": description,
        "x_product_price": price,
    }
    resp = requests.post(url, data=data)
    return resp.text

# Edit an existing Troute product
def call_php_edit_product(login, secret, uniqueID, name, description, price):
    url = "http://127.0.0.1:8001/editproduct.php"
    data = {
        "x_login": login,
        "x_merchant_key": secret,
        "x_product_uniqueID": uniqueID,
        "x_product_name": name,
        "x_product_description": description,
        "x_product_price": price
    }
    print(data)

    resp = requests.post(url, data=data)
    return resp.text

# Delete a Troute product
def call_php_delete_product(login, secret, unique_id):
    url = "http://127.0.0.1:8001/deleteproduct.php"
    data = {
        "x_login": login,
        "x_merchant_key": secret,
        "uniqueID": unique_id
    }
    resp = requests.post(url, data=data)
    return resp.text

# Get a Troute product
def call_php_get_product(login, secret, unique_id):
    url='http://127.0.0.1:8001/getproduct.php'
    data = {
        "x_login": login,
        "x_merchant_key": secret,
        "uniqueID": unique_id
    }
    resp = requests.post(url, data=data)
    return resp.text

# Clean up the response from Troute for use in views
def sanitize_troute_resp(resp_string):
    # Sanitize the output
    resp_string = resp_string.strip()
    json_start = resp_string.find('{')
    if json_start == -1:
        raise ValueError("No JSON found in resonse")
    json_str = resp_string[json_start:]
    parsed = json.loads(json_str)
    return parsed

# Convert days ago into datetime
def days_to_datetime(days: int):
    return datetime.now() - timedelta(days=days)

# Validate file type is allowed
def validate_image_type(uploaded_file):
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
    return False if uploaded_file.content_type not in allowed_types else True

# Make sure file is <5MB
def validate_file_size(uploaded_file, max_mb=5):
    max_size = max_mb * 1024**2
    return False if uploaded_file.size > max_size else True