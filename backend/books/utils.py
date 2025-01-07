# books/utils.py
import requests
from django.conf import settings
from .models import Book

def fetch_google_book(google_books_id):
    url = f'https://www.googleapis.com/books/v1/volumes/{google_books_id}'
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        volume_info = data.get('volumeInfo', {})
        
        book_data = {
            'google_books_id': google_books_id,
            'title': volume_info.get('title', ''),
            'authors': volume_info.get('authors', []),
            'published_date': volume_info.get('publishedDate'),
            'description': volume_info.get('description', ''),
            'page_count': volume_info.get('pageCount'),
            'categories': volume_info.get('categories', []),
            'thumbnail_url': volume_info.get('imageLinks', {}).get('thumbnail', ''),
            'language': volume_info.get('language', '')
        }
        
        book, created = Book.objects.get_or_create(
            google_books_id=google_books_id,
            defaults=book_data
        )
        
        return book
    return None