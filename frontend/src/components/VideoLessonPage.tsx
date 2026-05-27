import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Loader2,
  PlayCircle,
  RefreshCw,
  Trophy,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        goHome: "На главную",
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
        goHome: "Басты бетке",
      };

  // Состояния
  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [testData, setTestData] | null = useState<TestResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [wordsReviewed, setWordsReviewed] = useState<Record<number, boolean>>({});
  const [videoWatched, setVideoWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"video" | "vocab" | "test">("video");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // Реф для звукового контекста (один на весь компонент)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Вспомогательные переменные (должны быть до условных вызовов)
  const youtubeId = lessonData?.youtube_id || lesson.youtube_id || "";
  const title = lessonData?.title || lesson.title || "Lesson";
  const description = lessonData?.description || lesson.description || "";
  const level = lessonData?.level || lesson.level || "A1";
  const duration = lessonData?.duration_minutes || lesson.duration_minutes || lesson.duration || 0;

  // Функция звукового отклика
  const playUiSound = useCallback((type: "click" | "submit" | "success") => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.connect(gain);
    switch (type) {
      case "click":
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
        break;
      case "submit":
        osc.frequency.value = 440;
        osc.type = "square";
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
        break;
      case "success":
        osc.frequency.value = 1046.5;
        osc.type = "sine";
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
        break;
    }
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  // Автоматическое сохранение прогресса видео (вызывается из плеера)
  const markWatchedAutomatically = useCallback(async () => {
    if (videoWatched) return;
    window.localStorage.setItem(`lesson-${lesson.id}-video`, "true");
    setVideoWatched(true);
    await saveProgress(Math.max(30, lessonData?.progress || 0), false);
    playUiSound("click");
  }, [videoWatched, lesson.id, lessonData, playUiSound]);

  // Подсчёт прогресса
  const reviewedCount = Object.values(wordsReviewed).filter(Boolean).length;
  const wordsProgress = words.length ? (reviewedCount / words.length) * 100 : 100;
  const overallProgress = useMemo(() => {
    const videoPart = videoWatched ? 30 : 0;
    const wordsPart = words.length ? (reviewedCount / words.length) * 20 : 20;
    const testPart = result?.passed ? 50 : result ? Math.min(50, result.score_percent * 0.5) : 0;
    return Math.min(100, Math.round(videoPart + wordsPart + testPart));
  }, [result, reviewedCount, videoWatched, words.length]);

  // Сохранение прогресса на бэкенд
  const saveProgress = useCallback(async (nextProgress: number, completed = false) => {
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
  }, [lesson.id, t.saveError]);

  // Автосохранение при изменении прогресса
  useEffect(() => {
    if (lessonData && overallProgress > lessonData.progress) {
      const timer = setTimeout(() => {
        saveProgress(overallProgress, overallProgress >= 100);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [lessonData, overallProgress, saveProgress]);

  // Загрузка данных урока
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
        const videoFlag = window.localStorage.getItem(`lesson-${lesson.id}-video`) === "true";
        setVideoWatched(videoFlag || detailRes.data.progress >= 30);
        const reviewed: Record<number, boolean> = {};
        wordsRes.data.forEach((word) => {
          reviewed[word.id] = window.localStorage.getItem(`lesson-${lesson.id}-word-${word.id}`) === "true";
        });
        setWordsReviewed(reviewed);
      } catch (requestError) {
        setError(extractApiErrorMessage(requestError, t.loadError));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lesson.id, t.loadError]);

  // Инициализация YouTube плеера с автоотслеживанием
  useEffect(() => {
    if (!youtubeId) return;
    const loadYouTubeAPI = () => {
      if ((window as any).YT) {
        initPlayer();
        return;
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    };
    const initPlayer = () => {
      const newPlayer = new (window as any).YT.Player("youtube-player", {
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              const interval = setInterval(() => {
                const current = event.target.getCurrentTime();
                const duration = event.target.getDuration();
                if (duration && current / duration >= 0.9 && !videoWatched) {
                  clearInterval(interval);
                  markWatchedAutomatically();
                }
              }, 1000);
            }
          },
        },
      });
      setPlayer(newPlayer);
    };
    loadYouTubeAPI();
  }, [youtubeId, videoWatched, markWatchedAutomatically]);

  const handleWordReview = (wordId: number) => {
    playUiSound("click");
    window.localStorage.setItem(`lesson-${lesson.id}-word-${wordId}`, "true");
    setWordsReviewed((prev) => ({ ...prev, [wordId]: true }));
  };

  const submitTest = async () => {
    if (!testData || testData.questions.some((q) => !answers[q.id])) {
      setError(t.submitError);
      return;
    }
    playUiSound("submit");
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post<SubmitResult>(`/lessons/${lesson.id}/test/submit/`, {
        answers: Object.entries(answers).map(([qId, oId]) => ({
          question_id: Number(qId),
          option_id: oId,
        })),
      });
      setResult(response.data);
      playUiSound("success");
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, t.submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    playUiSound("click");
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (currentQuestionIndex + 1 < (testData?.questions.length || 0)) {
      setTimeout(() => setCurrentQuestionIndex((i) => i + 1), 300);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const currentQuestion = testData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex + 1 === (testData?.question_count || 0);
  const allWordsReviewed = words.length > 0 && reviewedCount === words.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => onNavigate("catalog")}>
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </Button>

      {error && (
        <Card className="mb-5 border-destructive/20 bg-destructive/10 text-destructive" role="alert">
          {error}
        </Card>
      )}

      {/* Степпер */}
      <div className="mb-6 flex justify-between gap-2 border-b border-border pb-2">
        {(["video", "vocab", "test"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab === "vocab" && !videoWatched) return;
              if (tab === "test" && !allWordsReviewed) return;
              setActiveTab(tab);
              scrollTo(tab);
            }}
            className={cn(
              "flex-1 rounded-xl py-2 text-center font-medium transition",
              activeTab === tab
                ? "bg-primary/10 text-primary"
                : videoWatched || tab === "video"
                ? "text-muted-foreground hover:bg-muted"
                : "cursor-not-allowed text-muted-foreground/30",
            )}
          >
            {tab === "video" && t.video}
            {tab === "vocab" && t.words}
            {tab === "test" && t.test}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_0.95fr]">
        <div id="video" className="scroll-mt-24">
          {/* Эмбиент-свечение */}
          <div className="relative mb-5" ref={videoContainerRef}>
            <div className="absolute -inset-10 z-0 bg-gradient-to-tr from-primary/30 via-secondary/20 to-transparent blur-[100px] opacity-60 pointer-events-none" />
            <CardGlow className="relative z-10 p-0 overflow-hidden">
              <div className="aspect-video bg-black">
                {youtubeId ? (
                  <iframe
                    id="youtube-player"
                    src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0&enablejsapi=1`}
                    title={title}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/80">{t.noVideo}</div>
                )}
              </div>
            </CardGlow>
          </div>

          {/* Словарь */}
          <div id="vocab" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{t.words}</h2>
            {words.length === 0 ? (
              <div className="rounded-2xl bg-muted/30 p-6 text-center text-muted-foreground">{t.noWords}</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {words.map((word) => (
                  <CardGlow
                    key={word.id}
                    className={cn(
                      "transition-all duration-200",
                      wordsReviewed[word.id] && "border-secondary/30 bg-secondary/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">{word.word}</h3>
                        <p className="text-sm text-muted-foreground">{word.pronunciation || "-"}</p>
                        <p className="mt-2 font-medium text-foreground">{word.translation}</p>
                        {word.example && (
                          <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm">
                            <p className="mb-1 text-xs uppercase text-muted-foreground">{t.example}</p>
                            <p>{word.example}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant={wordsReviewed[word.id] ? "primary" : "ghost"}
                        size="sm"
                        disabled={wordsReviewed[word.id]}
                        onClick={() => handleWordReview(word.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardGlow>
                ))}
              </div>
            )}
            {allWordsReviewed && words.length > 0 && (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                {t.ready}
              </div>
            )}
          </div>

          {/* Тест – по одному вопросу */}
          <div id="test" className="scroll-mt-24">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">{t.test}</h2>
              {testData && <div className="text-sm text-muted-foreground">{t.passThreshold}: {testData.pass_threshold}%</div>}
            </div>
            {!testData || testData.question_count === 0 ? (
              <div className="rounded-2xl bg-muted/30 p-6 text-center text-muted-foreground">{t.noTest}</div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardGlow className="p-6">
                      <p className="mb-4 text-lg font-medium text-foreground">
                        {currentQuestionIndex + 1}. {currentQuestion?.question_text}
                      </p>
                      <div className="space-y-3">
                        {currentQuestion?.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                            className={cn(
                              "w-full rounded-xl border px-5 py-3 text-left transition-all hover:bg-muted",
                              answers[currentQuestion.id] === opt.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border",
                            )}
                          >
                            {opt.option_text}
                          </button>
                        ))}
                      </div>
                    </CardGlow>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {Array.from({ length: testData.question_count }).map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-2 w-6 rounded-full transition-all",
                          idx <= currentQuestionIndex ? "bg-primary" : "bg-border",
                        )}
                      />
                    ))}
                  </div>
                  {isLastQuestion && (
                    <Button onClick={submitTest} disabled={submitting} loading={submitting}>
                      {t.submit}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Результаты теста и кнопка домой */}
          {result && (
            <Card className="mt-5">
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
                    <Trophy className="h-8 w-8 text-secondary" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  )}
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  {result.passed ? t.passed : t.notPassed}
                </h2>
                <p>
                  {t.result}: {result.score_percent}% ({result.correct_answers}/{result.total_questions})
                </p>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-foreground">{t.review}</h3>
              <div className="space-y-4">
                {result.review.map((item, idx) => (
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
                      {idx + 1}. {item.question_text}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">{t.answer}: </span>
                        <span
                          className={item.is_correct ? "font-medium text-secondary" : "font-medium text-destructive"}
                        >
                          {item.selected_option_text || t.noAnswer}
                        </span>
                      </p>
                      {!item.is_correct && (
                        <p>
                          <span className="text-muted-foreground">{t.correct}: </span>
                          <span className="font-medium text-secondary">{item.correct_option_text}</span>
                        </p>
                      )}
                      {item.explanation && (
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="mb-1 text-xs uppercase text-muted-foreground">{t.explanation}</p>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!result.passed && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswers({});
                      setResult(null);
                      setCurrentQuestionIndex(0);
                    }}
                  >
                    {t.retry}
                  </Button>
                </div>
              )}
              {overallProgress >= 100 && (
                <div className="mt-6 text-center">
                  <Button onClick={() => onNavigate("home")} variant="primary" className="gap-2">
                    <Home className="h-4 w-4" />
                    {t.goHome}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Сайдбар */}
        <aside className="space-y-5">
          <Card className="sticky top-24">
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => scrollTo("video")}
                  className="flex w-full items-center justify-between text-sm hover:text-primary"
                >
                  <span>{t.video}</span>
                  <span>{videoWatched ? "100%" : "0%"}</span>
                </button>
                <ProgressBar progress={videoWatched ? 100 : 0} color="primary" />
              </div>
              <div>
                <button
                  onClick={() => scrollTo("vocab")}
                  className="flex w-full items-center justify-between text-sm hover:text-primary"
                >
                  <span>{t.words}</span>
                  <span>{Math.round(wordsProgress)}%</span>
                </button>
                <ProgressBar progress={wordsProgress} color="secondary" />
              </div>
              <div>
                <button
                  onClick={() => scrollTo("test")}
                  className="flex w-full items-center justify-between text-sm hover:text-primary"
                >
                  <span>{t.test}</span>
                  <span>{result ? `${Math.round(result.score_percent)}%` : "0%"}</span>
                </button>
                <ProgressBar progress={result ? result.score_percent : 0} color="primary" />
              </div>
            </div>
            {saving && <p className="mt-3 text-xs text-muted-foreground">{t.saving}</p>}
          </Card>
        </aside>
      </div>
    </div>
  );
}