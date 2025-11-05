from django.db import models
from django.contrib.auth.hashers import make_password

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, AbstractUser

class ArtisanManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


from django.db import models
from django.contrib.auth.models import AbstractUser

class Artisan(AbstractUser):
    # Core info for HiveMade
    full_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True)   # unique for login
    username = models.CharField(max_length=50, blank=True)
    contact_email = models.CharField(max_length=100, blank=True, null=True, default="")
    shop_name = models.CharField(max_length=100)
    slug = models.CharField(max_length=100, default=False)
    product_specialty = models.CharField(max_length=50, blank=True)
    price_range_low = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True)
    price_range_high = models.DecimalField(max_digits=10, decimal_places=2, default=100, blank=True)
    accepting_custom_orders = models.BooleanField(default=False)
    image = models.ImageField(upload_to="pfps/", default="")

    # Troute Necessities
    troute_login = models.CharField(max_length=100, blank=True, null=True)
    troute_key = models.CharField(max_length=200, blank=True, null=True)

    # Merchant / Company Info
    company_name = models.CharField(max_length=150, blank=True, null=True)
    address_line1 = models.CharField(max_length=100, blank=True, null=True)
    address_line2 = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    fax = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(max_length=200, blank=True, null=True)

    # Billing Info
    billing_bank_name = models.CharField(max_length=150, blank=True, null=True)
    billing_routing_number = models.CharField(max_length=20, blank=True, null=True)
    billing_account_number = models.CharField(max_length=30, blank=True, null=True)
    billing_phone = models.CharField(max_length=20, blank=True, null=True)
    billing_country = models.CharField(max_length=50, blank=True, null=True)
    billing_zip = models.CharField(max_length=20, blank=True, null=True)
    billing_state = models.CharField(max_length=50, blank=True, null=True)
    billing_city = models.CharField(max_length=50, blank=True, null=True)
    billing_address1 = models.CharField(max_length=100, blank=True, null=True)
    billing_address2 = models.CharField(max_length=100, blank=True, null=True)
    billing_notes = models.TextField(blank=True, null=True)

    # Contact Info
    contact_first_name = models.CharField(max_length=50, blank=True, null=True)
    contact_last_name = models.CharField(max_length=50, blank=True, null=True)

    # Merchant Settings
    merchant_fields = models.CharField(max_length=255, blank=True, null=True)  # e.g. "CustomField1/CustomField2"
    default_surcharge = models.CharField(max_length=20, blank=True, null=True)
    surcharge_flat = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    surcharge_percent = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    # Social Media Links
    facebook_link = models.URLField(max_length=200, blank=True, null=True)
    instagram_link = models.URLField(max_length=200, blank=True, null=True)
    youtube_link = models.URLField(max_length=200, blank=True, null=True)

    # Required for custom user model
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["shop_name"]

    def __str__(self):
        return self.shop_name


    
class Inventory(models.Model):
    artisan = models.OneToOneField(Artisan, on_delete=models.CASCADE, related_name="inventory")

    def __str__(self):
        return f"{self.artisan.shop_name}'s Inventory"
    
class Product(models.Model):
    # Link to inventory
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name="products")

    # Core Info
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order_type = models.CharField(max_length=20, blank=True)
    category = models.ForeignKey('Category', null=True, blank=True, default=None, on_delete=models.SET_NULL)
    quantity = models.DecimalField(max_digits=7, decimal_places=0, default=0, blank=True)
    description = models.CharField(max_length=1000, default='', blank=True)
    image = models.ImageField(upload_to="images/", default='')
    created_at = models.DateTimeField(auto_now_add=True)

    # Other fields
    is_featured = models.BooleanField(default=False)

    # Troute Unique Identifier
    troute_unique_id = models.PositiveIntegerField(null=True, blank=True, unique=True)

    def __str__(self):
        return f'{self.inventory.artisan} - {self.name} - {self.price}'
    
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
    
