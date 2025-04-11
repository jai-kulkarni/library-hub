from rest_framework import serializers
from .models import Book, Review
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'first_name', 'last_name']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'book', 'user', 'rating', 'comment', 'timestamp']
        read_only_fields = ['book', 'user', 'timestamp']

    def create(self, validated_data):
        print(f"Creating review with data: {validated_data}")
        return super().create(validated_data)

class BookSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    def get_average_rating(self, obj):
        return obj.average_rating() or "No Ratings"

    class Meta:
        model = Book
        fields = '__all__'
