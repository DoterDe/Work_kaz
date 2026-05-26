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
}
