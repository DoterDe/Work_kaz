import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Trophy,
  Volume2,
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

type LessonStep = "video" | "words" | "quiz";

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
        ready: "Все слова изучены",
        saving: "Сохраняем...",
        answered: "Отвечено",
        passThreshold: "Порог прохождения",
        checking: "Проверяем...",
        passed: "Тест пройден",
        notPassed: "Тест пока не пройден",
        example: "Пример",
        video: "Видео",
        cinema: "Просмотр",
        vocabulary: "Практика слов",
        mastery: "Финальный тест",
        continue: "Продолжить",
        home: "На главную",
      }
    : {
        back: "Каталогқа оралу",
        loading: "Сабақ жүктеліп жатыр...",
        loadError: "Сабақты жүктеу мүмкін болмады.",
        saveError: "Прогресті сақтау мүмкін болмады.",
        submitError: "Тестті жіберу мүмкін болмады.",
        noVideo: "Видео әлі қосылмаған",
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
        ready: "Барлық сөздер оқылды",
        saving: "Сақталып жатыр...",
        answered: "Жауап берілді",
        passThreshold: "Өту шегі",
        checking: "Тексеріліп жатыр...",
        passed: "Тест сәтті өтті",
        notPassed: "Тесттен әлі өтпедіңіз",
        example: "Мысал",
        video: "Видео",
        cinema: "Көру",
        vocabulary: "Сөз жаттығуы",
        mastery: "Финал тест",
        continue: "Жалғастыру",
        home: "Басты бет",
      };

  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [wordsReviewed, setWordsReviewed] = useState<Record<number, boolean>>({});
  const [videoWatched, setVideoWatched] = useState(false);

  const [step, setStep] = useState<LessonStep>("video");
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const playerRef = useRef<HTMLIFrameElement | null>(null);

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
  }, [lesson.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!videoWatched) {
        window.localStorage.setItem(`lesson-${lesson.id}-video`, "true");
        setVideoWatched(true);
      }
    }, 20000);

    return () => window.clearTimeout(timer);
  }, []);

  const reviewedCount = Object.values(wordsReviewed).filter(Boolean).length;

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
  }, [result, reviewedCount, videoWatched, words.length]);

  const saveProgress = async (
    nextProgress: number,
    completed = false,
  ) => {
    setSaving(true);

    try {
      const response = await api.post(
        `/lessons/${lesson.id}/progress/`,
        {
          progress: nextProgress,
          completed,
        },
      );

      setLessonData((prev) =>
        prev
          ? {
              ...prev,
              progress: response.data.progress,
            }
          : prev,
      );
    } catch (requestError) {
      setError(
        extractApiErrorMessage(requestError, t.saveError),
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (lessonData && progress > lessonData.progress) {
      const timer = window.setTimeout(() => {
        void saveProgress(progress, progress >= 100);
      }, 600);

      return () => window.clearTimeout(timer);
    }
  }, [lessonData, progress]);

  const submitTest = async () => {
    if (!testData) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post<SubmitResult>(
        `/lessons/${lesson.id}/test/submit/`,
        {
          answers: Object.entries(answers).map(
            ([questionId, optionId]) => ({
              question_id: Number(questionId),
              option_id: optionId,
            }),
          ),
        },
      );

      setResult(response.data);
    } catch (requestError) {
      setError(
        extractApiErrorMessage(requestError, t.submitError),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {t.loading}
          </p>
        </Card>
      </div>
    );
  }

  const title = lessonData?.title || lesson.title || "Lesson";

  const description =
    lessonData?.description ||
    lesson.description ||
    "";

  const level =
    lessonData?.level || lesson.level || "A1";

  const duration =
    lessonData?.duration_minutes ||
    lesson.duration_minutes ||
    lesson.duration ||
    0;

  const youtubeId =
    lessonData?.youtube_id ||
    lesson.youtube_id ||
    "";

  const question =
    testData?.questions[currentQuestion];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => onNavigate("catalog")}
      >
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </Button>

      <div className="mb-8 flex flex-wrap gap-3">
        {[
          {
            key: "video",
            label: t.cinema,
          },
          {
            key: "words",
            label: t.vocabulary,
          },
          {
            key: "quiz",
            label: t.mastery,
          },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() =>
              setStep(item.key as LessonStep)
            }
            className={cn(
              "rounded-2xl border px-5 py-3 text-sm font-medium transition-all duration-300",
              step === item.key
                ? "border-primary bg-primary/15 text-primary shadow-[0_0_40px_rgba(99,102,241,0.28)]"
                : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.55fr]">
        <div>
          <AnimatePresence mode="wait">
            {step === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CardGlow className="relative overflow-hidden p-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-fuchsia-500/10 to-cyan-500/20 blur-[120px]" />

                  <div className="relative z-10">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <LevelBadge level={level} />
                      <span className="text-sm text-muted-foreground">
                        {formatMinutes(duration)}
                      </span>
                    </div>

                    <h1 className="mb-4 text-4xl font-bold leading-tight">
                      {title}
                    </h1>

                    <p className="mb-6 max-w-3xl leading-8 text-muted-foreground">
                      {description}
                    </p>

                    <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                      {youtubeId ? (
                        <iframe
                          ref={playerRef}
                          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                          title={title}
                          className="aspect-video w-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-black text-white">
                          {t.noVideo}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-primary">
                        <Volume2 className="h-5 w-5" />
                        {videoWatched
                          ? "90% completed"
                          : "Watching..."}
                      </div>

                      <Button
                        onClick={() => setStep("words")}
                        disabled={!videoWatched}
                      >
                        {t.continue}
                      </Button>
                    </div>
                  </div>
                </CardGlow>
              </motion.div>
            )}

            {step === "words" && (
              <motion.div
                key="words"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <CardGlow className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-semibold">
                      {t.words}
                    </h2>

                    <div className="w-52">
                      <ProgressBar
                        progress={wordsProgress}
                        color="secondary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {words.map((word) => (
                      <motion.div
                        key={word.id}
                        whileHover={{
                          rotateX: 6,
                          rotateY: -6,
                          scale: 1.02,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 18,
                        }}
                        className={cn(
                          "group relative overflow-hidden rounded-[2rem] border p-5 transition-all duration-300",
                          wordsReviewed[word.id]
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-border bg-card/70",
                        )}
                      >
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-cyan-500/10" />
                        </div>

                        <div className="relative z-10">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-2xl font-bold">
                                {word.word}
                              </h3>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {word.pronunciation}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                window.localStorage.setItem(
                                  `lesson-${lesson.id}-word-${word.id}`,
                                  "true",
                                );

                                setWordsReviewed(
                                  (prev) => ({
                                    ...prev,
                                    [word.id]: true,
                                  }),
                                );
                              }}
                              className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300",
                                wordsReviewed[word.id]
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                  : "border-border hover:border-primary hover:bg-primary/10",
                              )}
                            >
                              <CheckCircle2
                                className={cn(
                                  "h-5 w-5 transition-transform duration-300",
                                  wordsReviewed[word.id] &&
                                    "scale-110",
                                )}
                              />
                            </button>
                          </div>

                          <p className="text-lg font-medium">
                            {word.translation}
                          </p>

                          {word.example ? (
                            <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm leading-7 text-muted-foreground">
                              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary">
                                {t.example}
                              </p>

                              {word.example}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => setStep("quiz")}
                      disabled={
                        reviewedCount !== words.length
                      }
                    >
                      {t.continue}
                    </Button>
                  </div>
                </CardGlow>
              </motion.div>
            )}

            {step === "quiz" && testData && question && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <CardGlow className="p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-3xl font-semibold">
                      {t.test}
                    </h2>

                    <div className="flex gap-2">
                      {testData.questions.map(
                        (_, index) => (
                          <div
                            key={index}
                            className={cn(
                              "h-2 w-10 rounded-full transition-all duration-300",
                              currentQuestion ===
                                index
                                ? "bg-primary"
                                : answers[
                                    testData.questions[
                                      index
                                    ].id
                                  ]
                                ? "bg-secondary"
                                : "bg-border",
                            )}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={question.id}
                      initial={{
                        opacity: 0,
                        x: 40,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -40,
                      }}
                      className="rounded-[2rem] border border-border bg-card/60 p-8"
                    >
                      <p className="mb-8 text-2xl font-semibold leading-relaxed">
                        {currentQuestion + 1}.{" "}
                        {question.question_text}
                      </p>

                      <div className="space-y-3">
                        {question.options.map(
                          (option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setAnswers(
                                  (prev) => ({
                                    ...prev,
                                    [question.id]:
                                      option.id,
                                  }),
                                );

                                if (
                                  currentQuestion <
                                  testData.questions
                                    .length -
                                    1
                                ) {
                                  setTimeout(() => {
                                    setCurrentQuestion(
                                      (
                                        prev,
                                      ) =>
                                        prev +
                                        1,
                                    );
                                  }, 320);
                                }
                              }}
                              className={cn(
                                "w-full rounded-2xl border px-5 py-4 text-left text-lg transition-all duration-300",
                                answers[
                                  question.id
                                ] === option.id
                                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_35px_rgba(99,102,241,0.25)]"
                                  : "border-border hover:border-primary/30 hover:bg-primary/5",
                              )}
                            >
                              {
                                option.option_text
                              }
                            </button>
                          ),
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {Object.keys(answers).length ===
                    testData.question_count && (
                    <div className="mt-8 flex gap-3">
                      <Button
                        onClick={() =>
                          void submitTest()
                        }
                        loading={submitting}
                        loadingText={t.checking}
                      >
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        {t.submit}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnswers({});
                          setCurrentQuestion(0);
                        }}
                      >
                        {t.reset}
                      </Button>
                    </div>
                  )}
                </CardGlow>
              </motion.div>
            )}
          </AnimatePresence>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <CardGlow className="p-6">
                <div
                  className={cn(
                    "rounded-[2rem] border p-8 text-center",
                    result.passed
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-destructive/20 bg-destructive/10",
                  )}
                >
                  <div className="mb-4 flex justify-center">
                    {result.passed ? (
                      <Trophy className="h-12 w-12 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-12 w-12 text-destructive" />
                    )}
                  </div>

                  <h2 className="mb-3 text-4xl font-bold">
                    {result.passed
                      ? t.passed
                      : t.notPassed}
                  </h2>

                  <p className="text-lg text-muted-foreground">
                    {t.result}:{" "}
                    {result.score_percent}% (
                    {result.correct_answers}/
                    {result.total_questions})
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {!result.passed && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnswers({});
                          setResult(null);
                          setCurrentQuestion(0);
                        }}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t.retry}
                      </Button>
                    )}

                    <Button
                      onClick={() =>
                        onNavigate("home")
                      }
                    >
                      {t.home}
                    </Button>
                  </div>
                </div>
              </CardGlow>
            </motion.div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-5">
            <Card className="rounded-[2rem] border-border/60 bg-card/70 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t.steps}
                </span>

                <span className="text-xl font-bold text-primary">
                  {progress}%
                </span>
              </div>

              <ProgressBar
                progress={progress}
                color="primary"
              />

              <div className="mt-6 space-y-4">
                {[
                  {
                    label: t.video,
                    value: videoWatched
                      ? 100
                      : 0,
                  },
                  {
                    label: t.words,
                    value:
                      Math.round(
                        wordsProgress,
                      ),
                  },
                  {
                    label: t.test,
                    value: result
                      ? result.score_percent
                      : 0,
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full rounded-2xl border border-border/50 bg-background/40 p-4 text-left transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>
                        {item.label}
                      </span>

                      <span className="font-semibold text-primary">
                        {item.value}%
                      </span>
                    </div>

                    <ProgressBar
                      progress={item.value}
                      color="secondary"
                    />
                  </button>
                ))}
              </div>

              {saving && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {t.saving}
                </p>
              )}
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}