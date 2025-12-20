from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from myapp.views import RegisterView, DashboardView, HomePageView, test_api, GoogleLoginView, LessonDetailView, LessonListView


# DRF router для VideoLesson CRUD
# router = DefaultRouter()
# router.register(r"lessons", VideoLessonViewSet, basename="lessons")

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/test/', test_api),

    # JWT
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # Auth
    path('api/register/', RegisterView.as_view()),
    path('api/auth/google-login/', GoogleLoginView.as_view()),

    # Pages
    path('api/home/', HomePageView.as_view()),
    path('api/dashboard/', DashboardView.as_view()),

    # Lessons
    path('api/lessons/', LessonListView.as_view()),
    path('api/lessons/<int:pk>/', LessonDetailView.as_view()),
]
