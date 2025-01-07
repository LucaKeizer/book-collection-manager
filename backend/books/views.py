# books/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.shortcuts import get_object_or_404
from .models import Book, Shelf, UserBook, ReadingSession, Note, Review, Quote
from .serializers import (
    BookSerializer, ShelfSerializer, UserBookSerializer,
    ReadingSessionSerializer, NoteSerializer, ReviewSerializer,
    QuoteSerializer
)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'authors']

    @action(detail=False, methods=['get'])
    def search_google_books(self, request):
        query = request.query_params.get('q', '')
        max_results = int(request.query_params.get('max_results', 10))
        
        if not query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        books = GoogleBooksService.search_books(query, max_results)
        return Response(books)

    @action(detail=True, methods=['post'])
    def add_to_collection(self, request, pk=None):
        book = self.get_object()
        status = request.data.get('status', 'want_to_read')
        shelf_ids = request.data.get('shelf_ids', [])

        user_book = UserBook.objects.create(
            user=request.user,
            book=book,
            status=status
        )

        if shelf_ids:
            shelves = Shelf.objects.filter(
                id__in=shelf_ids,
                user=request.user
            )
            user_book.shelves.set(shelves)

        serializer = UserBookSerializer(user_book)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ShelfViewSet(viewsets.ModelViewSet):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(user=self.request.user)

    @action(detail=True)
    def books(self, request, pk=None):
        shelf = self.get_object()
        books = UserBook.objects.filter(shelves=shelf)
        serializer = UserBookSerializer(books, many=True)
        return Response(serializer.data)

class UserBookViewSet(viewsets.ModelViewSet):
    serializer_class = UserBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        user_book = self.get_object()
        current_page = request.data.get('current_page')
        
        if current_page is not None:
            user_book.current_page = current_page
            user_book.save()

            # Create reading session
            if request.data.get('create_session'):
                session_data = {
                    'user_book': user_book.id,
                    'start_page': request.data.get('start_page', user_book.current_page),
                    'end_page': current_page,
                    'start_time': request.data.get('start_time'),
                    'end_time': request.data.get('end_time'),
                    'notes': request.data.get('notes', '')
                }
                session_serializer = ReadingSessionSerializer(data=session_data)
                if session_serializer.is_valid():
                    session_serializer.save()

        serializer = self.get_serializer(user_book)
        return Response(serializer.data)

    @action(detail=False)
    def statistics(self, request):
        user_books = self.get_queryset()
        stats = {
            'total_books': user_books.count(),
            'books_by_status': user_books.values('status').annotate(count=Count('id')),
            'average_rating': user_books.exclude(rating=None).aggregate(Avg('rating')),
            'currently_reading': user_books.filter(status='reading').count()
        }
        return Response(stats)

class ReadingSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingSession.objects.filter(user_book__user=self.request.user)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user_book__user=self.request.user)

    def perform_create(self, serializer):
        user_book = get_object_or_404(
            UserBook,
            id=self.request.data.get('user_book'),
            user=self.request.user
        )
        serializer.save(user_book=user_book)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            # For list action, include public reviews from other users
            return Review.objects.filter(
                is_public=True
            ).select_related('user_book__user', 'user_book__book')
        # For other actions, only show user's own reviews
        return Review.objects.filter(user_book__user=self.request.user)

    def perform_create(self, serializer):
        user_book = get_object_or_404(
            UserBook,
            id=self.request.data.get('user_book'),
            user=self.request.user
        )
        serializer.save(user_book=user_book)

class QuoteViewSet(viewsets.ModelViewSet):
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quote.objects.filter(user_book__user=self.request.user)

    def perform_create(self, serializer):
        user_book = get_object_or_404(
            UserBook,
            id=self.request.data.get('user_book'),
            user=self.request.user
        )
        serializer.save(user_book=user_book)