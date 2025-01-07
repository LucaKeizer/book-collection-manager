# test_api.py
import requests
import json
from datetime import datetime, timedelta

BASE_URL = 'http://localhost:8000/api'

def print_response(response):
    print(f"Status Code: {response.status_code}")
    print("Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print("-" * 80)

# Create a test user
def create_test_user():
    from django.contrib.auth.models import User
    User.objects.create_user('testuser', 'test@example.com', 'testpassword')

# Test authentication
def test_auth():
    print("\nTesting Authentication...")
    session = requests.Session()
    
    # First get the CSRF token
    session.get('http://localhost:8000/api-auth/login/')
    
    # Include basic auth headers
    session.auth = ('testuser', 'testpassword')
    
    return session

# Test Book endpoints
def test_books(session):
    print("\nTesting Book endpoints...")
    
    # Create a book
    book_data = {
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
    response = session.post(f'{BASE_URL}/books/', json=book_data)
    print("Creating book:")
    print_response(response)
    book_id = response.json()['id']
    
    # Get book list
    response = session.get(f'{BASE_URL}/books/')
    print("Getting book list:")
    print_response(response)
    
    return book_id

# Test Shelf endpoints
def test_shelves(session):
    print("\nTesting Shelf endpoints...")
    
    # Create a shelf
    shelf_data = {
        "name": "Test Shelf",
        "is_default": False
    }
    response = session.post(f'{BASE_URL}/shelves/', json=shelf_data)
    print("Creating shelf:")
    print_response(response)
    shelf_id = response.json()['id']
    
    # Get shelf list
    response = session.get(f'{BASE_URL}/shelves/')
    print("Getting shelf list:")
    print_response(response)
    
    return shelf_id

# Test UserBook endpoints
def test_userbooks(session, book_id, shelf_id):
    print("\nTesting UserBook endpoints...")
    
    # Add book to user's collection
    userbook_data = {
        "book": book_id,
        "status": "reading",
        "shelf_ids": [shelf_id],
        "current_page": 50
    }
    response = session.post(f'{BASE_URL}/userbooks/', json=userbook_data)
    print("Creating userbook:")
    print_response(response)
    userbook_id = response.json()['id']
    
    # Update reading progress
    progress_data = {
        "current_page": 75,
        "create_session": True,
        "start_page": 50,
        "end_page": 75,
        "start_time": (datetime.now() - timedelta(hours=1)).isoformat(),
        "end_time": datetime.now().isoformat(),
        "notes": "Great reading session!"
    }
    response = session.post(f'{BASE_URL}/userbooks/{userbook_id}/update_progress/', json=progress_data)
    print("Updating reading progress:")
    print_response(response)
    
    # Get statistics
    response = session.get(f'{BASE_URL}/userbooks/statistics/')
    print("Getting reading statistics:")
    print_response(response)
    
    return userbook_id

# Test Notes, Reviews, and Quotes
def test_annotations(session, userbook_id):
    print("\nTesting Notes, Reviews, and Quotes endpoints...")
    
    # Create a note
    note_data = {
        "user_book": userbook_id,
        "content": "This is a test note",
        "page_number": 55
    }
    response = session.post(f'{BASE_URL}/notes/', json=note_data)
    print("Creating note:")
    print_response(response)
    
    # Create a review
    review_data = {
        "user_book": userbook_id,
        "content": "This is a test review",
        "is_public": True
    }
    response = session.post(f'{BASE_URL}/reviews/', json=review_data)
    print("Creating review:")
    print_response(response)
    
    # Create a quote
    quote_data = {
        "user_book": userbook_id,
        "content": "This is a test quote",
        "page_number": 60
    }
    response = session.post(f'{BASE_URL}/quotes/', json=quote_data)
    print("Creating quote:")
    print_response(response)

def run_tests():
    # Create test user (run this only once)
    # create_test_user()
    
    # Run tests
    session = test_auth()
    book_id = test_books(session)
    shelf_id = test_shelves(session)
    userbook_id = test_userbooks(session, book_id, shelf_id)
    test_annotations(session, userbook_id)

if __name__ == "__main__":
    run_tests()