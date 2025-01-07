from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as auth_views  # Rename this import

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('books.urls')),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/login/', auth_views.obtain_auth_token),  # Use renamed import
]