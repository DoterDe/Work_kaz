from django.conf import settings
from django.db import models


class Lesson(models.Model):
    LEVEL_CHOICES = [
        ("A1", "A1"),
        ("A2", "A2"),
        ("B1", "B1"),
        ("B2", "B2"),
    ]

    CATEGORY_CHOICES = [
        ("Everyday Speech", "Everyday Speech"),
        ("Travel", "Travel"),
        ("School & Education", "School & Education"),
        ("Work & Business", "Work & Business"),
        ("Grammar", "Grammar"),
        ("Culture", "Culture"),
        ("Food & Dining", "Food & Dining"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    duration_minutes = models.PositiveIntegerField()
    youtube_id = models.CharField(max_length=50, help_text="YouTube video id only")
    thumbnail = models.URLField()
    rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class VocabularyWord(models.Model):
    word = models.CharField(max_length=120)
    translation = models.CharField(max_length=255)
    pronunciation = models.CharField(max_length=255, blank=True)
    example = models.TextField(blank=True)
    category = models.CharField(max_length=80, blank=True)
    level = models.CharField(
        max_length=2,
        choices=Lesson.LEVEL_CHOICES,
        null=True,
        blank=True,
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.SET_NULL,
        related_name="vocabulary_words",
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_vocabulary_words",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["word"]

    def __str__(self):
        return f"{self.word} -> {self.translation}"


class LessonTestQuestion(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="test_questions",
    )
    question_text = models.TextField()
    order = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.lesson.title} / Q{self.order}"


class LessonTestOption(models.Model):
    question = models.ForeignKey(
        LessonTestQuestion,
        on_delete=models.CASCADE,
        related_name="options",
    )
    option_text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.option_text


class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    progress = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    test_score = models.FloatField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "lesson")

    def __str__(self):
        return f"{self.user} / {self.lesson} / {self.progress}%"


class LessonTestAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="attempts")
    score_percent = models.FloatField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)
    answers_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.user} / {self.lesson} / {self.score_percent:.1f}%"


class VocabularyQuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score_percent = models.FloatField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    category_filter = models.CharField(max_length=80, blank=True)
    level_filter = models.CharField(
        max_length=2,
        choices=Lesson.LEVEL_CHOICES,
        null=True,
        blank=True,
    )
    answers_payload = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} / Vocab quiz / {self.score_percent:.1f}%"


class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=120)
    entity_type = models.CharField(max_length=120)
    entity_id = models.CharField(max_length=120, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} / {self.entity_type} / {self.created_at:%Y-%m-%d %H:%M:%S}"
