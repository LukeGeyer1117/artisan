from django.utils.text import slugify
from ..models import Artisan

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