class Category(models.Model):
    owner = models.ForeignKey(Artisan, on_delete=models.CASCADE)
    name = models.CharField(max_length=40, default='product', blank=False)

    def __str__(self):
        return f"{self.name} - (Owner: {self.owner})"
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product/')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['product', 'order']

    def __str__(self):
        return f"Product Image for {self.product.name} - Order {self.order}"
    
    def save(self, *args, **kwargs):
        if not self.order:
            # Auto assign order if not provided
            last_image = ProductImage.objects.filter(product = self.product).order_by('-order').first()
            self.order = (last_image.order + 1) if last_image else 0
        super().save(*args, **kwargs)
    
class GalleryImage(models.Model):
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to=f'gallery/')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['artisan', 'order'] # Ensure unique order per merchant

    def __str__(self):
        return f"Gallery Image {self.id} - Order {self.order}"
    
    def save(self, *args, **kwargs):
        if not self.order:
            # Auto-assign order if not provided
            last_image = GalleryImage.objects.filter(artisan=self.artisan).order_by('-order').first()
            self.order = (last_image.order + 1) if last_image else 0
        super().save(*args, **kwargs)

class LogoImage(models.Model):
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE, related_name='logo_images')
    image = models.ImageField(upload_to='logos/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Logo Image {self.id} - artisan - {self.artisan.username}"
    
class HeroImage(models.Model):
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE, related_name='hero_images')
    image = models.ImageField(upload_to='heros/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hero Image {self.id} - artisan - {self.artisan.username}"
    
class Theme(models.Model):
    artisan = models.OneToOneField("Artisan", on_delete=models.CASCADE)

    # Basic colors
    text_color = models.CharField(max_length=7, default="#ffffff") #default to white text
    text_color_secondary = models.CharField(max_length=7, default="#ffffff") # Default to white secondary text
    background_color = models.CharField(max_length=7, default="#000000") # default black background
    accent_color = models.CharField(max_length=7, default="#007bff")
    link_hover_color = models.CharField(max_length=7, default="#007bff")

    def __str__(self):
        return f'{self.artisan.slug}'
    
class TextContent(models.Model):
    artisan = models.OneToOneField("Artisan", on_delete=models.CASCADE)

    # Hero Text
    hero_sentence_draw = models.CharField(max_length=100)
    hero_header_draw = models.CharField(max_length=100)

    # New Fields
    gallery_subtext = models.CharField(max_length=100, blank=True)
    custom_order_prompt = models.TextField(blank=True)
    project_description_placeholder = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return f'{self.artisan.slug} - text content'

    
class ShopSettings(models.Model):
    artisan = models.OneToOneField("Artisan", on_delete=models.CASCADE)

    # Shop settings
    shop_name = models.CharField(max_length=50, default="shop")
    shop_description = models.CharField(max_length=1000, default='')
    accepting_custom_orders = models.BooleanField(default=False)
    
    # Changed to IntegerField for whole numbers
    maximum_active_orders = models.IntegerField(default=1000)
    standard_processing_days = models.IntegerField(default=10)
    
    # Changed default to an empty string
    shop_location = models.CharField(max_length=100, default='')
    
    # Added a default value
    currency = models.CharField(
        max_length=3,
        choices=[
            ('usd', 'USD'),
            ('cad', 'CAD')
        ],
        default='usd'
    )
    
    # Added a default value
    shop_status = models.CharField(
        max_length=30,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('vacation', 'Vacation'),
            ('construction', 'Construction')
        ],
        default='active'
    )
    
    status_message = models.CharField(max_length=250, default='')
    
    # Removed max_length, set max_digits instead
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.artisan.username}'s Shop Settings"
    
class Policies(models.Model):
    artisan = models.OneToOneField("Artisan", on_delete=models.CASCADE)

    # Policies to be stored
    terms_and_conditions = models.CharField(max_length=1000, default='')
    shipping_policy = models.CharField(max_length=500, default='')
    return_policy = models.CharField(max_length=500, default='')

    def __str__(self):
        return f"{self.artisan.username}'s Policies"