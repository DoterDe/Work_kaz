from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    AuditLog,
    Lesson,
    LessonProgress,
    LessonTestOption,
    LessonTestQuestion,
    VocabularyQuizAttempt,
    VocabularyWord,
)

User = get_user_model()


class LearningPlatformApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="StrongPass123",
        )
        self.manager = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="AdminStrong123",
            is_staff=True,
        )

        user_refresh = RefreshToken.for_user(self.user)
        manager_refresh = RefreshToken.for_user(self.manager)
        self.user_auth = f"Bearer {user_refresh.access_token}"
        self.manager_auth = f"Bearer {manager_refresh.access_token}"

    def create_lesson(
        self,
        *,
        title: str,
        level: str = "A1",
        category: str = "Travel",
        duration_minutes: int = 10,
        rating: float = 4.0,
    ):
        return Lesson.objects.create(
            title=title,
            description=f"{title} description",
            level=level,
            category=category,
            duration_minutes=duration_minutes,
            youtube_id=f"video_{title.lower().replace(' ', '_')}",
            thumbnail="https://example.com/thumb.jpg",
            rating=rating,
            is_published=True,
        )

    def test_lessons_list_requires_authentication(self):
        response = self.client.get("/api/lessons/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_lessons_list_supports_filters_ordering_and_limit(self):
        self.create_lesson(title="A1 Intro", level="A1", rating=3.2)
        self.create_lesson(title="A1 Dialog", level="A1", rating=4.8)
        self.create_lesson(title="B1 Conversation", level="B1", rating=4.5)

        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        response = self.client.get(
            "/api/lessons/",
            {"level": "A1", "ordering": "rating", "limit": "1"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "A1 Dialog")

    def test_dashboard_returns_progress_stats(self):
        lesson = self.create_lesson(title="Dashboard Lesson", level="A2")
        LessonProgress.objects.create(user=self.user, lesson=lesson, progress=60, completed=False)

        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertIn("stats", response.data)
        self.assertEqual(response.data["stats"]["in_progress_lessons"], 1)

    def test_manager_can_create_lesson_template_with_test_and_vocabulary(self):
        self.client.credentials(HTTP_AUTHORIZATION=self.manager_auth)
        payload = {
            "title": "Template Lesson",
            "description": "Template description",
            "level": "A1",
            "category": "Travel",
            "duration_minutes": 12,
            "youtube_id": "abcd1234",
            "thumbnail": "https://example.com/t.jpg",
            "test_questions": [
                {
                    "order": 1,
                    "question_text": "What is Salam?",
                    "options": [
                        {"option_text": "Hello", "is_correct": True},
                        {"option_text": "Bye", "is_correct": False},
                    ],
                }
            ],
            "vocabulary_words": [
                {
                    "word": "Salam",
                    "translation": "Hello",
                    "category": "Greetings",
                    "level": "A1",
                }
            ],
        }
        response = self.client.post("/api/studio/lessons/template/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Lesson.objects.filter(title="Template Lesson").exists())
        self.assertTrue(LessonTestQuestion.objects.filter(lesson__title="Template Lesson").exists())
        self.assertTrue(VocabularyWord.objects.filter(lesson__title="Template Lesson").exists())

    def test_non_manager_cannot_access_studio_endpoints(self):
        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        response = self.client.get("/api/studio/lessons/template/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_submit_test_updates_progress_and_marks_completed_when_passed(self):
        lesson = self.create_lesson(title="Test Lesson")
        question = LessonTestQuestion.objects.create(
            lesson=lesson,
            order=1,
            question_text="What does Rahmet mean?",
        )
        correct = LessonTestOption.objects.create(
            question=question,
            option_text="Thank you",
            is_correct=True,
        )
        LessonTestOption.objects.create(
            question=question,
            option_text="Goodbye",
            is_correct=False,
        )

        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        response = self.client.post(
            f"/api/lessons/{lesson.id}/test/submit/",
            {"answers": [{"question_id": question.id, "option_id": correct.id}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["passed"])
        progress_item = LessonProgress.objects.get(user=self.user, lesson=lesson)
        self.assertEqual(progress_item.progress, 100)
        self.assertTrue(progress_item.completed)

    def test_progress_update_endpoint_saves_per_user(self):
        lesson = self.create_lesson(title="Progress Lesson")
        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        response = self.client.post(
            f"/api/lessons/{lesson.id}/progress/",
            {"progress": 45},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress_item = LessonProgress.objects.get(user=self.user, lesson=lesson)
        self.assertEqual(progress_item.progress, 45)

    def test_manager_can_update_and_delete_lesson(self):
        lesson = self.create_lesson(title="Editable Lesson")
        self.client.credentials(HTTP_AUTHORIZATION=self.manager_auth)

        update_response = self.client.patch(
            f"/api/studio/lessons/{lesson.id}/",
            {"title": "Updated Lesson"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        lesson.refresh_from_db()
        self.assertEqual(lesson.title, "Updated Lesson")

        delete_response = self.client.delete(f"/api/studio/lessons/{lesson.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lesson.objects.filter(id=lesson.id).exists())

    def test_manager_can_update_and_delete_vocabulary_word(self):
        lesson = self.create_lesson(title="Word Lesson")
        word = VocabularyWord.objects.create(
            lesson=lesson,
            word="Salem",
            translation="Hello",
            category="Greeting",
            level="A1",
        )
        self.client.credentials(HTTP_AUTHORIZATION=self.manager_auth)

        update_response = self.client.patch(
            f"/api/studio/vocabulary/{word.id}/",
            {"translation": "Hi"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        word.refresh_from_db()
        self.assertEqual(word.translation, "Hi")

        delete_response = self.client.delete(f"/api/studio/vocabulary/{word.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(VocabularyWord.objects.filter(id=word.id).exists())

    def test_quiz_generate_submit_and_history(self):
        VocabularyWord.objects.create(
            word="kitap",
            translation="book",
            category="School",
            level="A1",
        )
        VocabularyWord.objects.create(
            word="mektep",
            translation="school",
            category="School",
            level="A1",
        )
        VocabularyWord.objects.create(
            word="qalam",
            translation="pen",
            category="School",
            level="A1",
        )
        VocabularyWord.objects.create(
            word="parta",
            translation="desk",
            category="School",
            level="A1",
        )

        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        generate_response = self.client.get(
            "/api/vocabulary/quiz/",
            {"category": "School", "level": "A1", "question_count": 4},
        )
        self.assertEqual(generate_response.status_code, status.HTTP_200_OK)
        token = generate_response.data["token"]
        questions = generate_response.data["questions"]
        self.assertEqual(len(questions), 4)

        answers = []
        for question in questions:
            question_word_id = question["question_word_id"]
            first_option = question["options"][0]["word_id"]
            answers.append(
                {
                    "question_word_id": question_word_id,
                    "selected_word_id": first_option,
                }
            )

        submit_response = self.client.post(
            "/api/vocabulary/quiz/submit/",
            {"token": token, "answers": answers, "category": "School", "level": "A1"},
            format="json",
        )
        self.assertEqual(submit_response.status_code, status.HTTP_200_OK)
        self.assertTrue(VocabularyQuizAttempt.objects.filter(user=self.user).exists())

        history_response = self.client.get("/api/vocabulary/quiz/history/")
        self.assertEqual(history_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(history_response.data), 1)

    def test_studio_test_analytics_and_audit_log_endpoints(self):
        lesson = self.create_lesson(title="Analytics Lesson")
        question = LessonTestQuestion.objects.create(
            lesson=lesson,
            order=1,
            question_text="What is qalam?",
        )
        correct = LessonTestOption.objects.create(
            question=question,
            option_text="Pen",
            is_correct=True,
        )
        LessonTestOption.objects.create(
            question=question,
            option_text="Book",
            is_correct=False,
        )

        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth)
        self.client.post(
            f"/api/lessons/{lesson.id}/test/submit/",
            {"answers": [{"question_id": question.id, "option_id": correct.id}]},
            format="json",
        )

        self.client.credentials(HTTP_AUTHORIZATION=self.manager_auth)
        analytics_response = self.client.get("/api/studio/analytics/tests/")
        self.assertEqual(analytics_response.status_code, status.HTTP_200_OK)
        self.assertIn("summary", analytics_response.data)
        self.assertIn("recent_attempts", analytics_response.data)

        logs_response = self.client.get("/api/studio/audit/")
        self.assertEqual(logs_response.status_code, status.HTTP_200_OK)
        self.assertTrue(AuditLog.objects.exists())
