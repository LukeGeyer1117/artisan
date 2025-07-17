from django.db import models
from django.contrib.auth.hashers import make_password


class Artisan(models.Model):
    email = models.CharField(max_length=100)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=128)
    shop_name = models.CharField(max_length=100)
    slug = models.CharField(max_length=100, default=False)
    product_specialty = models.CharField(max_length=50, blank=True)
    price_range_low = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True)
    price_range_high = models.DecimalField(max_digits=10, decimal_places=2, default=100, blank=True)
    accepting_custom_orders = models.BooleanField(default=False)
    image = models.ImageField(upload_to="images/", default='')

    def save(self, *args, **kwargs):
        # Hash password if it's being set or changed
        if not self.pk or Artisan.objects.get(pk=self.pk).password != self.password:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.shop_name
    
class Inventory(models.Model):
    artisan = models.OneToOneField(Artisan, on_delete=models.CASCADE, related_name="inventory")

    def __str__(self):
        return f"{self.artisan.shop_name}'s Inventory"
    
class Product(models.Model):
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order_type = models.CharField(max_length=20, blank=True)
    product_category = models.ForeignKey('ProductCategory', null=True, blank=True, default=None, on_delete=models.SET_NULL)
    quantity = models.DecimalField(max_digits=7, decimal_places=0, default=0, blank=True)
    description = models.CharField(max_length=500, default='', blank=True)
    image = models.ImageField(upload_to="images/", default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Order(models.Model):
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField(max_length=100)
    customer_phone = models.CharField(max_length=12)
    shipping_addr = models.CharField(max_length=150, default='', blank=False)
    city = models.CharField(max_length=40, default='', blank=False)
    state = models.CharField(max_length=2, default='', blank=False)
    zip_code = models.CharField(max_length=10, default='', blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('denied', 'Denied'),
            ('in_progress', 'In_Progress'),
            ('completed', 'Completed')
        ],
        default='pending'
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.total_price} - {self.customer_name} - {self.customer_email} - {self.customer_phone} - {self.created_at}"
    
class CustomRequest(models.Model):
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField(max_length=100)
    customer_phone = models.CharField(max_length=12)
    budget = models.DecimalField(max_digits=9, decimal_places=2)
    description = models.CharField(max_length=1500)
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('denied', 'Denied'),
            ('in_progress', 'In_Progress'),
            ('completed', 'Completed')
        ],
        default='pending'
    )

    def __str__(self):
        return f'{self.customer_name} - ${self.budget} - {self.description[:25]}'

class OrderItems(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=5, decimal_places=0, default=0, blank=False)

    def __str__(self):
        return f"Product: {self.product.id} - Order: {self.order.id} - Quantity: {self.quantity}"
    
class ProductCategory(models.Model):
    owner = models.ForeignKey(Artisan, on_delete=models.CASCADE)
    name = models.CharField(max_length=40, default='product', blank=False)

    def __str__(self):
        return f"{self.name} - (Owner: {self.owner})"