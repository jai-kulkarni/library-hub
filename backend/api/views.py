from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Book, Review
from .serializers import BookSerializer, ReviewSerializer
from django.db.models import Avg

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        book_id = self.kwargs['book_pk']
        return Review.objects.filter(book_id=book_id).order_by('-timestamp')

    def perform_create(self, serializer):
        book_id = self.kwargs['book_pk']
        
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        
        user = self.request.user

        existing_review = Review.objects.filter(book=book, user=user).first()
        
        if existing_review:
            return self.perform_update_existing_review(existing_review, serializer)

        serializer.save(user=user, book=book)

        self.update_book_average_rating(book)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_update_existing_review(self, review, serializer):
        # Update the review data
        review.rating = serializer.validated_data.get('rating', review.rating)
        review.comment = serializer.validated_data.get('comment', review.comment)

        review.timestamp = timezone.now()
        
        review.save()

        self.update_book_average_rating(review.book)

        return Response(self.get_serializer(review).data, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        # Ensure only the user who created the review can update it
        if serializer.instance.user != self.request.user:
            return Response({"error": "You can only update your own reviews."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer.instance.timestamp = timezone.now()

        serializer.save()

        self.update_book_average_rating(serializer.instance.book)

    def perform_destroy(self, instance):
        # Ensure only the user who created the review can delete it
        if instance.user != self.request.user:
            return Response({"error": "You can only delete your own reviews."}, status=status.HTTP_403_FORBIDDEN)
        
        book = instance.book

        instance.delete()

        self.update_book_average_rating(book)

        return Response({"message": "Review deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    def update_book_average_rating(self, book):
        # Calculate the new average rating for the book
        avg_rating = Review.objects.filter(book=book).aggregate(Avg('rating'))['rating__avg']

        # If no reviews, set the average rating to None or 0
        if avg_rating is None:
            avg_rating = 0

        # Update the book's average rating
        book.average_rating = avg_rating
        book.save()
