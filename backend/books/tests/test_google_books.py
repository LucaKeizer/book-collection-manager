# backend/books/tests/test_google_books.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from unittest.mock import patch
from books.services import GoogleBooksService
from books.models import Book

class GoogleBooksTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.sample_book_data = {
            'id': 'abc123',
            'volumeInfo': {
                'title': 'Test Book',
                'authors': ['Test Author'],
                'publishedDate': '2023-01-01',
                'description': 'Test description',
                'pageCount': 200,
                'categories': ['Fiction'],
                'imageLinks': {
                    'thumbnail': 'http://example.com/thumb.jpg'
                },
                'language': 'en'
            }
        }

    @patch('books.services.requests.get')
    def test_search_books(self, mock_get):
        # Mock the API response
        mock_get.return_value.json.return_value = {
            'items': [self.sample_book_data]
        }
        mock_get.return_value.status_code = 200
        
        # Test the search endpoint
        response = self.client.get('/api/books/search_google_books/', {'q': 'test'})
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Book')

    @patch('books.services.requests.get')
    def test_get_book_by_id(self, mock_get):
        # Mock the API response
        mock_get.return_value.json.return_value = self.sample_book_data
        mock_get.return_value.status_code = 200
        
        # Test fetching a specific book
        book_data = GoogleBooksService.get_book_by_id('abc123')
        
        self.assertIsNotNone(book_data)
        self.assertEqual(book_data['title'], 'Test Book')
        self.assertEqual(book_data['authors'], ['Test Author'])

    def test_missing_search_query(self):
        # Test search endpoint without query parameter
        response = self.client.get('/api/books/search_google_books/')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    @patch('books.services.requests.get')
    def test_create_book_from_google_data(self, mock_get):
        # Mock the API response
        mock_get.return_value.json.return_value = self.sample_book_data
        mock_get.return_value.status_code = 200
        
        # Fetch and create book
        book_data = GoogleBooksService.get_book_by_id('abc123')
        book = GoogleBooksService.create_or_update_book(book_data)
        
        self.assertIsNotNone(book)
        self.assertEqual(book.title, 'Test Book')
        self.assertEqual(book.authors, ['Test Author'])
        self.assertEqual(book.google_books_id, 'abc123')