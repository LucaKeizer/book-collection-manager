from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, ShelfViewSet, UserBookViewSet, ReadingSessionViewSet, NoteViewSet, ReviewViewSet, QuoteViewSet  # Change this import

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'shelves', ShelfViewSet, basename='shelf')
router.register(r'userbooks', UserBookViewSet, basename='userbook')
router.register(r'reading-sessions', ReadingSessionViewSet, basename='readingsession')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'quotes', QuoteViewSet, basename='quote')

urlpatterns = [
    path('', include(router.urls)),
]