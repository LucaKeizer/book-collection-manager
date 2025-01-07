# books/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Book(models.Model):
    google_books_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    authors = models.JSONField()  # Store as JSON array
    published_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    page_count = models.IntegerField(null=True, blank=True)
    categories = models.JSONField(default=list)  # Store as JSON array
    thumbnail_url = models.URLField(max_length=500, blank=True)
    language = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.title

class Shelf(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'user']

    def __str__(self):
        return f"{self.user.username}'s {self.name} shelf"

class UserBook(models.Model):
    READING_STATUS_CHOICES = [
        ('want_to_read', 'Want to Read'),
        ('reading', 'Currently Reading'),
        ('read', 'Read'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    shelves = models.ManyToManyField(Shelf)
    status = models.CharField(max_length=20, choices=READING_STATUS_CHOICES)
    current_page = models.IntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'book']

    def __str__(self):
        return f"{self.user.username}'s {self.book.title}"

class ReadingSession(models.Model):
    user_book = models.ForeignKey(UserBook, on_delete=models.CASCADE)
    start_page = models.IntegerField()
    end_page = models.IntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Reading session for {self.user_book}"

class Note(models.Model):
    user_book = models.ForeignKey(UserBook, on_delete=models.CASCADE)
    content = models.TextField()
    page_number = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note for {self.user_book}"

class Review(models.Model):
    user_book = models.ForeignKey(UserBook, on_delete=models.CASCADE)
    content = models.TextField()
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review for {self.user_book}"

class Quote(models.Model):
    user_book = models.ForeignKey(UserBook, on_delete=models.CASCADE)
    content = models.TextField()
    page_number = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quote from {self.user_book}"