
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from myapp.views import RegisterView, DashboardView, test_api

urlpatterns = [
    path('admin/', admin.site.urls),

    # Тестовый эндпоинт
    path('api/test/', test_api, name='test'),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Регистрация
    path('api/register/', RegisterView.as_view(), name='register'),

    # Защищённый Dashboard
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
]


