from __future__ import annotations

import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.core.signing import BadSignature, SignatureExpired
from django.db import transaction
from django.db.models import Avg, Count, Q
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .audit import log_audit_event
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
from .permissions import IsContentManager
from .serializers import (
    AuditLogSerializer,
    LessonDetailSerializer,
    LessonProgressSerializer,
    LessonSerializer,
    LessonTestQuestionAdminSerializer,
    LessonTestQuestionPublicSerializer,
    LessonTestSubmitSerializer,
    ProgressUpdateSerializer,
    StudioLessonTemplateSerializer,
    StudioLessonTestsReplaceSerializer,
    StudioLessonUpdateSerializer,
    StudioLessonVocabularyReplaceSerializer,
    VocabularyQuizAttemptSerializer,
    VocabularyQuizGenerateSerializer,
    VocabularyQuizSubmitSerializer,
    VocabularyWordSerializer,
)

User = get_user_model()

GOOGLE_CLIENT_ID = getattr(settings, "GOOGLE_CLIENT_ID", "")
CONTENT_MANAGER_USERNAME = getattr(settings, "CONTENT_MANAGER_USERNAME", "admin")


def build_unique_username(base_username: str) -> str:
    base = (base_username or "user")[:150]
    candidate = base
    suffix = 1

    while User.objects.filter(username=candidate).exists():
        suffix_text = f"_{suffix}"
        candidate = f"{base[: max(1, 150 - len(suffix_text))]}{suffix_text}"
        suffix += 1

    return candidate


