# books/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'books', views.BookViewSet)
router.register(r'shelves', views.ShelfViewSet, basename='shelf')
router.register(r'userbooks', views.UserBookViewSet, basename='userbook')
router.register(r'reading-sessions', views.ReadingSessionViewSet, basename='readingsession')
router.register(r'notes', views.NoteViewSet, basename='note')
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'quotes', views.QuoteViewSet, basename='quote')

urlpatterns = [
    path('', include(router.urls)),
]