from django.contrib.auth import get_user_model
from rest_framework import serializers

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

User = get_user_model()


class LessonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    duration = serializers.IntegerField(source="duration_minutes", read_only=True)
    question_count = serializers.IntegerField(source="test_questions.count", read_only=True)
    vocabulary_count = serializers.IntegerField(
        source="vocabulary_words.count", read_only=True
    )

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "description",
            "level",
            "category",
            "duration_minutes",
            "duration",
            "youtube_id",
            "thumbnail",
            "rating",
            "created_at",
            "is_published",
            "progress",
            "question_count",
            "vocabulary_count",
        ]

    def get_progress(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or user.is_anonymous:
            return 0

        progress = LessonProgress.objects.filter(user=user, lesson=obj).first()
        return progress.progress if progress else 0


class LessonDetailSerializer(LessonSerializer):
    class Meta(LessonSerializer.Meta):
        fields = LessonSerializer.Meta.fields + []


class VocabularyWordSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = VocabularyWord
        fields = [
            "id",
            "word",
            "translation",
            "pronunciation",
            "example",
            "category",
            "level",
            "lesson",
            "lesson_title",
            "created_at",
        ]


class LessonTestOptionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonTestOption
        fields = ["id", "option_text"]


class LessonTestOptionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonTestOption
        fields = ["id", "option_text", "is_correct"]


class LessonTestQuestionPublicSerializer(serializers.ModelSerializer):
    options = LessonTestOptionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = LessonTestQuestion
        fields = ["id", "order", "question_text", "options"]


class LessonTestQuestionAdminSerializer(serializers.ModelSerializer):
    options = LessonTestOptionAdminSerializer(many=True, read_only=True)

    class Meta:
        model = LessonTestQuestion
        fields = ["id", "order", "question_text", "explanation", "is_active", "options"]


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            "id",
            "lesson",
            "lesson_title",
            "progress",
            "completed",
            "test_score",
            "updated_at",
        ]


class LessonTestAttemptSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = LessonTestAttempt
        fields = [
            "id",
            "lesson",
            "lesson_title",
            "username",
            "score_percent",
            "correct_answers",
            "total_questions",
            "passed",
            "submitted_at",
        ]


class ProgressUpdateSerializer(serializers.Serializer):
    progress = serializers.IntegerField(min_value=0, max_value=100)
    completed = serializers.BooleanField(required=False)


class TestAnswerItemSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    option_id = serializers.IntegerField()


class LessonTestSubmitSerializer(serializers.Serializer):
    answers = TestAnswerItemSerializer(many=True)

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("At least one answer is required.")
        return value


class StudioOptionInputSerializer(serializers.Serializer):
    option_text = serializers.CharField(max_length=300)
    is_correct = serializers.BooleanField(default=False)


class StudioQuestionInputSerializer(serializers.Serializer):
    order = serializers.IntegerField(required=False, min_value=1)
    question_text = serializers.CharField()
    explanation = serializers.CharField(required=False, allow_blank=True)
    options = StudioOptionInputSerializer(many=True, min_length=2)

    def validate_options(self, value):
        if not any(item["is_correct"] for item in value):
            raise serializers.ValidationError("At least one option must be marked as correct.")
        return value


class StudioVocabularyInputSerializer(serializers.Serializer):
    word = serializers.CharField(max_length=120)
    translation = serializers.CharField(max_length=255)
    pronunciation = serializers.CharField(max_length=255, required=False, allow_blank=True)
    example = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(max_length=80, required=False, allow_blank=True)
    level = serializers.ChoiceField(
        choices=Lesson.LEVEL_CHOICES,
        required=False,
        allow_null=True,
    )


class StudioLessonTemplateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    level = serializers.ChoiceField(choices=Lesson.LEVEL_CHOICES)
    category = serializers.ChoiceField(choices=Lesson.CATEGORY_CHOICES)
    duration_minutes = serializers.IntegerField(min_value=1)
    youtube_id = serializers.CharField(max_length=50)
    thumbnail = serializers.URLField()
    rating = serializers.FloatField(required=False, min_value=0, max_value=5)
    is_published = serializers.BooleanField(default=True)
    test_questions = StudioQuestionInputSerializer(many=True, required=False)
    vocabulary_words = StudioVocabularyInputSerializer(many=True, required=False)

    def create(self, validated_data):
        request = self.context["request"]
        test_questions = validated_data.pop("test_questions", [])
        vocabulary_words = validated_data.pop("vocabulary_words", [])

        lesson = Lesson.objects.create(**validated_data)

        for index, question_payload in enumerate(test_questions, start=1):
            options_payload = question_payload.pop("options", [])
            question = LessonTestQuestion.objects.create(
                lesson=lesson,
                order=question_payload.get("order", index),
                question_text=question_payload["question_text"],
                explanation=question_payload.get("explanation", ""),
            )
            for option_payload in options_payload:
                LessonTestOption.objects.create(
                    question=question,
                    option_text=option_payload["option_text"],
                    is_correct=option_payload["is_correct"],
                )

        for word_payload in vocabulary_words:
            VocabularyWord.objects.create(
                lesson=lesson,
                created_by=request.user,
                **word_payload,
            )

        return lesson


class StudioLessonUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "title",
            "description",
            "level",
            "category",
            "duration_minutes",
            "youtube_id",
            "thumbnail",
            "rating",
            "is_published",
        ]


class StudioLessonTestsReplaceSerializer(serializers.Serializer):
    questions = StudioQuestionInputSerializer(many=True, required=False, default=list)


class StudioLessonVocabularyReplaceSerializer(serializers.Serializer):
    words = StudioVocabularyInputSerializer(many=True, required=False, default=list)


class VocabularyQuizGenerateSerializer(serializers.Serializer):
    category = serializers.CharField(required=False, allow_blank=True)
    level = serializers.ChoiceField(
        choices=Lesson.LEVEL_CHOICES,
        required=False,
        allow_blank=True,
    )
    question_count = serializers.IntegerField(min_value=4, max_value=20, required=False, default=8)


class VocabularyQuizAnswerItemSerializer(serializers.Serializer):
    question_word_id = serializers.IntegerField()
    selected_word_id = serializers.IntegerField()


class VocabularyQuizSubmitSerializer(serializers.Serializer):
    token = serializers.CharField()
    category = serializers.CharField(required=False, allow_blank=True)
    level = serializers.ChoiceField(
        choices=Lesson.LEVEL_CHOICES,
        required=False,
        allow_blank=True,
    )
    answers = VocabularyQuizAnswerItemSerializer(many=True)

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("At least one answer is required.")
        return value


class VocabularyQuizAttemptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = VocabularyQuizAttempt
        fields = [
            "id",
            "username",
            "score_percent",
            "correct_answers",
            "total_questions",
            "category_filter",
            "level_filter",
            "created_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "username",
            "action",
            "entity_type",
            "entity_id",
            "payload",
            "ip_address",
            "created_at",
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