def is_content_manager_user(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    return user.username == CONTENT_MANAGER_USERNAME


def get_lesson_for_user(user, lesson_id: int) -> Lesson | None:
    lesson = Lesson.objects.filter(pk=lesson_id, is_published=True).first()
    if lesson:
        return lesson

    if user and user.is_authenticated and (user.is_staff or is_content_manager_user(user)):
        return Lesson.objects.filter(pk=lesson_id).first()
    return None


class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    throttle_scope = "auth"


class HomePageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "message": (
                    "Welcome to Qazaq Video Learn. Public home is available, "
                    "while lessons and dashboard require authentication."
                )
            }
        )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress_queryset = LessonProgress.objects.filter(user=request.user).select_related(
            "lesson"
        )

        completed_lessons = progress_queryset.filter(completed=True).count()
        in_progress_lessons = progress_queryset.filter(
            completed=False, progress__gt=0
        ).count()
        average_progress = progress_queryset.aggregate(avg=Avg("progress"))["avg"] or 0

        recent_lessons = [
            {
                "id": item.lesson.id,
                "title": item.lesson.title,
                "level": item.lesson.level,
                "duration_minutes": item.lesson.duration_minutes,
                "youtube_id": item.lesson.youtube_id,
                "progress": item.progress,
            }
            for item in progress_queryset.order_by("-updated_at")[:6]
        ]

        return Response(
            {
                "username": request.user.username,
                "email": request.user.email,
                "is_content_manager": is_content_manager_user(request.user),
                "stats": {
                    "completed_lessons": completed_lessons,
                    "in_progress_lessons": in_progress_lessons,
                    "average_progress": round(float(average_progress), 1),
                },
                "recent_lessons": recent_lessons,
            }
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "google_auth"

    def post(self, request):
        token = request.data.get("id_token")
        if not token:
            return Response(
                {"error": "No id_token provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not GOOGLE_CLIENT_ID:
            return Response(
                {"error": "Google login is not configured on the server"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        email = idinfo.get("email")
        if not email:
            return Response(
                {"error": "Google account does not contain email"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        created = False

        if not user:
            username = build_unique_username(email.split("@")[0])
            user = User.objects.create_user(username=username, email=email)
            user.set_unusable_password()
            user.save(update_fields=["password"])
            created = True

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "created": created,
            }
        )


class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Lesson.objects.filter(is_published=True)

        level = self.request.query_params.get("level")
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        ordering = (self.request.query_params.get("ordering") or "newest").lower()

        if level:
            queryset = queryset.filter(level=level)
        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        ordering_map = {
            "rating": "-rating",
            "newest": "-created_at",
            "duration": "duration_minutes",
            "title": "title",
        }
        queryset = queryset.order_by(ordering_map.get(ordering, "-created_at"))

        limit_param = self.request.query_params.get("limit")
        if limit_param:
            try:
                limit = min(max(int(limit_param), 1), 100)
                queryset = queryset[:limit]
            except ValueError:
                pass

        return queryset


class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = LessonDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or is_content_manager_user(self.request.user):
            return Lesson.objects.all()
        return Lesson.objects.filter(is_published=True)


class LessonMetaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Lesson.objects.filter(is_published=True)

        levels = {
            row["level"]: row["count"]
            for row in queryset.values("level").annotate(count=Count("id")).order_by("level")
        }
        categories = list(
            queryset.values("category")
            .annotate(count=Count("id"))
            .order_by("-count", "category")
        )
        average_rating = queryset.aggregate(avg=Avg("rating"))["avg"] or 0
        top_lessons = list(
            queryset.order_by("-rating", "title").values("id", "title", "rating")[:3]
        )
        total_words = VocabularyWord.objects.count()
        total_questions = LessonTestQuestion.objects.count()

        return Response(
            {
                "total_lessons": queryset.count(),
                "levels": levels,
                "categories": categories,
                "average_rating": round(float(average_rating), 2),
                "top_lessons": top_lessons,
                "total_words": total_words,
                "total_questions": total_questions,
            }
        )


class VocabularyListView(generics.ListAPIView):
    serializer_class = VocabularyWordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = VocabularyWord.objects.select_related("lesson").all()

        lesson_id = self.request.query_params.get("lesson")
        category = self.request.query_params.get("category")
        level = self.request.query_params.get("level")
        search = self.request.query_params.get("search")

        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        if category:
            queryset = queryset.filter(category__iexact=category)
        if level:
            queryset = queryset.filter(level=level)
        if search:
            queryset = queryset.filter(
                Q(word__icontains=search)
                | Q(translation__icontains=search)
                | Q(example__icontains=search)
            )

        return queryset.order_by("word")


class LessonVocabularyView(generics.ListAPIView):
    serializer_class = VocabularyWordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        lesson = get_lesson_for_user(self.request.user, self.kwargs["pk"])
        if not lesson:
            return VocabularyWord.objects.none()
        return VocabularyWord.objects.filter(lesson=lesson).order_by("word")


class LessonTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        lesson = get_lesson_for_user(request.user, pk)
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        questions = lesson.test_questions.filter(is_active=True).prefetch_related("options")
        serializer = LessonTestQuestionPublicSerializer(questions, many=True)

        return Response(
            {
                "lesson_id": lesson.id,
                "lesson_title": lesson.title,
                "pass_threshold": 70,
                "question_count": len(serializer.data),
                "questions": serializer.data,
            }
        )


class LessonProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "progress_update"

    def post(self, request, pk: int):
        lesson = get_lesson_for_user(request.user, pk)
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProgressUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        progress_item, _ = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
        )
        new_progress = max(progress_item.progress, serializer.validated_data["progress"])
        progress_item.progress = new_progress
        if serializer.validated_data.get("completed") or new_progress >= 100:
            progress_item.completed = True
        progress_item.save()

        output = LessonProgressSerializer(progress_item)
        return Response(output.data)


class LessonTestSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "lesson_submit"

    def post(self, request, pk: int):
        lesson = get_lesson_for_user(request.user, pk)
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LessonTestSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data["answers"]
        answer_map = {item["question_id"]: item["option_id"] for item in answers}

        questions = list(
            lesson.test_questions.filter(is_active=True).prefetch_related("options")
        )
        if not questions:
            return Response(
                {"error": "No test questions attached to this lesson yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        correct_count = 0
        for question in questions:
            correct_option_ids = [opt.id for opt in question.options.all() if opt.is_correct]
            selected_option = answer_map.get(question.id)
            if selected_option in correct_option_ids:
                correct_count += 1

        total_questions = len(questions)
        score_percent = round((correct_count / total_questions) * 100, 1)
        passed = score_percent >= 70

        attempt = LessonTestAttempt.objects.create(
            user=request.user,
            lesson=lesson,
            score_percent=score_percent,
            correct_answers=correct_count,
            total_questions=total_questions,
            passed=passed,
            answers_payload=answer_map,
        )

        progress_item, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
        progress_item.test_score = max(progress_item.test_score, score_percent)
        if passed:
            progress_item.progress = max(progress_item.progress, 100)
            progress_item.completed = True
        else:
            progress_item.progress = max(progress_item.progress, min(95, int(score_percent)))
        progress_item.save()

        log_audit_event(
            request,
            action="lesson_test_submit",
            entity_type="lesson",
            entity_id=lesson.id,
            payload={
                "attempt_id": attempt.id,
                "score_percent": score_percent,
                "passed": passed,
            },
        )

        return Response(
            {
                "attempt_id": attempt.id,
                "score_percent": score_percent,
                "correct_answers": correct_count,
                "total_questions": total_questions,
                "passed": passed,
                "progress": progress_item.progress,
                "completed": progress_item.completed,
            }
        )


class VocabularyQuizGenerateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "vocab_quiz"

    def get(self, request):
        serializer = VocabularyQuizGenerateSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        category = serializer.validated_data.get("category", "").strip()
        level = serializer.validated_data.get("level", "").strip()
        question_count = serializer.validated_data["question_count"]

        queryset = VocabularyWord.objects.all()
        if category:
            queryset = queryset.filter(category__iexact=category)
        if level:
            queryset = queryset.filter(level=level)

        words_pool = list(queryset.order_by("word")[:2000])
        if len(words_pool) < 4:
            return Response(
                {
                    "error": "At least 4 words are required for quiz generation with current filters."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_questions = random.sample(words_pool, min(question_count, len(words_pool)))
        token_questions_map: dict[str, list[int]] = {}
        question_order: list[int] = []
        questions_payload = []

        for question_word in selected_questions:
            distractors_pool = [word for word in words_pool if word.id != question_word.id]
            distractors = random.sample(distractors_pool, min(3, len(distractors_pool)))
            options_words = [question_word, *distractors]
            random.shuffle(options_words)

            option_ids = [word.id for word in options_words]
            token_questions_map[str(question_word.id)] = option_ids
            question_order.append(question_word.id)

            questions_payload.append(
                {
                    "question_word_id": question_word.id,
                    "word": question_word.word,
                    "pronunciation": question_word.pronunciation,
                    "options": [
                        {
                            "word_id": option_word.id,
                            "translation": option_word.translation,
                        }
                        for option_word in options_words
                    ],
                }
            )

        token_payload = {
            "questions": token_questions_map,
            "question_order": question_order,
            "category": category,
            "level": level,
        }
        token = signing.dumps(token_payload, salt="vocab-quiz")

        return Response(
            {
                "token": token,
                "question_count": len(questions_payload),
                "category": category,
                "level": level,
                "questions": questions_payload,
            }
        )


class VocabularyQuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "vocab_quiz"

    def post(self, request):
        serializer = VocabularyQuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        try:
            token_payload = signing.loads(token, salt="vocab-quiz", max_age=1800)
        except SignatureExpired:
            return Response(
                {"error": "Quiz token expired. Please regenerate quiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid quiz token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_questions_map = token_payload.get("questions", {})
        question_order = token_payload.get("question_order", [])

        answers = serializer.validated_data["answers"]
        answer_map = {item["question_word_id"]: item["selected_word_id"] for item in answers}

        expected_question_ids = {int(question_id) for question_id in token_questions_map.keys()}
        answered_question_ids = set(answer_map.keys())
        if expected_question_ids != answered_question_ids:
            return Response(
                {"error": "Please answer all quiz questions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        normalized_payload = []
        correct_count = 0

        for question_id in expected_question_ids:
            selected_word_id = answer_map[question_id]
            allowed_options = token_questions_map.get(str(question_id), [])
            if selected_word_id not in allowed_options:
                return Response(
                    {"error": "Invalid option selected for one of the questions."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            is_correct = selected_word_id == question_id
            if is_correct:
                correct_count += 1

            normalized_payload.append(
                {
                    "question_word_id": question_id,
                    "selected_word_id": selected_word_id,
                    "is_correct": is_correct,
                }
            )

        total_questions = len(expected_question_ids)
        score_percent = round((correct_count / total_questions) * 100, 1)

        category_filter = serializer.validated_data.get("category", "")
        level_filter = serializer.validated_data.get("level", "")

        attempt = VocabularyQuizAttempt.objects.create(
            user=request.user,
            score_percent=score_percent,
            correct_answers=correct_count,
            total_questions=total_questions,
            category_filter=category_filter,
            level_filter=level_filter or None,
            answers_payload=normalized_payload,
        )

        involved_word_ids = set(question_order)
        involved_word_ids.update(answer_map.values())
        words_map = {
            item.id: item
            for item in VocabularyWord.objects.filter(id__in=involved_word_ids)
        }

        review = []
        for question_id in question_order:
            selected_word_id = answer_map.get(question_id)
            question_word = words_map.get(question_id)
            selected_word = words_map.get(selected_word_id)
            review.append(
                {
                    "question_word": question_word.word if question_word else "-",
                    "correct_translation": question_word.translation if question_word else "-",
                    "selected_translation": selected_word.translation if selected_word else "-",
                    "is_correct": selected_word_id == question_id,
                }
            )

        recent_attempts = VocabularyQuizAttempt.objects.filter(user=request.user)[:10]

        log_audit_event(
            request,
            action="vocabulary_quiz_submit",
            entity_type="vocabulary_quiz",
            entity_id=attempt.id,
            payload={
                "score_percent": score_percent,
                "total_questions": total_questions,
            },
        )

        return Response(
            {
                "attempt_id": attempt.id,
                "score_percent": score_percent,
                "correct_answers": correct_count,
                "total_questions": total_questions,
                "review": review,
                "history": VocabularyQuizAttemptSerializer(recent_attempts, many=True).data,
            }
        )


class VocabularyQuizHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = VocabularyQuizAttempt.objects.filter(user=request.user)[:20]
        serializer = VocabularyQuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)


class StudioLessonTemplateView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request):
        lessons = Lesson.objects.all().order_by("-created_at")
        serializer = LessonSerializer(lessons, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = StudioLessonTemplateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()

        log_audit_event(
            request,
            action="studio_lesson_create",
            entity_type="lesson",
            entity_id=lesson.id,
            payload={"title": lesson.title},
        )

        full_lesson = LessonDetailSerializer(lesson, context={"request": request})
        return Response(full_lesson.data, status=status.HTTP_201_CREATED)


class StudioLessonDetailView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def patch(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudioLessonUpdateSerializer(lesson, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        log_audit_event(
            request,
            action="studio_lesson_update",
            entity_type="lesson",
            entity_id=lesson.id,
            payload=serializer.validated_data,
        )

        output = LessonDetailSerializer(lesson, context={"request": request})
        return Response(output.data)

    def delete(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        lesson_title = lesson.title
        lesson.delete()

        log_audit_event(
            request,
            action="studio_lesson_delete",
            entity_type="lesson",
            entity_id=pk,
            payload={"title": lesson_title},
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class StudioVocabularyView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request):
        words = VocabularyWord.objects.select_related("lesson").all().order_by("-created_at")
        serializer = VocabularyWordSerializer(words, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VocabularyWordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(created_by=request.user)

        log_audit_event(
            request,
            action="studio_vocabulary_create",
            entity_type="vocabulary_word",
            entity_id=item.id,
            payload={"word": item.word, "lesson_id": item.lesson_id},
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudioVocabularyDetailView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def patch(self, request, pk: int):
        item = VocabularyWord.objects.filter(pk=pk).first()
        if not item:
            return Response({"error": "Word not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = VocabularyWordSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        log_audit_event(
            request,
            action="studio_vocabulary_update",
            entity_type="vocabulary_word",
            entity_id=item.id,
            payload=serializer.validated_data,
        )

        return Response(serializer.data)

    def delete(self, request, pk: int):
        item = VocabularyWord.objects.filter(pk=pk).first()
        if not item:
            return Response({"error": "Word not found"}, status=status.HTTP_404_NOT_FOUND)

        word_text = item.word
        item.delete()

        log_audit_event(
            request,
            action="studio_vocabulary_delete",
            entity_type="vocabulary_word",
            entity_id=pk,
            payload={"word": word_text},
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class StudioLessonVocabularyView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        words = VocabularyWord.objects.filter(lesson=lesson).order_by("word")
        serializer = VocabularyWordSerializer(words, many=True)
        return Response(serializer.data)

    def put(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudioLessonVocabularyReplaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        words_payload = serializer.validated_data.get("words", [])

        with transaction.atomic():
            VocabularyWord.objects.filter(lesson=lesson).delete()
            for word_payload in words_payload:
                VocabularyWord.objects.create(
                    lesson=lesson,
                    created_by=request.user,
                    **word_payload,
                )

        output_words = VocabularyWord.objects.filter(lesson=lesson).order_by("word")
        output = VocabularyWordSerializer(output_words, many=True)

        log_audit_event(
            request,
            action="studio_lesson_vocabulary_replace",
            entity_type="lesson",
            entity_id=lesson.id,
            payload={"words_count": len(words_payload)},
        )

        return Response(output.data)


class StudioLessonTestsView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        questions = lesson.test_questions.prefetch_related("options").all()
        serializer = LessonTestQuestionAdminSerializer(questions, many=True)
        return Response(serializer.data)

    def put(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudioLessonTestsReplaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        questions_payload = serializer.validated_data.get("questions", [])

        with transaction.atomic():
            lesson.test_questions.all().delete()
            for index, question_payload in enumerate(questions_payload, start=1):
                options_payload = question_payload.get("options", [])
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

        output = LessonTestQuestionAdminSerializer(
            lesson.test_questions.prefetch_related("options"), many=True
        )

        log_audit_event(
            request,
            action="studio_lesson_tests_replace",
            entity_type="lesson",
            entity_id=lesson.id,
            payload={"questions_count": len(questions_payload)},
        )

        return Response(output.data)

    def delete(self, request, pk: int):
        lesson = Lesson.objects.filter(pk=pk).first()
        if not lesson:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        deleted_count, _ = lesson.test_questions.all().delete()

        log_audit_event(
            request,
            action="studio_lesson_tests_delete",
            entity_type="lesson",
            entity_id=lesson.id,
            payload={"deleted_objects": deleted_count},
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class StudioStudentsProgressView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request):
        students = User.objects.exclude(username=CONTENT_MANAGER_USERNAME).order_by("username")
        payload = []

        for student in students:
            progress_items = LessonProgress.objects.filter(user=student).select_related("lesson")
            completed_count = progress_items.filter(completed=True).count()
            in_progress_count = progress_items.filter(completed=False, progress__gt=0).count()
            avg_progress = progress_items.aggregate(avg=Avg("progress"))["avg"] or 0
            latest_attempt = (
                LessonTestAttempt.objects.filter(user=student)
                .select_related("lesson")
                .first()
            )

            payload.append(
                {
                    "user_id": student.id,
                    "username": student.username,
                    "email": student.email,
                    "completed_lessons": completed_count,
                    "in_progress_lessons": in_progress_count,
                    "average_progress": round(float(avg_progress), 1),
                    "latest_test_attempt": {
                        "lesson_title": latest_attempt.lesson.title,
                        "score_percent": latest_attempt.score_percent,
                        "passed": latest_attempt.passed,
                    }
                    if latest_attempt
                    else None,
                    "lessons": [
                        {
                            "lesson_id": item.lesson.id,
                            "lesson_title": item.lesson.title,
                            "progress": item.progress,
                            "completed": item.completed,
                            "test_score": item.test_score,
                            "updated_at": item.updated_at,
                        }
                        for item in progress_items.order_by("-updated_at")[:25]
                    ],
                }
            )

        return Response({"students": payload})


class StudioTestAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request):
        lesson_id = request.query_params.get("lesson")

        attempts_qs = LessonTestAttempt.objects.select_related("user", "lesson")
        if lesson_id:
            attempts_qs = attempts_qs.filter(lesson_id=lesson_id)

        summary = attempts_qs.aggregate(
            total_attempts=Count("id"),
            average_score=Avg("score_percent"),
            passed_attempts=Count("id", filter=Q(passed=True)),
        )
        total_attempts = summary["total_attempts"] or 0
        average_score = round(float(summary["average_score"] or 0), 1)
        passed_attempts = summary["passed_attempts"] or 0
        pass_rate = round((passed_attempts / total_attempts) * 100, 1) if total_attempts else 0

        recent_attempts = [
            {
                "attempt_id": item.id,
                "lesson_id": item.lesson.id,
                "lesson_title": item.lesson.title,
                "username": item.user.username,
                "score_percent": item.score_percent,
                "passed": item.passed,
                "submitted_at": item.submitted_at,
            }
            for item in attempts_qs.order_by("-submitted_at")[:200]
        ]

        lessons_breakdown = []
        lessons_breakdown_qs = (
            attempts_qs.values("lesson_id", "lesson__title")
            .annotate(
                attempts=Count("id"),
                average_score=Avg("score_percent"),
                passed_attempts=Count("id", filter=Q(passed=True)),
            )
            .order_by("-attempts", "lesson__title")
        )
        for row in lessons_breakdown_qs:
            attempts_count = row["attempts"] or 0
            lessons_breakdown.append(
                {
                    "lesson_id": row["lesson_id"],
                    "lesson_title": row["lesson__title"],
                    "attempts": attempts_count,
                    "average_score": round(float(row["average_score"] or 0), 1),
                    "pass_rate": round(
                        ((row["passed_attempts"] or 0) / attempts_count) * 100, 1
                    )
                    if attempts_count
                    else 0,
                }
            )

        questions_qs = LessonTestQuestion.objects.select_related("lesson").prefetch_related("options")
        if lesson_id:
            questions_qs = questions_qs.filter(lesson_id=lesson_id)
        questions = list(questions_qs.order_by("lesson__title", "order", "id")[:120])

        question_stats = {}
        correct_options_map = {}
        for question in questions:
            question_stats[question.id] = {
                "attempts": 0,
                "correct": 0,
                "options": {option.id: 0 for option in question.options.all()},
            }
            correct_options_map[question.id] = {
                option.id for option in question.options.all() if option.is_correct
            }

        for attempt in attempts_qs.order_by("-submitted_at")[:500]:
            answers_payload = attempt.answers_payload or {}
            if not isinstance(answers_payload, dict):
                continue

            for question_id_raw, option_id_raw in answers_payload.items():
                try:
                    question_id = int(question_id_raw)
                    option_id = int(option_id_raw)
                except (TypeError, ValueError):
                    continue

                if question_id not in question_stats:
                    continue

                question_stats[question_id]["attempts"] += 1
                if option_id in question_stats[question_id]["options"]:
                    question_stats[question_id]["options"][option_id] += 1

                if option_id in correct_options_map.get(question_id, set()):
                    question_stats[question_id]["correct"] += 1

        question_breakdown = []
        for question in questions:
            stats_obj = question_stats.get(question.id, {"attempts": 0, "correct": 0, "options": {}})
            attempts_count = stats_obj["attempts"]
            correct_count = stats_obj["correct"]

            options_breakdown = []
            for option in question.options.all():
                selected_count = stats_obj["options"].get(option.id, 0)
                options_breakdown.append(
                    {
                        "option_id": option.id,
                        "option_text": option.option_text,
                        "is_correct": option.is_correct,
                        "selected_count": selected_count,
                        "selected_rate": round((selected_count / attempts_count) * 100, 1)
                        if attempts_count
                        else 0,
                    }
                )

            question_breakdown.append(
                {
                    "question_id": question.id,
                    "lesson_id": question.lesson.id,
                    "lesson_title": question.lesson.title,
                    "order": question.order,
                    "question_text": question.question_text,
                    "attempts": attempts_count,
                    "correct_rate": round((correct_count / attempts_count) * 100, 1)
                    if attempts_count
                    else 0,
                    "options": options_breakdown,
                }
            )

        return Response(
            {
                "summary": {
                    "total_attempts": total_attempts,
                    "average_score": average_score,
                    "pass_rate": pass_rate,
                },
                "recent_attempts": recent_attempts,
                "lesson_breakdown": lessons_breakdown,
                "question_breakdown": question_breakdown,
            }
        )


class StudioAuditLogView(APIView):
    permission_classes = [IsAuthenticated, IsContentManager]
    throttle_scope = "studio"

    def get(self, request):
        limit = request.query_params.get("limit")
        try:
            limit_value = min(max(int(limit or 100), 1), 300)
        except ValueError:
            limit_value = 100

        logs = AuditLog.objects.select_related("actor")[:limit_value]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def home(request):
    return Response(
        {
            "message": (
                "Welcome to Qazaq Video Learn. Public home is available, "
                "while lessons and dashboard require authentication."
            )
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def test_api(request):
    return Response({"message": "React + Django REST + JWT integration is working"})
