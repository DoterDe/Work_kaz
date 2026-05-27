import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
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

export function VideoLessonPage({ onNavigate, lesson }: VideoLessonPageProps) {
  const { language, formatMinutes } = useAppPreferences();
  const isRu = language === "ru";
  const t = isRu
    ? {
        back: "Назад к каталогу",
        loading: "Загружаем урок...",
        loadError: "Не удалось загрузить урок.",
        saveError: "Не удалось сохранить прогресс.",
        submitError: "Не удалось отправить тест.",
        noVideo: "Видео пока не добавлено",
        watched: "Просмотрено",
        mark: "Отметить просмотренным",
        words: "Словарь",
        test: "Тест",
        review: "Разбор",
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
        ready: "Слова отмечены, можно переходить к тесту.",
        saving: "Сохраняем...",
        answered: "Отвечено",
        passThreshold: "Порог прохождения",
        checking: "Проверяем...",
        passed: "Тест пройден",
        notPassed: "Тест пока не пройден",
        example: "Пример",
        video: "Видео",
      }
    : {
        back: "Каталогқа оралу",
        loading: "Сабақ жүктеліп жатыр...",
        loadError: "Сабақты жүктеу мүмкін болмады.",
        saveError: "Прогресті сақтау мүмкін болмады.",
        submitError: "Тестті жіберу мүмкін болмады.",
        noVideo: "Видео әлі қосылмаған",
        watched: "Көрілді",
        mark: "Көрілді деп белгілеу",
        words: "Сөздік",
        test: "Тест",
        review: "Талдау",
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
        ready: "Сөздер белгіленді, енді тестке өте аласыз.",
        saving: "Сақталып жатыр...",
        answered: "Жауап берілді",
        passThreshold: "Өту шегі",
        checking: "Тексеріліп жатыр...",
        passed: "Тест сәтті өтті",
        notPassed: "Тесттен әлі өтпедіңіз",
        example: "Мысал",
        video: "Видео",
      };

  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [wordsReviewed, setWordsReviewed] = useState<Record<number, boolean>>({});
  const [videoWatched, setVideoWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [detailRes, wordsRes, testRes] = await Promise.all([
          api.get<LessonResponse>(`/lessons/${lesson.id}/`),
          api.get<VocabularyWord[]>(`/lessons/${lesson.id}/vocabulary/`),
          api.get<TestResponse>(`/lessons/${lesson.id}/test/`),
        ]);
        setLessonData(detailRes.data);
        setWords(wordsRes.data);
        setTestData(testRes.data);
        setVideoWatched(
          window.localStorage.getItem(`lesson-${lesson.id}-video`) === "true" ||
            detailRes.data.progress >= 30,
        );
        const reviewed: Record<number, boolean> = {};
        wordsRes.data.forEach((word) => {
          reviewed[word.id] =
            window.localStorage.getItem(`lesson-${lesson.id}-word-${word.id}`) === "true";
        });
        setWordsReviewed(reviewed);
      } catch (requestError) {
        setError(extractApiErrorMessage(requestError, t.loadError));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [lesson.id, t.loadError]);

  const reviewedCount = Object.values(wordsReviewed).filter(Boolean).length;
  const wordsProgress = words.length ? (reviewedCount / words.length) * 100 : 100;
  const progress = useMemo(() => {
    const videoPart = videoWatched ? 30 : 0;
    const wordsPart = words.length ? (reviewedCount / words.length) * 20 : 20;
    const testPart = result?.passed ? 50 : result ? Math.min(50, result.score_percent * 0.5) : 0;
    return Math.min(100, Math.round(videoPart + wordsPart + testPart));
  }, [result, reviewedCount, videoWatched, words.length]);

  const saveProgress = async (nextProgress: number, completed = false) => {
    setSaving(true);
    try {
      const response = await api.post(`/lessons/${lesson.id}/progress/`, {
        progress: nextProgress,
        completed,
      });
      setLessonData((prev) => (prev ? { ...prev, progress: response.data.progress } : prev));
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, t.saveError));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (lessonData && progress > lessonData.progress) {
      const timer = window.setTimeout(() => {
        void saveProgress(progress, progress >= 100);
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [lessonData, progress]);

  const markWatched = async () => {
    window.localStorage.setItem(`lesson-${lesson.id}-video`, "true");
    setVideoWatched(true);
    await saveProgress(Math.max(30, lessonData?.progress || 0), false);
  };

  const submitTest = async () => {
    if (!testData || testData.questions.some((question) => !answers[question.id])) {
      setError(t.submitError);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post<SubmitResult>(`/lessons/${lesson.id}/test/submit/`, {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          question_id: Number(questionId),
          option_id: optionId,
        })),
      });
      setResult(response.data);
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, t.submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary motion-reduce:animate-none" />
          <p className="text-muted-foreground">{t.loading}</p>
        </Card>
      </div>
    );
  }

  const title = lessonData?.title || lesson.title || "Lesson";
  const description = lessonData?.description || lesson.description || "";
  const level = lessonData?.level || lesson.level || "A1";
  const duration = lessonData?.duration_minutes || lesson.duration_minutes || lesson.duration || 0;
  const youtubeId = lessonData?.youtube_id || lesson.youtube_id || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => onNavigate("catalog")}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t.back}
      </Button>

      {error ? (
        <Card className="mb-5 border-destructive/20 bg-destructive/10 text-destructive" role="alert">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.65fr_0.95fr]">
        <div>
          <CardGlow className="mb-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <h1 className="mb-3 text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
                  {title}
                </h1>
                <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <LevelBadge level={level} />
                  <span>{formatMinutes(duration)}</span>
                </div>
                <p className="leading-7 text-muted-foreground">{description}</p>
              </div>
              <div className="min-w-[220px] rounded-2xl border border-primary/15 bg-background/70 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{t.steps}</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <ProgressBar progress={progress} color="primary" />
                {saving ? <p className="mt-3 text-xs text-muted-foreground">{t.saving}</p> : null}
              </div>
            </div>
          </CardGlow>

          <Card padding="none" className="mb-5 overflow-hidden">
            <div className="relative aspect-video bg-black">
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`}
                  title={title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-white/80">
                  {t.noVideo}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <Button
                variant={videoWatched ? "primary" : "outline"}
                onClick={() => void markWatched()}
                disabled={videoWatched}
                className="gap-2"
              >
                {videoWatched ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                )}
                {videoWatched ? t.watched : t.mark}
              </Button>
            </div>
          </Card>

          <Card className="mb-5">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{t.words}</h2>
            {words.length === 0 ? (
              <div className="rounded-2xl bg-muted/30 p-6 text-center text-muted-foreground">
                {t.noWords}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      wordsReviewed[word.id]
                        ? "border-secondary/30 bg-secondary/5"
                        : "border-border bg-background/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">{word.word}</h3>
                        <p className="text-sm text-muted-foreground">{word.pronunciation || "-"}</p>
                        <p className="mt-2 font-medium text-foreground">{word.translation}</p>
                        {word.example ? (
                          <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm">
                            <p className="mb-1 text-xs uppercase text-muted-foreground">
                              {t.example}
                            </p>
                            <p>{word.example}</p>
                          </div>
                        ) : null}
                      </div>
                      <Button
                        variant={wordsReviewed[word.id] ? "primary" : "ghost"}
                        size="sm"
                        disabled={wordsReviewed[word.id]}
                        aria-label={word.word}
                        onClick={() => {
                          window.localStorage.setItem(`lesson-${lesson.id}-word-${word.id}`, "true");
                          setWordsReviewed((prev) => ({ ...prev, [word.id]: true }));
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {words.length > 0 && reviewedCount === words.length ? (
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                {t.ready}
              </div>
            ) : null}
          </Card>

          <Card className="mb-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-foreground">{t.test}</h2>
              {testData ? (
                <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                  {t.answered}: {Object.keys(answers).length}/{testData.question_count}
                </span>
              ) : null}
            </div>
            {!testData || testData.question_count === 0 ? (
              <div className="rounded-2xl bg-muted/30 p-6 text-center text-muted-foreground">
                {t.noTest}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {t.passThreshold}: {testData.pass_threshold}%
                </div>
                <div className="space-y-4">
                  {testData.questions.map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-border p-4">
                      <p className="mb-3 font-medium text-foreground">
                        {index + 1}. {question.question_text}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                            }
                            className={cn(
                              "interactive w-full rounded-xl border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                              answers[question.id] === option.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:bg-muted",
                            )}
                          >
                            {option.option_text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    onClick={() => void submitTest()}
                    disabled={submitting}
                    loading={submitting}
                    loadingText={t.checking}
                    className="gap-2"
                  >
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    {t.submit}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswers({});
                      setResult(null);
                    }}
                  >
                    {t.reset}
                  </Button>
                </div>
              </>
            )}
          </Card>

          {result ? (
            <Card>
              <div
                className={cn(
                  "mb-5 rounded-2xl border p-5 text-center",
                  result.passed
                    ? "border-secondary/20 bg-secondary/10"
                    : "border-destructive/20 bg-destructive/10",
                )}
              >
                <div className="mb-2 flex justify-center">
                  {result.passed ? (
                    <Trophy className="h-8 w-8 text-secondary" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
                  )}
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  {result.passed ? t.passed : t.notPassed}
                </h2>
                <p>
                  {t.result}: {result.score_percent}% ({result.correct_answers}/
                  {result.total_questions})
                </p>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-foreground">{t.review}</h3>
              <div className="space-y-4">
                {result.review.map((item, index) => (
                  <div
                    key={item.question_id}
                    className={cn(
                      "rounded-2xl border p-4",
                      item.is_correct
                        ? "border-secondary/20 bg-secondary/5"
                        : "border-destructive/20 bg-destructive/5",
                    )}
                  >
                    <p className="mb-3 font-medium text-foreground">
                      {index + 1}. {item.question_text}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">{t.answer}: </span>
                        <span className={item.is_correct ? "font-medium text-secondary" : "font-medium text-destructive"}>
                          {item.selected_option_text || t.noAnswer}
                        </span>
                      </p>
                      {!item.is_correct ? (
                        <p>
                          <span className="text-muted-foreground">{t.correct}: </span>
                          <span className="font-medium text-secondary">
                            {item.correct_option_text}
                          </span>
                        </p>
                      ) : null}
                      {item.explanation ? (
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="mb-1 text-xs uppercase text-muted-foreground">
                            {t.explanation}
                          </p>
                          <p>{item.explanation}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              {!result.passed ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswers({});
                      setResult(null);
                    }}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    {t.retry}
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card className="sticky top-24">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{t.video}</span>
              <span>{videoWatched ? "100%" : "0%"}</span>
            </div>
            <ProgressBar progress={videoWatched ? 100 : 0} color="primary" />
            <div className="mb-2 mt-4 flex items-center justify-between text-sm">
              <span>{t.words}</span>
              <span>{Math.round(wordsProgress)}%</span>
            </div>
            <ProgressBar progress={wordsProgress} color="secondary" />
            <div className="mb-2 mt-4 flex items-center justify-between text-sm">
              <span>{t.test}</span>
              <span>{result ? `${Math.round(result.score_percent)}%` : "0%"}</span>
            </div>
            <ProgressBar progress={result ? result.score_percent : 0} color="primary" />
          </Card>
        </aside>
      </div>
    </div>
  );
}import React, { useEffect, useMemo, useState } from "react";
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

// ─── localStorage helpers ─────────────────────────────────────────────────────

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
  } catch {
    // quota exceeded or private mode — silently skip
  }
}

function lsRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
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

export function VideoLessonPage({ onNavigate, lesson }: VideoLessonPageProps) {
  const { language, formatMinutes } = useAppPreferences();
  const isRu = language === "ru";

  const t = isRu
    ? {
        back: "Назад к каталогу",
        loading: "Загружаем урок...",
        loadError: "Не удалось загрузить урок.",
        saveError: "Не удалось сохранить прогресс.",
        // submitError: shown as inline hint, not as error card
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
        allWordsReady: "Все слова изучены — можно переходить к тесту.",
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
        unansweredHint: "Ответьте на все вопросы, чтобы отправить тест.",
      }
    : {
        back: "Каталогқа оралу",
        loading: "Сабақ жүктеліп жатыр...",
        loadError: "Сабақты жүктеу мүмкін болмады.",
        saveError: "Прогресті сақтау мүмкін болмады.",
        submitError: "Жіберер алдында барлық сұрақтарға жауап беріңіз.",
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
        allWordsReady: "Барлық сөздер оқылды — тестке өтуге болады.",
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
        unansweredHint: "Тестті жіберу үшін барлық сұрақтарға жауап беріңіз.",
      };

  // ─── State ─────────────────────────────────────────────────────────────────
  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [testData, setTestData] = useState<TestResponse | null>(null);

  // Answers saved to localStorage: survives page reloads, pre-fills on 2nd visit
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Result saved to localStorage: previous attempt visible on next visit
  const [result, setResult] = useState<SubmitResult | null>(null);

  const [wordsReviewed, setWordsReviewed] = useState<Record<number, boolean>>({});
  const [videoWatched, setVideoWatched] = useState(false);

  const [step, setStep] = useState<LessonStep>("video");

  // currentQuestion: which question card is shown in the stepper
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // localStorage keys scoped to this lesson
  const lsKeyVideo = `lesson-${lesson.id}-video`;
  const lsKeyAnswers = `lesson-${lesson.id}-answers`;
  const lsKeyResult = `lesson-${lesson.id}-result`;
  const lsKeyWord = (wordId: number) => `lesson-${lesson.id}-word-${wordId}`;

  // ─── Initial data load ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [detailRes, wordsRes, testRes] = await Promise.all([
          api.get<LessonResponse>(`/lessons/${lesson.id}/`),
          api.get<VocabularyWord[]>(`/lessons/${lesson.id}/vocabulary/`),
          api.get<TestResponse>(`/lessons/${lesson.id}/test/`),
        ]);

        setLessonData(detailRes.data);
        setWords(wordsRes.data);
        setTestData(testRes.data);

        // Video: restore from localStorage or from backend progress
        setVideoWatched(
          lsGet(lsKeyVideo) === "true" || detailRes.data.progress >= 30,
        );

        // Words: restore each word's reviewed state from localStorage
        const reviewed: Record<number, boolean> = {};
        wordsRes.data.forEach((word) => {
          reviewed[word.id] = lsGet(lsKeyWord(word.id)) === "true";
        });
        setWordsReviewed(reviewed);

        // Answers: restore previous selections so user sees their prior choices
        const savedAnswers = lsGetJson<Record<number, number>>(lsKeyAnswers);
        if (savedAnswers) setAnswers(savedAnswers);

        // Result: restore previous test result (score, review, passed flag)
        const savedResult = lsGetJson<SubmitResult>(lsKeyResult);
        if (savedResult) setResult(savedResult);
      } catch (requestError) {
        setError(extractApiErrorMessage(requestError, t.loadError));
      } finally {
        setLoading(false);
      }
    };
    void load();
    // t.loadError is a stable string derived from language; safe as dependency
  }, [lesson.id, t.loadError]);

  // Persist answers whenever they change (only if non-empty to avoid
  // overwriting restored state with an empty object on initial render)
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      lsSet(lsKeyAnswers, JSON.stringify(answers));
    }
  }, [answers, lsKeyAnswers]);

  // ─── Progress calculation ──────────────────────────────────────────────────
  const reviewedCount = Object.values(wordsReviewed).filter(Boolean).length;
  const wordsProgress = words.length ? (reviewedCount / words.length) * 100 : 100;

  const progress = useMemo(() => {
    const videoPart = videoWatched ? 30 : 0;
    const wordsPart = words.length ? (reviewedCount / words.length) * 20 : 20;
    const testPart = result?.passed
      ? 50
      : result
        ? Math.min(50, result.score_percent * 0.5)
        : 0;
    return Math.min(100, Math.round(videoPart + wordsPart + testPart));
  }, [result, reviewedCount, videoWatched, words.length]);

  // ─── Save progress to backend (debounced 700 ms) ──────────────────────────
  const saveProgress = async (nextProgress: number, completed = false) => {
    setSaving(true);
    try {
      const response = await api.post(`/lessons/${lesson.id}/progress/`, {
        progress: nextProgress,
        completed,
      });
      setLessonData((prev) =>
        prev ? { ...prev, progress: response.data.progress } : prev,
      );
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, t.saveError));
    } finally {
      setSaving(false);
    }
  };

  // Auto-save whenever computed progress exceeds what backend knows about
  useEffect(() => {
    if (lessonData && progress > lessonData.progress) {
      const timer = window.setTimeout(() => {
        void saveProgress(progress, progress >= 100);
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [lessonData, progress]);

  // ─── Mark video watched ────────────────────────────────────────────────────
  // Manual button only — no fake timers that create false progress
  const markWatched = async () => {
    lsSet(lsKeyVideo, "true");
    setVideoWatched(true);
    await saveProgress(Math.max(30, lessonData?.progress ?? 0), false);
  };

  // ─── Reset test completely ─────────────────────────────────────────────────
  const resetTest = () => {
    setAnswers({});
    setResult(null);
    setCurrentQuestion(0);
    setError("");
    lsRemove(lsKeyAnswers);
    lsRemove(lsKeyResult);
  };

  // ─── Submit test ───────────────────────────────────────────────────────────
  // Every question MUST have a selected answer before the request is sent.
  // The submit button is also disabled in the UI as a first guard, but we
  // validate here too so the backend never receives incomplete data.
  const submitTest = async () => {
    if (!testData) return;

    if (testData.questions.some((q) => !answers[q.id])) {
      setError(t.submitError);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await api.post<SubmitResult>(
        `/lessons/${lesson.id}/test/submit/`,
        {
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            question_id: Number(questionId),
            option_id: Number(optionId),
          })),
        },
      );
      setResult(response.data);
      // Persist so next visit still shows the score + review
      lsSet(lsKeyResult, JSON.stringify(response.data));
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, t.submitError));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary motion-reduce:animate-none" />
          <p className="text-muted-foreground">{t.loading}</p>
        </Card>
      </div>
    );
  }

  // ─── Derived display values ────────────────────────────────────────────────
  const title = lessonData?.title || lesson.title || "Lesson";
  const description = lessonData?.description || lesson.description || "";
  const level = lessonData?.level || lesson.level || "A1";
  const duration =
    lessonData?.duration_minutes || lesson.duration_minutes || lesson.duration || 0;
  const youtubeId = lessonData?.youtube_id || lesson.youtube_id || "";

  // Number of answers that belong to THIS lesson's questions
  const validQuestionIds = new Set(testData?.questions.map((q) => q.id) ?? []);
  const answeredCount = Object.keys(answers).filter((id) =>
    validQuestionIds.has(Number(id)),
  ).length;

  const totalQuestions = testData?.questions.length ?? 0;
  const currentQ = testData?.questions[currentQuestion] ?? null;
  const allQuestionsAnswered =
    totalQuestions > 0 && answeredCount === totalQuestions;

  // Tab completion indicators
  const videoComplete = videoWatched;
  const wordsComplete = words.length === 0 || reviewedCount === words.length;
  const quizComplete = result !== null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"
      />

      {/* Back button */}
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => onNavigate("catalog")}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t.back}
      </Button>

      {/* Error banner */}
      {error ? (
        <Card
          className="mb-5 border-destructive/20 bg-destructive/10 text-destructive"
          role="alert"
        >
          {error}
        </Card>
      ) : null}

      {/* ── Step tabs ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap gap-3">
        {(
          [
            { key: "video" as LessonStep, label: t.cinema, done: videoComplete },
            { key: "words" as LessonStep, label: t.vocabulary, done: wordsComplete },
            { key: "quiz" as LessonStep, label: t.mastery, done: quizComplete },
          ]
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStep(item.key)}
            className={cn(
              "relative flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium transition-all duration-300",
              step === item.key
                ? "border-primary bg-primary/15 text-primary shadow-[0_0_36px_rgba(99,102,241,0.25)]"
                : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            {item.label}
            {/* Green dot when step is completed */}
            {item.done && (
              <span
                aria-label="completed"
                className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_0.95fr]">
        {/* ── Main content ──────────────────────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">

            {/* ════════════════════════════════════════════════════════════
                VIDEO STEP
            ════════════════════════════════════════════════════════════ */}
            {step === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.28 }}
              >
                <CardGlow className="relative overflow-hidden p-6">
                  {/* Ambient video glow overlay */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/20 via-fuchsia-500/10 to-cyan-500/15 blur-[100px]"
                  />

                  <div className="relative z-10">
                    {/* Title + meta + mini progress */}
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <h1 className="mb-3 text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
                          {title}
                        </h1>
                        <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                          <LevelBadge level={level} />
                          <span>{formatMinutes(duration)}</span>
                        </div>
                        <p className="leading-7 text-muted-foreground">{description}</p>
                      </div>

                      <div className="min-w-[220px] rounded-2xl border border-primary/15 bg-background/70 p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>{t.steps}</span>
                          <span className="font-semibold text-primary">{progress}%</span>
                        </div>
                        <ProgressBar progress={progress} color="primary" />
                        {saving ? (
                          <p className="mt-3 text-xs text-muted-foreground">{t.saving}</p>
                        ) : null}
                      </div>
                    </div>

                    {/* YouTube player */}
                    <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                      {youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`}
                          title={title}
                          className="aspect-video w-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-black px-6 text-center text-white/70">
                          {t.noVideo}
                        </div>
                      )}
                    </div>

                    {/* Mark watched + continue */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant={videoWatched ? "primary" : "outline"}
                        onClick={() => void markWatched()}
                        disabled={videoWatched}
                        className="gap-2"
                      >
                        {videoWatched ? (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        )}
                        {videoWatched ? t.watched : t.mark}
                      </Button>

                      <Button
                        onClick={() => setStep("words")}
                        disabled={!videoWatched}
                        className="gap-2"
                      >
                        {t.continue}
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardGlow>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                WORDS STEP
            ════════════════════════════════════════════════════════════ */}
            {step === "words" && (
              <motion.div
                key="words"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <CardGlow className="p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold text-foreground">{t.words}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {reviewedCount}/{words.length}
                      </span>
                      <div className="w-40">
                        <ProgressBar progress={wordsProgress} color="secondary" />
                      </div>
                    </div>
                  </div>

                  {words.length === 0 ? (
                    <div className="rounded-2xl bg-muted/30 p-6 text-center text-muted-foreground">
                      {t.noWords}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {words.map((word) => {
                        const reviewed = !!wordsReviewed[word.id];
                        return (
                          <motion.div
                            key={word.id}
                            whileHover={{ rotateX: 4, rotateY: -4, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 250, damping: 18 }}
                            className={cn(
                              "group relative overflow-hidden rounded-[2rem] border p-5 transition-colors duration-300",
                              reviewed
                                ? "border-emerald-500/30 bg-emerald-500/8"
                                : "border-border bg-card/70",
                            )}
                          >
                            {/* Hover shimmer */}
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-cyan-500/8" />
                            </div>

                            <div className="relative z-10">
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-foreground">
                                    {word.word}
                                  </h3>
                                  {word.pronunciation ? (
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                      {word.pronunciation}
                                    </p>
                                  ) : null}
                                  <p className="mt-2 font-medium text-foreground">
                                    {word.translation}
                                  </p>
                                </div>

                                {/* Mark-learned button */}
                                <button
                                  type="button"
                                  disabled={reviewed}
                                  aria-label={`${word.word} — изучено`}
                                  onClick={() => {
                                    lsSet(lsKeyWord(word.id), "true");
                                    setWordsReviewed((prev) => ({ ...prev, [word.id]: true }));
                                  }}
                                  className={cn(
                                    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
                                    reviewed
                                      ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                                      : "border-border hover:border-primary hover:bg-primary/10",
                                  )}
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "h-5 w-5 transition-transform duration-300",
                                      reviewed && "scale-110",
                                    )}
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>

                              {word.example ? (
                                <div className="mt-3 rounded-2xl border border-white/5 bg-black/10 p-4 text-sm leading-7 text-muted-foreground">
                                  <p className="mb-1 text-xs uppercase tracking-widest text-primary">
                                    {t.example}
                                  </p>
                                  {word.example}
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* All-reviewed banner */}
                  {words.length > 0 && reviewedCount === words.length ? (
                    <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                      {t.allWordsReady}
                    </div>
                  ) : null}

                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => setStep("quiz")}
                      disabled={words.length > 0 && reviewedCount < words.length}
                      className="gap-2"
                    >
                      {t.continue}
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardGlow>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                QUIZ STEP
            ════════════════════════════════════════════════════════════ */}
            {step === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <CardGlow className="p-6">
                  {!testData || testData.question_count === 0 ? (
                    <div className="rounded-2xl bg-muted/30 p-6 text-center text-muted-foreground">
                      {t.noTest}
                    </div>
                  ) : (
                    <>
                      {/* Quiz header */}
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-2xl font-semibold text-foreground">{t.test}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {t.answered}: {answeredCount}/{testData.question_count}
                          </span>
                          <span>
                            {t.passThreshold}: {testData.pass_threshold}%
                          </span>
                        </div>
                      </div>

                      {/* Dot indicators — clickable, jump directly to any question */}
                      <div className="mb-6 flex flex-wrap gap-2">
                        {testData.questions.map((q, idx) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQuestion(idx)}
                            aria-label={`${t.question} ${idx + 1}`}
                            className={cn(
                              "h-2.5 rounded-full transition-all duration-300",
                              currentQuestion === idx
                                ? "w-8 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                                : answers[q.id]
                                  ? "w-2.5 bg-secondary"
                                  : "w-2.5 bg-border hover:bg-muted-foreground",
                            )}
                          />
                        ))}
                      </div>

                      {/* Animated question card */}
                      {currentQ && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentQ.id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.22 }}
                            className="rounded-[2rem] border border-border bg-card/60 p-6"
                          >
                            <p className="mb-6 text-lg font-semibold leading-relaxed text-foreground">
                              {currentQuestion + 1}. {currentQ.question_text}
                            </p>

                            <div className="space-y-3">
                              {currentQ.options.map((option) => {
                                const selected = answers[currentQ.id] === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [currentQ.id]: option.id,
                                      }));
                                      // Auto-advance to next question after a short delay
                                      if (currentQuestion < testData.questions.length - 1) {
                                        setTimeout(
                                          () => setCurrentQuestion((p) => p + 1),
                                          320,
                                        );
                                      }
                                    }}
                                    className={cn(
                                      "w-full rounded-2xl border px-5 py-4 text-left text-base outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring",
                                      selected
                                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_28px_rgba(99,102,241,0.2)]"
                                        : "border-border hover:border-primary/30 hover:bg-primary/5",
                                    )}
                                  >
                                    {option.option_text}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {/* Prev / position / Next navigation */}
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                          disabled={currentQuestion === 0}
                          className="gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          {t.prevQuestion}
                        </Button>

                        <span className="text-sm text-muted-foreground">
                          {t.question} {currentQuestion + 1} {t.of} {totalQuestions}
                        </span>

                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentQuestion((p) =>
                              Math.min(testData.questions.length - 1, p + 1),
                            )
                          }
                          disabled={currentQuestion === testData.questions.length - 1}
                          className="gap-2"
                        >
                          {t.nextQuestion}
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>

                      {/* Submit / Reset */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          onClick={() => void submitTest()}
                          // Button is disabled until every question has an answer.
                          // submitTest() also validates server-side as a second guard.
                          disabled={submitting || !allQuestionsAnswered}
                          loading={submitting}
                          loadingText={t.checking}
                          className="gap-2"
                        >
                          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                          {t.submit}
                        </Button>

                        <Button variant="outline" onClick={resetTest}>
                          {t.reset}
                        </Button>
                      </div>

                      {/* Hint: how many questions still unanswered */}
                      {!allQuestionsAnswered && answeredCount > 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {t.unansweredHint}
                        </p>
                      ) : null}
                    </>
                  )}
                </CardGlow>

                {/* ── RESULT — shown only inside the quiz step, only
                    after the real API response (or restored result).
                    The motion.div only runs its entry animation once,
                    when result changes from null → object. ────────── */}
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6"
                  >
                    <CardGlow className="p-6">
                      {/* Score banner */}
                      <div
                        className={cn(
                          "mb-6 rounded-[2rem] border p-8 text-center",
                          result.passed
                            ? "border-emerald-500/20 bg-emerald-500/10"
                            : "border-destructive/20 bg-destructive/10",
                        )}
                      >
                        <div className="mb-4 flex justify-center">
                          {result.passed ? (
                            <Trophy
                              className="h-12 w-12 text-emerald-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <AlertCircle
                              className="h-12 w-12 text-destructive"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-foreground">
                          {result.passed ? t.passed : t.notPassed}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                          {t.result}: {result.score_percent}% ({result.correct_answers}/
                          {result.total_questions})
                        </p>

                        {/* Action buttons */}
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                          {/* Retry — only shown when failed */}
                          {!result.passed ? (
                            <Button
                              variant="outline"
                              onClick={resetTest}
                              className="gap-2"
                            >
                              <RefreshCw className="h-4 w-4" aria-hidden="true" />
                              {t.retry}
                            </Button>
                          ) : null}

                          {/* Home — always shown after test completion */}
                          <Button
                            onClick={() => onNavigate("home")}
                            className="gap-2"
                          >
                            <Home className="h-4 w-4" aria-hidden="true" />
                            {t.home}
                          </Button>
                        </div>
                      </div>

                      {/* Detailed answer review */}
                      <h3 className="mb-4 text-xl font-semibold text-foreground">
                        {t.review}
                      </h3>
                      <div className="space-y-4">
                        {result.review.map((item, index) => (
                          <div
                            key={item.question_id}
                            className={cn(
                              "rounded-2xl border p-4",
                              item.is_correct
                                ? "border-secondary/20 bg-secondary/5"
                                : "border-destructive/20 bg-destructive/5",
                            )}
                          >
                            <p className="mb-3 font-medium text-foreground">
                              {index + 1}. {item.question_text}
                            </p>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-muted-foreground">{t.answer}: </span>
                                <span
                                  className={
                                    item.is_correct
                                      ? "font-medium text-secondary"
                                      : "font-medium text-destructive"
                                  }
                                >
                                  {item.selected_option_text || t.noAnswer}
                                </span>
                              </p>
                              {!item.is_correct ? (
                                <p>
                                  <span className="text-muted-foreground">
                                    {t.correct}:{" "}
                                  </span>
                                  <span className="font-medium text-secondary">
                                    {item.correct_option_text}
                                  </span>
                                </p>
                              ) : null}
                              {item.explanation ? (
                                <div className="rounded-xl bg-muted/40 p-3">
                                  <p className="mb-1 text-xs uppercase text-muted-foreground">
                                    {t.explanation}
                                  </p>
                                  <p>{item.explanation}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardGlow>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-5">
            <Card className="rounded-[2rem] border-border/60 bg-card/70 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.steps}</span>
                <span className="text-xl font-bold text-primary">{progress}%</span>
              </div>
              <ProgressBar progress={progress} color="primary" />

              <div className="mt-6 space-y-4">
                {/* Sidebar step cards — clicking navigates to that step */}
                {(
                  [
                    {
                      key: "video" as LessonStep,
                      label: t.video,
                      value: videoWatched ? 100 : 0,
                    },
                    {
                      key: "words" as LessonStep,
                      label: t.words,
                      value: Math.round(wordsProgress),
                    },
                    {
                      key: "quiz" as LessonStep,
                      label: t.test,
                      value: result ? Math.round(result.score_percent) : 0,
                    },
                  ]
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStep(item.key)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all duration-300",
                      step === item.key
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/50 bg-background/40 hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-semibold text-primary">{item.value}%</span>
                    </div>
                    <ProgressBar progress={item.value} color="secondary" />
                  </button>
                ))}
              </div>

              {saving ? (
                <p className="mt-4 text-xs text-muted-foreground">{t.saving}</p>
              ) : null}
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
