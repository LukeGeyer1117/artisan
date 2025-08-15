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