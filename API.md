# API endpoints. To be found in `artisan/urls.py`

All of the urlpaths below extend a base API url. During localhosting, these extend the path `127.0.0.1:8000/<API_PATH_HERE>`
Following each URL path is the view it calls. To be found in `core/views.py`

**All Site URLS ending in /<slug: slug> require an actual merchant slug to show relevant data.**

## Site URLS
### Utility
- `'admin/', admin.site.urls` - Links to the Django project backend
### Customer
- `'home/', views.home` - The base home template site
- `'home/<slug:slug>/', views.home` - The home page for a specific merchant
- `'gallery/<slug:slug>/', views.gallery` - The gallery for a specific merchant
- `'shop/<slug:slug>/', views.shop` - The shop for a specific merchant
- `'cart/<slug:slug>/', views.cart` - The cart for the customer, still include the slug
- `'checkout/<slug:slug>/', views.checkout` - The checkout page for a customer, also include the slug
- `'custom/<slug:slug>/', views.custom` - The custom request form for a merchant
- `'order-complete/<slug:slug>/', views.order_complete` - The success page for after checkout (merchant side)
### Merchant
- `'login/', views.login_view` - The merchant login page
- `'dashboard/', views.dashboard_view` - The merchant's main dashboard
- `'inventory/', views.inventory_view` - The merchant's inventory page
- `'orders/', views.orders_view` - The merchant's orders page
- `'custom-orders/', views.custom_orders_view` - The merchant's custom orders page
- `'reporting/', views.reporting_view` - The merchant's reporting page
- `'gallery/', views.gallery_view` - The merchant's gallery editing page
- `'settings/', views.settings_view` - The merchant's settings page
- `'add-item/', views.new_item_view` - The merchant's add-item form page

## API URLS
 - `'api/artisan/', views.artisan` - Create (POST) and retrieve (GET) artisan information
 - `'api/inventories/', views.create_inventory` - Create an inventory (POST) automatically for new merchant
 - `'api/inventory/', views.get_inventory` - Retrieve (GET) an inventory
 - `'api/<slug:slug>/products/', views.get_products_by_artisan_slug` - Retrieves proucts (GET) per artisan slug
 - `'api/product/', views.product` - Create (POST), update (PATCH) or delete (DELETE) products
 - `'api/product/<str:product_id>/', views.get_product` - Retreive (GET) a product, requires product_id
 - `'api/products/', views.get_all_products` - Retreive (GET) all products
 - `'api/login/', views.login_artisan` - Uses form data (POST) to create session data for an artisan. Logs in.
 - `'api/cart/', views.add_product_to_cart` - (POST) Add items to cart, or (GET) retreive items from cart, or (PUT) to update item quantities in cart, or (DELETE) remove items from cart
 - `'api/checkout/', views.api_checkout` - (POST) to create a checkout, and (GET) to retreive a checkout total
 - `'api/process_payment/', views.process_payment` - (POST) to create a payment process request, listen for response
 - `'api/order/', views.order` - (POST) to create a new order
 - `'api/order/status/', views.update_order_status` - (POST) use order_id and new 'status' to change the status of the order in db
 - `'api/orders/', views.orders` - (GET) all orders per artisan_id
 - `'api/orders/active/', views.active_orders` - (GET) only active orders (pending, approved, in progress) per artisan_id
 - `'api/orderitems/', views.order_items` - (POST) use order_id to get all order items on an order
 - `'api/custom/', views.get_custom_order` - (GET) custom requests associated with an artisan_id
 - `'api/session/', views.session)` - (DELETE) to remove session data (used when logging out)
