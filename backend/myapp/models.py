from django.db import models

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


from django.db import models
from django.conf import settings

class Lesson(models.Model):
    LEVEL_CHOICES = [
        ('A1', 'A1'),
        ('A2', 'A2'),
        ('B1', 'B1'),
        ('B2', 'B2'),
    ]

    CATEGORY_CHOICES = [
        ('Everyday Speech', 'Everyday Speech'),
        ('Travel', 'Travel'),
        ('School & Education', 'School & Education'),
        ('Work & Business', 'Work & Business'),
        ('Grammar', 'Grammar'),
        ('Culture', 'Culture'),
        ('Food & Dining', 'Food & Dining'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()

    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    duration_minutes = models.PositiveIntegerField()

    youtube_id = models.CharField(
        max_length=50,
        help_text="Только ID видео, не ссылка"
    )

    thumbnail = models.URLField()

    rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    

class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)

    progress = models.PositiveIntegerField(default=0)  # %
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'lesson')
