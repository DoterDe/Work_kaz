from django.contrib import admin

# Register your models here.
from django.contrib import admin

from django.contrib import admin
from .models import Lesson, LessonProgress

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'category', 'duration_minutes', 'rating', 'is_published')
    list_filter = ('level', 'category')
    search_fields = ('title', 'description')
