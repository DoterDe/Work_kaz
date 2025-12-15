from django.urls import path
from . import views
from .views import test_api , home



urlpatterns = [
    path('', home),   
    path('test/', test_api),
]
