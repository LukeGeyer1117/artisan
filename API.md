# API Endpoints — Session, Artisan, and Inventory

This document describes the API endpoints defined in the provided Django views.

---

## 1. Clear Session

**Endpoint:**
`DELETE /session/`

**Description:**
Clears all session data for the current user. Used when the user logs out.

**Request:**
- **Method:** `DELETE`
- **Authentication:** Not Required
- **Body:** None

**Response:**
```json
{
  "message": "Session Cleared"
}
```

## 2. Create Artisan

**Endpoint:**
`POST /artisan/`

**Description:**
Creates an Artisan object and core associated objects based on user input at signup.
Creates the following: Artisan, Inventory, Theme, LogoImage, HeroImage

**Request:**
- **Method:** `POST`
- **Authentication** Not Required
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johnnyboy123",
  "phone": "5551234567",
  "password": "secretkey",
  "shop_name": "John's Doughs",
  "product_specialty": "Artisan Bread",
  "price_range_low": 50,
  "price_range_high": 100,
  "accepting_custom_orders": true
}
```
The Fields `product_specialty`, `price_range_low`, `price_range_high`, and `accepting_custom_orders` are optional.

**Response:**
```json
{
  "message": "Artisan created",
  "id": 1
}
```

## 3. Get Artisan

**Endpoint:**
`GET /artisan/`

**Description:**
Use Session Info to easily get Artisan Info. Secured by session.

**Request**:
- **Method:** `GET`
- **Authentication:** Required
- **Body:** None

**Response (Success):**
```json
{
  "message": "Artisan found!",
  "artisan": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phone_number": "1234567890",
    "shop_name": "Doe's Woodworks",
    "slug": "does-woodworks",
    "product_specialty": "Wood carving",
    "price_range_low": 50,
    "price_range_high": 200,
    "accepting_custom_orders": true
  }
}
```

**Response (No artisan logged in):**
```json
{
  "error": "No Artisan logged in!
}
```

**Response (No artisan found):**
```json
{
  "error": "No Artisan Found!"
}
```

## 4. Create an Inventory

**Endpoint:**
`POST /inventories/`

**Description:**
Used to create an inventory for the given artisan_id

**Request:**
- **Method:** `POST`
- **Authentication:** Not Required
- **Body:**
```json
{
  "artisan_id": 1
}
```

**Response:**
```json
{
  "message": "Inventory created",
  "id": 1
}
```

## 5. Create an Order

**Endpoint:**
`POST /order/`

**Description:**
Allows the user to create an order with products based on their shopping cart.

**Request:**
- **Method:** `POST`
- **Authentication:** Not Required
- **Body:**
```json
{
  "full_name": "Peter Griffin",
  "email": "peter@mail.com",
  "phone": "1234567111",
  "shipping_addr": "123 Griffin St.",
  "city": "Springville",
  "state": "IL",
  "zip_code": "84848",
  "slug": "johns-doughs",
  "total_price": 1234.56
}
```

**Response (Success):**
```json
{
  "message": "Order Created",
  "order": 2,
  "order-items": 6
}
```

## 6. Update Order status

**Endpoint:**
`POST /order/status/`

**Description:**
Allows the authenticated user to change the status of an order in their account.

**Request:**
- **Method:** `POST'
- **Authentication:** Required
- **Body:**
```json
{
  "order_id": 4,
  "status": "inactive"
}
```

**Response:**
```json
{
  "message": "Updated order status"
}
```

## 7. Restock an Order's Items

**Endpoint:**
`POST /order/restock/`

**Description:**
When an order is denied, add the products on it back to inventory.

**Request:**
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "order_id": 1
}
```

**Response:**
```json
{
  "message": "Restocked items"
}
```

## 8. Change Status of a Custom Request

**Endpoint:**  
`POST /custom/status/`

**Description:**  
Updates the status of a specific custom request.

**Request:**  
- **Method:** `POST`  
- **Authentication:** Required  
- **Body:**  
```json
{
  "request_id": 1,
  "status": "approved"
}
```

**Response:**
```json
{
  "message": "Updated order status"
}
```

## 9. Get Orders per Artisan

**Endpoint:**
`GET /orders/`

**Description:**
Get all of the orders assigned to an Artisan, ordered by create_date.

**Request:**
- **Method:** `GET`
- **Authentication:** Required
- **Body:** None

**Response:**
```
{
  "message": "Retrieved Orders",
  "orders": [
    {
      "id": 1,
      "customer_name": "Jane Doe",
      "customer_email": "example@mail.com",
      "customer_phone": "1234567891"
      "shipping_addr": "123 Test St.",
      "city": "Testville",
      "state": "TX",
      "zip_code": "28372",
      "status": "pending",
      "created_at": "2024-12-17 11:14",
      "total_price": 49.23
    }
  ]
}
```

## 10. Get Active Orders per Artisan

**Endpoint:**
`GET /orders/active/`

**Description:**
Get all of the active orders assigned to an Artisan, ordered by create_date.

**Request:**
- **Method:** `GET`
- **Authentication:** Required
- **Body:** None

**Response:**
```
{
  "message": "Retrieved Orders",
  "orders": [
    {
      "id": 1,
      "customer_name": "Jane Doe",
      "customer_email": "example@mail.com",
      "customer_phone": "1234567891"
      "shipping_addr": "123 Test St.",
      "city": "Testville",
      "state": "TX",
      "zip_code": "28372",
      "status": "pending",
      "created_at": "2024-12-17 11:14",
      "total_price": 49.23
    }
  ]
}
```

## 11. Get Inactive Orders per Artisan

**Endpoint:**
`GET /orders/inactive/`

**Description:**
Get all of the inactive orders assigned to an Artisan, ordered by create_date.

**Request:**
- **Method:** `GET`
- **Authentication:** Required
- **Body:** None

**Response:**
```
{
  "message": "Retrieved Orders",
  "orders": [
    {
      "id": 1,
      "customer_name": "Jane Doe",
      "customer_email": "example@mail.com",
      "customer_phone": "1234567891"
      "shipping_addr": "123 Test St.",
      "city": "Testville",
      "state": "TX",
      "zip_code": "28372",
      "status": "pending",
      "created_at": "2024-12-17 11:14",
      "total_price": 49.23
    }
  ]
}
```

## 12. Get the items associated with an order

**Endpoint:**
`POST /orderitems/`

**Description:**
Get all the OrderItems object associated with an Order

**Request:**
- **Method:** `GET`
- **Authentication: Not Required
- **Body:**
```json
{
  "order_id": 1
}
```

**Response:**
```json
{
  "message": "Found Order Items",
  "orderItems": [
    {
      "order": order_item,
      "product": product_item,
      "quantity": 5
    }
  ]
}
```

## 13. Log in Artisan

**Endpoint:**
`POST /login/`

**Description:**
Uses provided email and password to verify a user before logging them in and creating session data. Checks the password against the hashed stored password.

**Request:**
- **Method:** `POST`
- **Authentication:** Not Required
- **Body:**
```json
{
  "email": "123@mail.com",
  "password": "secretkey"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "artisan_id": 3
}
```

## 14. Create a Product

**Endpoint:**
`POST /product/`

**Description:**
Create a new Product and tie it to the merchant's Inventory object.

**Request:**
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "name": "product_name",
  "price": 23.23,
  "quantity": 43,
  "description": "amazing product description",
  "image": image_file
}
```

**Response:**
```json
{
  "message": "Product created",
  "id": 3
}
```

## 15. Update a Product

## 16. Delete a Product

## 17. Get a Product

## 18. Set a Product Category

## 19. Get an Inventory
