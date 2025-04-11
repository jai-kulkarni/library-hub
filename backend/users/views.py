from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from users.serializers import UserSerializer
from .models import CustomUser


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Handles User Registration"""
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    email = request.data.get("email")
    password = request.data.get("password")

    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.create_user(
        email=email, first_name=first_name, last_name=last_name, password=password
    )

    # Generate JWT token after successful registration
    refresh = RefreshToken.for_user(user)
    
    return Response(
        {
            "message": "User registered successfully",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Handles User Login"""
    email = request.data.get('email')
    password = request.data.get('password')

    user = CustomUser.objects.filter(email=email).first()

    if user and user.check_password(password):
        if not user.is_active:
            return Response({'error': 'User account is inactive'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            'refresh': str(refresh),
            'access': str(access),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    print("Invalid credentials attempt for email:", email)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
