from django.contrib import admin

from .models import (
    AuditLog,
    Lesson,
    LessonProgress,
    LessonTestAttempt,
    LessonTestOption,
    LessonTestQuestion,
    VocabularyQuizAttempt,
    VocabularyWord,
)


class LessonTestOptionInline(admin.TabularInline):
    model = LessonTestOption
    extra = 2


@admin.register(LessonTestQuestion)
class LessonTestQuestionAdmin(admin.ModelAdmin):
    list_display = ("lesson", "order", "question_text", "is_active")
    list_filter = ("lesson__level", "is_active")
    search_fields = ("lesson__title", "question_text")
    inlines = [LessonTestOptionInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "level", "category", "duration_minutes", "rating", "is_published")
    list_filter = ("level", "category", "is_published")
    search_fields = ("title", "description")


@admin.register(VocabularyWord)
class VocabularyWordAdmin(admin.ModelAdmin):
    list_display = ("word", "translation", "level", "category", "lesson")
    list_filter = ("level", "category")
    search_fields = ("word", "translation", "example")


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "lesson", "progress", "completed", "test_score", "updated_at")
    list_filter = ("completed", "lesson__level")
    search_fields = ("user__username", "lesson__title")


@admin.register(LessonTestAttempt)
class LessonTestAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "lesson", "score_percent", "passed", "submitted_at")
    list_filter = ("passed", "lesson__level")
    search_fields = ("user__username", "lesson__title")


@admin.register(VocabularyQuizAttempt)
class VocabularyQuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "score_percent", "correct_answers", "total_questions", "created_at")
    list_filter = ("level_filter", "created_at")
    search_fields = ("user__username", "category_filter")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "actor", "action", "entity_type", "entity_id", "ip_address")
    list_filter = ("action", "entity_type", "created_at")
    search_fields = ("actor__username", "action", "entity_type", "entity_id")
