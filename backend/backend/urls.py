from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as auth_views
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if User.objects.filter(username=username).exists():
            return Response({'username': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'email': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Create token properly
        token = Token.objects.create(user=user)
        
        # Return token with success message
        return Response({
            'message': 'Registration successful',
            'token': token.key
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Registration error: {str(e)}")  # Debug print
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'No account found with this email'}, status=status.HTTP_404_NOT_FOUND)
    
    if not user.check_password(password):
        return Response({'message': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('books.urls')),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/login/', login),
    path('api/auth/register/', register),
]