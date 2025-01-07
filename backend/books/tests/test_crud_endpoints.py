# backend/books/tests/test_crud_endpoints.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from books.models import Book, Shelf

class BookEndpointsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test book
        self.book_data = {
            "google_books_id": "test123",
            "title": "Test Book",
            "authors": ["Test Author"],
            "published_date": "2023-01-01",
            "description": "Test description",
            "page_count": 200,
            "categories": ["Fiction"],
            "thumbnail_url": "http://example.com/thumb.jpg",
            "language": "en"
        }
        
    def test_create_book(self):
        response = self.client.post('/api/books/', self.book_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.count(), 1)
        self.assertEqual(Book.objects.get().title, 'Test Book')
        
    def test_list_books(self):
        # Create a book first
        Book.objects.create(**self.book_data)
        
        response = self.client.get('/api/books/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_get_book(self):
        book = Book.objects.create(**self.book_data)
        response = self.client.get(f'/api/books/{book.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Book')
        
    def test_update_book(self):
        book = Book.objects.create(**self.book_data)
        updated_data = self.book_data.copy()
        updated_data['title'] = 'Updated Book Title'
        
        response = self.client.put(f'/api/books/{book.id}/', updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Book.objects.get(id=book.id).title, 'Updated Book Title')
        
    def test_delete_book(self):
        book = Book.objects.create(**self.book_data)
        response = self.client.delete(f'/api/books/{book.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Book.objects.count(), 0)

class ShelfEndpointsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.shelf_data = {
            "name": "Test Shelf",
            "is_default": False
        }
        
    def test_create_shelf(self):
        response = self.client.post('/api/shelves/', self.shelf_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Shelf.objects.count(), 1)
        self.assertEqual(Shelf.objects.get().name, 'Test Shelf')
        
    def test_list_shelves(self):
        # Create a shelf first
        Shelf.objects.create(user=self.user, **self.shelf_data)
        
        response = self.client.get('/api/shelves/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_get_shelf(self):
        shelf = Shelf.objects.create(user=self.user, **self.shelf_data)
        response = self.client.get(f'/api/shelves/{shelf.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Shelf')
        
    def test_update_shelf(self):
        shelf = Shelf.objects.create(user=self.user, **self.shelf_data)
        updated_data = self.shelf_data.copy()
        updated_data['name'] = 'Updated Shelf Name'
        
        response = self.client.put(f'/api/shelves/{shelf.id}/', updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Shelf.objects.get(id=shelf.id).name, 'Updated Shelf Name')
        
    def test_delete_shelf(self):
        shelf = Shelf.objects.create(user=self.user, **self.shelf_data)
        response = self.client.delete(f'/api/shelves/{shelf.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Shelf.objects.count(), 0)
        
    def test_shelf_user_isolation(self):
        # Create another user and their shelf
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        Shelf.objects.create(user=other_user, name="Other User's Shelf")
        
        # Verify the first user can't see the other user's shelf
        response = self.client.get('/api/shelves/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)