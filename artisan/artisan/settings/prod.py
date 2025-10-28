from .base import *

DEBUG = env('DEBUG', default=False)

ALLOWED_HOSTS = [
    'dixie.gallery',
    'www.dixie.gallery',
]

# CORS for production frontend
CORS_ALLOWED_ORIGINS = [
    "https://dixie.gallery",
    "https://www.dixie.gallery"
]

# Security settings (already enabled in base, but can explicitly override)
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

CSRF_TRUSTED_ORIGINS = [
    "https://dixie.gallery",
    "https://www.dixie.gallery"
]
