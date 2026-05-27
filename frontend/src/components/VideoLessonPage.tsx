import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Home,
  Loader2,
  PlayCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";

import api from "../api/axios";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { extractApiErrorMessage } from "../utils/apiError";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { CardGlow } from "./ui/CardGlow";
import { LevelBadge } from "./ui/LevelBadge";
import { ProgressBar } from "./ui/ProgressBar";
import { cn } from "./ui/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoLessonPageProps {
  onNavigate: (page: string) => void;
  lesson: {
    id: number;
    title?: string;
    description?: string;
    level?: "A1" | "A2" | "B1" | "B2";
    duration?: number;
    duration_minutes?: number;
    youtube_id?: string;
    progress?: number;
  };
}

interface LessonResponse {
  id: number;
  title: string;
  description: string;
  level: "A1" | "A2" | "B1" | "B2";
  duration_minutes: number;
  youtube_id: string;
  progress: number;
}

interface VocabularyWord {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
}

interface TestOption {
  id: number;
  option_text: string;
}

interface TestQuestion {
  id: number;
  question_text: string;
  options: TestOption[];
}

interface TestResponse {
  pass_threshold: number;
  question_count: number;
  questions: TestQuestion[];
}

interface ReviewItem {
  question_id: number;
  question_text: string;
  selected_option_text: string;
  correct_option_text: string;
  is_correct: boolean;
  explanation?: string;
}

interface SubmitResult {
  score_percent: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  progress: number;
  review: ReviewItem[];
}

type LessonStep = "video" | "words" | "quiz";

// ─── localStorage helpers ────────────────────────────────────────────────────

