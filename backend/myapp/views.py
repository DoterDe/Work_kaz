from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes

from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.serializers import ModelSerializer

# Google OAuth
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from rest_framework import viewsets, permissions
from .serializers import UserSerializer

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .permissions import IsAdminOrReadOnly


from rest_framework import generics, permissions
from .models import Lesson
from .serializers import LessonSerializer


class LessonDetailView(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Lesson.objects.filter(is_published=True)

        level = self.request.query_params.get('level')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if level:
            qs = qs.filter(level=level)
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(title__icontains=search)

        return qs

GOOGLE_CLIENT_ID = '1069809842952-qh478ii41jgbphm0bbjcpkspbrhceg7b.apps.googleusercontent.com'

# ----------------------
# HomePage (публичная)
# ----------------------
class HomePageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "message": "Главная страница доступна всем, но контент ограничен"
        })


# ----------------------
# Dashboard (только для авторизованных)
# ----------------------
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Показываем username, email и JWT
        access_token = str(RefreshToken.for_user(request.user).access_token)
        refresh_token = str(RefreshToken.for_user(request.user))

        # Логируем на сервере
        print("=== Dashboard access ===")
        print("User:", request.user.username)
        print("Email:", request.user.email)
        print("Access token:", access_token)
        print("Refresh token:", refresh_token)
        print("=======================")

        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "access_token": access_token,
            "refresh_token": refresh_token
        })


# ----------------------
# Google OAuth Login
# ----------------------
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("id_token")
        if not token:
            return Response({"error": "No id_token provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo.get("email")
            username = email.split("@")[0]

            user, created = User.objects.get_or_create(email=email, defaults={"username": username})
            if created:
                user.set_unusable_password()
                user.save()

            refresh = RefreshToken.for_user(user)

            print("=== Google Login ===")
            print("User:", user.username)
            print("Email:", email)
            print("Created:", created)
            print("Access token:", str(refresh.access_token))
            print("Refresh token:", str(refresh))
            print("===================")

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })

        except ValueError as e:
            print("Google token error:", e)
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)


# ----------------------
# Регистрация пользователей
# ----------------------
class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


# ----------------------
# Тест API
# ----------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def test_api(request):
    return Response({"message": "React + Django REST + JWT работает"})
