# backend/books/services.py
import os
import requests
from typing import Dict, List, Optional
from django.conf import settings
from .models import Book

class GoogleBooksService:
    BASE_URL = 'https://www.googleapis.com/books/v1'
    
    @staticmethod
    def search_books(query: str, max_results: int = 10) -> List[Dict]:
        """
        Search books using the Google Books API.
        Returns a list of book data dictionaries.
        """
        try:
            params = {
                'q': query,
                'maxResults': max_results,
                'key': os.getenv('GOOGLE_BOOKS_API_KEY')
            }
            
            response = requests.get(f'{GoogleBooksService.BASE_URL}/volumes', params=params)
            response.raise_for_status()
            
            books = []
            items = response.json().get('items', [])
            
            for item in items:
                book_data = GoogleBooksService._parse_book_data(item)
                if book_data:
                    books.append(book_data)
            
            return books
        
        except requests.RequestException as e:
            print(f"Error searching books: {e}")
            return []

    @staticmethod
    def get_book_by_id(google_books_id: str) -> Optional[Dict]:
        """
        Fetch a specific book by its Google Books ID.
        Returns book data dictionary if found, None otherwise.
        """
        try:
            response = requests.get(
                f'{GoogleBooksService.BASE_URL}/volumes/{google_books_id}',
                params={'key': os.getenv('GOOGLE_BOOKS_API_KEY')}
            )
            response.raise_for_status()
            
            return GoogleBooksService._parse_book_data(response.json())
            
        except requests.RequestException as e:
            print(f"Error fetching book {google_books_id}: {e}")
            return None

    @staticmethod
    def _parse_book_data(item: Dict) -> Optional[Dict]:
        """
        Parse the raw Google Books API response into our application's format.
        """
        try:
            volume_info = item.get('volumeInfo', {})
            
            # Extract relevant data
            book_data = {
                'google_books_id': item.get('id'),
                'title': volume_info.get('title', ''),
                'authors': volume_info.get('authors', []),
                'published_date': volume_info.get('publishedDate'),
                'description': volume_info.get('description', ''),
                'page_count': volume_info.get('pageCount'),
                'categories': volume_info.get('categories', []),
                'language': volume_info.get('language', ''),
            }
            
            # Handle thumbnail URL
            image_links = volume_info.get('imageLinks', {})
            book_data['thumbnail_url'] = (
                image_links.get('thumbnail') or 
                image_links.get('smallThumbnail', '')
            )
            
            return book_data
            
        except Exception as e:
            print(f"Error parsing book data: {e}")
            return None

    @staticmethod
    def create_or_update_book(book_data: Dict) -> Optional[Book]:
        """
        Create or update a book in our database from Google Books data.
        Returns the Book instance if successful, None otherwise.
        """
        try:
            book, created = Book.objects.update_or_create(
                google_books_id=book_data['google_books_id'],
                defaults=book_data
            )
            return book
            
        except Exception as e:
            print(f"Error creating/updating book: {e}")
            return None