function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function lsRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function lsGetJson<T>(key: string): T | null {
  const raw = lsGet(key);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VideoLessonPage({
  onNavigate,
  lesson,
}: VideoLessonPageProps) {
  const { language, formatMinutes } = useAppPreferences();

  const isRu = language === "ru";

  const t = isRu
    ? {
        back: "Назад к каталогу",
        loading: "Загружаем урок...",
        loadError: "Не удалось загрузить урок.",
        saveError: "Не удалось сохранить прогресс.",
        submitError: "Ответьте на все вопросы перед отправкой.",
        noVideo: "Видео пока не добавлено",
        watched: "Просмотрено",
        mark: "Отметить просмотренным",
        words: "Словарь",
        test: "Тест",
        review: "Разбор ответов",
        steps: "Прогресс урока",
        noWords: "Для этого урока слов пока нет.",
        noTest: "Для этого урока тест пока не добавлен.",
        submit: "Отправить тест",
        reset: "Сбросить",
        retry: "Пройти заново",
        answer: "Ваш ответ",
        correct: "Правильный ответ",
        explanation: "Пояснение",
        noAnswer: "Нет ответа",
        result: "Результат",
        allWordsReady:
          "Все слова изучены — можно переходить к тесту.",
        saving: "Сохраняем...",
        answered: "Отвечено",
        passThreshold: "Порог прохождения",
        checking: "Проверяем...",
        passed: "Тест пройден! 🎉",
        notPassed: "Тест пока не пройден",
        example: "Пример",
        video: "Видео",
        cinema: "Просмотр",
        vocabulary: "Словарь",
        mastery: "Тест",
        continue: "Продолжить",
        home: "На главную",
        prevQuestion: "Назад",
        nextQuestion: "Вперёд",
        question: "Вопрос",
        of: "из",
        unansweredHint:
          "Ответьте на все вопросы, чтобы отправить тест.",
      }
    : {
        back: "Каталогқа оралу",
        loading: "Сабақ жүктеліп жатыр...",
        loadError: "Сабақты жүктеу мүмкін болмады.",
        saveError: "Прогресті сақтау мүмкін болмады.",
        submitError:
          "Жіберер алдында барлық сұрақтарға жауап беріңіз.",
        noVideo: "Видео әлі қосылмаған",
        watched: "Көрілді",
        mark: "Көрілді деп белгілеу",
        words: "Сөздік",
        test: "Тест",
        review: "Жауаптарды талдау",
        steps: "Сабақ прогресі",
        noWords: "Бұл сабаққа сөздер әлі қосылмаған.",
        noTest: "Бұл сабаққа тест әлі қосылмаған.",
        submit: "Тестті жіберу",
        reset: "Тазарту",
        retry: "Қайта тапсыру",
        answer: "Сіздің жауабыңыз",
        correct: "Дұрыс жауап",
        explanation: "Түсіндірме",
        noAnswer: "Жауап жоқ",
        result: "Нәтиже",
        allWordsReady:
          "Барлық сөздер оқылды — тестке өтуге болады.",
        saving: "Сақталып жатыр...",
        answered: "Жауап берілді",
        passThreshold: "Өту шегі",
        checking: "Тексеріліп жатыр...",
        passed: "Тест сәтті өтті! 🎉",
        notPassed: "Тесттен әлі өтпедіңіз",
        example: "Мысал",
        video: "Видео",
        cinema: "Көру",
        vocabulary: "Сөздік",
        mastery: "Тест",
        continue: "Жалғастыру",
        home: "Басты бет",
        prevQuestion: "Артқа",
        nextQuestion: "Алға",
        question: "Сұрақ",
        of: "/",
        unansweredHint:
          "Тестті жіберу үшін барлық сұрақтарға жауап беріңіз.",
      };

  // ─── State ────────────────────────────────────────────────────────────────

  const [lessonData, setLessonData] =
    useState<LessonResponse | null>(null);

  const [words, setWords] = useState<VocabularyWord[]>([]);

  const [testData, setTestData] =
    useState<TestResponse | null>(null);

  const [answers, setAnswers] = useState<Record<number, number>>(
    {},
  );

  const [result, setResult] =
    useState<SubmitResult | null>(null);

  const [wordsReviewed, setWordsReviewed] = useState<
    Record<number, boolean>
  >({});

  const [videoWatched, setVideoWatched] = useState(false);

  const [step, setStep] = useState<LessonStep>("video");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ─── Refs ─────────────────────────────────────────────────────────────────

  const loadedForLessonId = useRef<number | null>(null);

  const mountedRef = useRef(true);

  const autoNextTimeoutRef = useRef<number | null>(null);

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (autoNextTimeoutRef.current) {
        window.clearTimeout(autoNextTimeoutRef.current);
      }
    };
  }, []);

  // ─── localStorage keys ────────────────────────────────────────────────────

  const lsKeyVideo = `lesson-${lesson.id}-video`;

  const lsKeyAnswers = `lesson-${lesson.id}-answers`;

  const lsKeyResult = `lesson-${lesson.id}-result`;

  const lsKeyWord = (wId: number) =>
    `lesson-${lesson.id}-word-${wId}`;

  // ─── Load lesson ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      loadedForLessonId.current = null;

      setResult(null);
      setAnswers({});
      setVideoWatched(false);
      setWordsReviewed({});
      setCurrentQuestion(0);
      setStep("video");

      setLoading(true);
      setError("");

      try {
        const [detailRes, wordsRes, testRes] = await Promise.all([
          api.get<LessonResponse>(`/lessons/${lesson.id}/`),
          api.get<VocabularyWord[]>(
            `/lessons/${lesson.id}/vocabulary/`,
          ),
          api.get<TestResponse>(`/lessons/${lesson.id}/test/`),
        ]);

        if (cancelled || !mountedRef.current) return;

        setLessonData(detailRes.data);

        setWords(wordsRes.data);

        setTestData(testRes.data);

        setVideoWatched(
          lsGet(lsKeyVideo) === "true" ||
            detailRes.data.progress >= 30,
        );

        const reviewed: Record<number, boolean> = {};

        wordsRes.data.forEach((word) => {
          reviewed[word.id] =
            lsGet(lsKeyWord(word.id)) === "true";
        });

        setWordsReviewed(reviewed);

        setAnswers(
          lsGetJson<Record<number, number>>(lsKeyAnswers) ?? {},
        );

        setResult(lsGetJson<SubmitResult>(lsKeyResult));

        loadedForLessonId.current = lesson.id;
      } catch (requestError) {
        if (!cancelled && mountedRef.current) {
          setError(
            extractApiErrorMessage(
              requestError,
              t.loadError,
            ),
          );
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [lesson.id, t.loadError]);

  // ─── Persist answers ──────────────────────────────────────────────────────

  useEffect(() => {
    if (
      loadedForLessonId.current === lesson.id &&
      Object.keys(answers).length > 0
    ) {
      lsSet(lsKeyAnswers, JSON.stringify(answers));
    }
  }, [answers, lesson.id, lsKeyAnswers]);

  // ─── Progress ─────────────────────────────────────────────────────────────

  const reviewedCount = Object.values(wordsReviewed).filter(
    Boolean,
  ).length;

  const wordsProgress = words.length
    ? (reviewedCount / words.length) * 100
    : 100;

  const progress = useMemo(() => {
    const videoPart = videoWatched ? 30 : 0;

    const wordsPart = words.length
      ? (reviewedCount / words.length) * 20
      : 20;

    const testPart = result?.passed
      ? 50
      : result
      ? Math.min(50, result.score_percent * 0.5)
      : 0;

    return Math.min(
      100,
      Math.round(videoPart + wordsPart + testPart),
    );
  }, [
    result,
    reviewedCount,
    videoWatched,
    words.length,
  ]);

  // ─── Save progress ────────────────────────────────────────────────────────

  const saveProgress = async (
    nextProgress: number,
    completed = false,
  ) => {
    if (!mountedRef.current) return;

    setSaving(true);

    try {
      const response = await api.post(
        `/lessons/${lesson.id}/progress/`,
        {
          progress: nextProgress,
          completed,
        },
      );

      if (!mountedRef.current) return;

      setLessonData((prev) =>
        prev
          ? {
              ...prev,
              progress: response.data.progress,
            }
          : prev,
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          extractApiErrorMessage(
            requestError,
            t.saveError,
          ),
        );
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  // ─── Auto save ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (lessonData && progress > lessonData.progress) {
      const timer = window.setTimeout(() => {
        void saveProgress(progress, progress >= 100);
      }, 700);

      return () => window.clearTimeout(timer);
    }
  }, [lessonData, progress]);

  // ─── Mark watched ─────────────────────────────────────────────────────────

  const markWatched = async () => {
    lsSet(lsKeyVideo, "true");

    setVideoWatched(true);

    await saveProgress(
      Math.max(30, lessonData?.progress ?? 0),
      false,
    );
  };

  // ─── Reset test ───────────────────────────────────────────────────────────

  const resetTest = () => {
    setAnswers({});

    setResult(null);

    setCurrentQuestion(0);

    setError("");

    lsRemove(lsKeyAnswers);

    lsRemove(lsKeyResult);
  };

  // ─── Submit test ──────────────────────────────────────────────────────────

  const submitTest = async () => {
    if (!testData) return;

    if (
      testData.questions.some((q) => !answers[q.id])
    ) {
      setError(t.submitError);
      return;
    }

    setSubmitting(true);

    setError("");

    try {
      const response = await api.post<SubmitResult>(
        `/lessons/${lesson.id}/test/submit/`,
        {
          answers: Object.entries(answers).map(
            ([qId, oId]) => ({
              question_id: Number(qId),
              option_id: Number(oId),
            }),
          ),
        },
      );

      if (!mountedRef.current) return;

      setResult(response.data);

      lsSet(
        lsKeyResult,
        JSON.stringify(response.data),
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          extractApiErrorMessage(
            requestError,
            t.submitError,
          ),
        );
      }
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary motion-reduce:animate-none" />
          <p className="text-muted-foreground">
            {t.loading}
          </p>
        </Card>
      </div>
    );
  }

  // ─── Derived values ───────────────────────────────────────────────────────

  const title =
    lessonData?.title ||
    lesson.title ||
    "Lesson";

  const description =
    lessonData?.description ||
    lesson.description ||
    "";

  const level =
    lessonData?.level ||
    lesson.level ||
    "A1";

  const duration =
    lessonData?.duration_minutes ||
    lesson.duration_minutes ||
    lesson.duration ||
    0;

  const youtubeId =
    lessonData?.youtube_id ||
    lesson.youtube_id ||
    "";

  const validQIds = new Set(
    testData?.questions.map((q) => q.id) ?? [],
  );

  const answeredCount = Object.keys(answers).filter(
    (id) => validQIds.has(Number(id)),
  ).length;

  const totalQuestions =
    testData?.questions.length ?? 0;

  const currentQ =
    testData?.questions[currentQuestion] ?? null;

  const allAnswered =
    totalQuestions > 0 &&
    answeredCount === totalQuestions;

  const videoComplete = videoWatched;

  const wordsComplete =
    words.length === 0 ||
    reviewedCount === words.length;

  const quizComplete = result !== null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"
      />

      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => onNavigate("catalog")}
      >
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </Button>

      {error ? (
        <Card
          className="mb-5 border-destructive/20 bg-destructive/10 text-destructive"
          role="alert"
        >
          {error}
        </Card>
      ) : null}

      {/* дальше ВЕСЬ остальной JSX оставляешь БЕЗ ИЗМЕНЕНИЙ */}
    </div>
  );
}