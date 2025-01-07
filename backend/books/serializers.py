# books/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Shelf, UserBook, ReadingSession, Note, Review, Quote

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class ShelfSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shelf
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserBookSerializer(serializers.ModelSerializer):
    book_details = BookSerializer(source='book', read_only=True)
    shelves = ShelfSerializer(many=True, read_only=True)
    shelf_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = UserBook
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        shelf_ids = validated_data.pop('shelf_ids', [])
        validated_data['user'] = self.context['request'].user
        user_book = super().create(validated_data)
        
        if shelf_ids:
            shelves = Shelf.objects.filter(
                id__in=shelf_ids,
                user=self.context['request'].user
            )
            user_book.shelves.set(shelves)
        
        return user_book

class ReadingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingSession
        fields = '__all__'

    def validate(self, data):
        if data['end_page'] < data['start_page']:
            raise serializers.ValidationError("End page cannot be less than start page")
        if data['end_time'] < data['start_time']:
            raise serializers.ValidationError("End time cannot be before start time")
        return data

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ('user_book',)

    def validate_user_book(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("You can only create notes for your own books")
        return value

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user_book.user.username', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user_book',)

    def validate_user_book(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("You can only create reviews for your own books")
        return value

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = '__all__'
        read_only_fields = ('user_book',)

    def validate_user_book(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("You can only create quotes for your own books")
        return value