import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ChevronLeft, ClipboardCheck, PlayCircle, 
  Award, Brain, BookOpen, Clock, Star, TrendingUp, 
  AlertCircle, ThumbsUp, ThumbsDown, BarChart3, 
  Target, Trophy, Zap, Calendar, Layers,
  ChevronRight, Loader2, XCircle, RefreshCw
} from "lucide-react";

import api from "../api/axios";
import { extractApiErrorMessage } from "../utils/apiError";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { LevelBadge } from "./ui/LevelBadge";
import { ProgressBar } from "./ui/ProgressBar";

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
  duration: number;
  duration_minutes: number;
  youtube_id: string;
  progress: number;
  category: string;
}

interface VocabularyWord {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  partOfSpeech?: string;
}

interface TestOption {
  id: number;
  option_text: string;
  is_correct?: boolean;
}

interface TestQuestion {
  id: number;
  order: number;
  question_text: string;
  options: TestOption[];
  explanation?: string;
}

interface TestResponse {
  lesson_id: number;
  lesson_title: string;
  pass_threshold: number;
  question_count: number;
  questions: TestQuestion[];
}

interface SubmitResult {
  score_percent: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  progress: number;
  completed: boolean;
}

interface AnswerReview {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

type Tab = "overview" | "vocabulary" | "test" | "results";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Обзор", icon: BookOpen },
  { id: "vocabulary", label: "Словарь", icon: Brain },
  { id: "test", label: "Тест", icon: ClipboardCheck },
];

export function VideoLessonPage({ onNavigate, lesson }: VideoLessonPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [answerReview, setAnswerReview] = useState<AnswerReview[]>([]);
  const [videoWatched, setVideoWatched] = useState(false);
  const [wordsReviewed, setWordsReviewed] = useState<Record<number, boolean>>({});
  
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = useCallback(() => {
    setTimeout(() => {
      if (videoContainerRef.current) {
        videoContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  const handleNavigateToCatalog = () => onNavigate("catalog");
  const handleBackToOverview = () => {
    setActiveTab("overview");
    scrollToVideo();
  };

  useEffect(() => {
    setActiveTab("overview");
    setAnswers({});
    setResult(null);
    setAnswerReview([]);
    scrollToVideo();
    
    const loadLessonData = async () => {
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
        
        const initialReviewed: Record<number, boolean> = {};
        wordsRes.data.forEach(word => {
          const saved = localStorage.getItem(`word_${lesson.id}_${word.id}`);
          initialReviewed[word.id] = saved === "true";
        });
        setWordsReviewed(initialReviewed);
        
        if (detailRes.data.progress >= 100) {
          setResult({ 
            passed: true, 
            progress: 100, 
            completed: true,
            score_percent: 100,
            correct_answers: 0,
            total_questions: 0
          });
        }
      } catch (error) {
        setError(extractApiErrorMessage(error, "Не удалось загрузить данные урока."));
      } finally {
        setLoading(false);
      }
    };
    loadLessonData();
  }, [lesson.id]);

  const videoProgressValue = videoWatched ? 100 : 0;
  const videoContribution = videoWatched ? 30 : 0;
  
  const wordsMasteredPercent = words.length > 0 
    ? (Object.values(wordsReviewed).filter(Boolean).length / words.length) * 100 
    : 100;
  const wordsContribution = words.length > 0 
    ? (Object.values(wordsReviewed).filter(Boolean).length / words.length) * 20 
    : 20;
  
  const testContribution = result?.passed ? 50 : (result?.score_percent || 0) * 0.5;
  
  const overallProgress = useMemo(() => {
    return Math.min(100, Math.round(videoContribution + wordsContribution + testContribution));
  }, [videoContribution, wordsContribution, testContribution]);

  const saveProgress = useCallback(async (progress: number, completed = false) => {
    setSavingProgress(true);
    try {
      const res = await api.post(`/lessons/${lesson.id}/progress/`, { progress, completed });
      setLessonData((prev) => prev ? { ...prev, progress: res.data.progress } : prev);
    } catch (error) {
      setError(extractApiErrorMessage(error, "Не удалось сохранить прогресс."));
    } finally {
      setSavingProgress(false);
    }
  }, [lesson.id]);

  useEffect(() => {
    if (!lessonData) return;
    if (overallProgress > (lessonData.progress || 0)) {
      const timeoutId = setTimeout(() => {
        saveProgress(overallProgress, overallProgress >= 100);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [overallProgress, lessonData, saveProgress]);

  const handleVideoWatched = async () => {
    setVideoWatched(true);
    await saveProgress(30, false);
  };

  const handleWordReview = (wordId: number) => {
    setWordsReviewed(prev => {
      const newState = { ...prev, [wordId]: true };
      localStorage.setItem(`word_${lesson.id}_${wordId}`, "true");
      const reviewedCount = Object.values(newState).filter(Boolean).length;
      if (reviewedCount === words.length && words.length > 0) {
        saveProgress(50, false);
      }
      return newState;
    });
  };

  const submitTest = async () => {
    if (!testData) return;
    
    const unansweredCount = testData.questions.filter(q => !answers[q.id]).length;
    if (unansweredCount > 0) {
      setError(`Пожалуйста, ответьте на ${unansweredCount} оставшихся вопросов.`);
      return;
    }
    
    const payload = {
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: Number(questionId),
        option_id: optionId,
      })),
    };

    setSubmittingTest(true);
    setError("");
    try {
      const res = await api.post<SubmitResult>(`/lessons/${lesson.id}/test/submit/`, payload);
      
      const review: AnswerReview[] = testData.questions.map((question) => {
        const userOptionId = answers[question.id];
        const userOption = question.options.find(opt => opt.id === userOptionId);
        const correctOption = question.options.find(opt => opt.is_correct);
        
        return {
          questionId: question.id,
          questionText: question.question_text,
          userAnswer: userOption?.option_text || "Не отвечено",
          correctAnswer: correctOption?.option_text || "Не указан",
          isCorrect: userOptionId === correctOption?.id,
          explanation: question.explanation
        };
      });
      
      setAnswerReview(review);
      setResult(res.data);
      setLessonData((prev) => prev ? { ...prev, progress: res.data.progress } : prev);
      setActiveTab("results");
      scrollToVideo();
      
    } catch (error) {
      setError(extractApiErrorMessage(error, "Не удалось отправить тест."));
    } finally {
      setSubmittingTest(false);
    }
  };

  const resetTest = () => {
    setAnswers({});
    setResult(null);
    setAnswerReview([]);
    setActiveTab("test");
    scrollToVideo();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Загрузка урока...</p>
        </div>
      </div>
    );
  }

  const title = lessonData?.title || lesson.title || "Lesson";
  const level = lessonData?.level || lesson.level || "A1";
  const description = lessonData?.description || lesson.description || "";
  const duration = lessonData?.duration_minutes || lesson.duration_minutes || lesson.duration || 0;
  const youtubeId = lessonData?.youtube_id || lesson.youtube_id || "";

  const totalWords = words.length;
  const reviewedCount = Object.values(wordsReviewed).filter(Boolean).length;
  const correctAnswersCount = answerReview.filter(a => a.isCorrect).length;
  const testScorePercent = result?.score_percent || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={handleNavigateToCatalog}>
        <ChevronLeft className="h-5 w-5" /> Назад к каталогу
      </Button>

      {error && (
        <Card className="mb-4 rounded-2xl border-destructive/20 bg-destructive/10 p-4 text-destructive">
          {error}
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div ref={videoContainerRef}>
              <Card className="mb-6 overflow-hidden rounded-[28px] p-0">
                <div className="relative aspect-video bg-black">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`}
                      title={title}
                      className="h-full w-full"
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/80">
                      Видео еще не добавлено для этого урока
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <Button
                    variant={videoWatched ? "primary" : "outline"}
                    onClick={handleVideoWatched}
                    disabled={videoWatched}
                    className="gap-2"
                  >
                    {videoWatched ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Просмотрено
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        Отметить просмотренным
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setActiveTab("test")} disabled={!videoWatched} className="gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Перейти к тесту
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>

            <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "vocabulary" && reviewedCount === totalWords && totalWords > 0 && (
                    <CheckCircle2 className="h-3 w-3 text-secondary" />
                  )}
                  {tab.id === "test" && result?.passed && (
                    <CheckCircle2 className="h-3 w-3 text-secondary" />
                  )}
                </button>
              ))}
              {result && (
                <button
                  onClick={() => setActiveTab("results")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "results"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Результаты
                </button>
              )}
            </div>

            {activeTab === "overview" && (
              <Card className="rounded-[28px]">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <div className="mt-2 flex items-center gap-3">
                      <LevelBadge level={level} />
                      <span className="text-sm text-muted-foreground">Продолжительность: {duration} мин</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
                    <p className="text-xs text-muted-foreground">общий прогресс</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{description || "Нет описания"}</p>
                
                <div className="mt-6 rounded-2xl bg-muted/30 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Target className="h-4 w-4" />
                    Цели урока
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      {videoWatched ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-primary" />
                      )}
                      <span className={videoWatched ? "line-through text-muted-foreground" : ""}>
                        Просмотреть видео (30% к прогрессу)
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {reviewedCount === totalWords && totalWords > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : totalWords === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-primary" />
                      )}
                      <span className={reviewedCount === totalWords && totalWords > 0 ? "line-through text-muted-foreground" : ""}>
                        Изучить слова ({reviewedCount}/{totalWords}) (20% к прогрессу)
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {result?.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : result ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-primary" />
                      )}
                      <span className={result?.passed ? "line-through text-muted-foreground" : ""}>
                        Пройти итоговый тест (50% к прогрессу)
                      </span>
                    </li>
                  </ul>
                </div>
              </Card>
            )}

            {activeTab === "vocabulary" && (
              <Card className="rounded-[28px]">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Словарь урока</h2>
                    <p className="text-sm text-muted-foreground">Изучите новые слова перед тестом</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{reviewedCount}/{totalWords}</p>
                    <p className="text-xs text-muted-foreground">слов изучено</p>
                  </div>
                </div>
                
                {words.length === 0 ? (
                  <div className="rounded-2xl bg-muted/30 p-8 text-center">
                    <Brain className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет слов для этого урока</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {words.map((word) => (
                      <div
                        key={word.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          wordsReviewed[word.id]
                            ? "border-secondary/30 bg-secondary/5"
                            : "border-border hover:border-primary/30 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-bold">{word.word}</h3>
                              {word.partOfSpeech && (
                                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                                  {word.partOfSpeech}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{word.pronunciation || "-"}</p>
                            <p className="mt-2 text-base font-medium">{word.translation}</p>
                            {word.example && (
                              <div className="mt-2 rounded-lg bg-muted/20 p-2">
                                <p className="text-xs text-muted-foreground">Пример:</p>
                                <p className="text-sm italic">"{word.example}"</p>
                              </div>
                            )}
                          </div>
                          {!wordsReviewed[word.id] ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWordReview(word.id)}
                              className="h-9 w-9 rounded-full p-0"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20">
                              <CheckCircle2 className="h-5 w-5 text-secondary" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {reviewedCount === totalWords && totalWords > 0 && !result?.passed && (
                  <div className="mt-6 rounded-2xl bg-primary/10 p-4 text-center">
                    <p className="font-medium">Все слова изучены. Теперь вы готовы к тесту.</p>
                    <Button className="mt-3" onClick={() => setActiveTab("test")}>
                      Перейти к тесту
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "test" && (
              <Card className="rounded-[28px]">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Итоговый тест</h2>
                    <p className="text-sm text-muted-foreground">
                      Для прохождения необходимо набрать {testData?.pass_threshold}%
                    </p>
                  </div>
                  {result?.passed && (
                    <div className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">
                      <CheckCircle2 className="mr-1 inline h-4 w-4" />
                      Пройден
                    </div>
                  )}
                </div>

                {result?.passed ? (
                  <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-8 text-center">
                    <Trophy className="mx-auto mb-4 h-16 w-16 text-secondary" />
                    <h3 className="mb-2 text-2xl font-bold">Тест пройден</h3>
                    <p className="text-lg">
                      Результат: {result.score_percent}% ({result.correct_answers}/{result.total_questions})
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => setActiveTab("results")}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Детальный разбор
                      </Button>
                      <Button variant="outline" onClick={handleNavigateToCatalog}>
                        Вернуться к урокам
                      </Button>
                    </div>
                  </div>
                ) : !testData || testData.question_count === 0 ? (
                  <div className="rounded-2xl bg-muted/30 p-8 text-center">
                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Тест еще не добавлен для этого урока</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between rounded-2xl bg-muted/30 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        <span>Порог прохождения: {testData.pass_threshold}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Вопросов: {testData.question_count}</span>
                        <span className="text-primary">• Отвечено: {Object.keys(answers).length}</span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {testData.questions.map((question, idx) => (
                        <div key={question.id} className="rounded-2xl border border-border p-5">
                          <p className="mb-4 font-medium">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mr-2">
                              {idx + 1}
                            </span>
                            {question.question_text}
                          </p>
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => setAnswers(prev => ({ ...prev, [question.id]: option.id }))}
                                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                                  answers[question.id] === option.id
                                    ? "border-primary bg-primary/10 shadow-sm"
                                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                                }`}
                              >
                                <span className="text-sm">{option.option_text}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button onClick={submitTest} disabled={submittingTest} className="flex-1 gap-2">
                        {submittingTest ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Проверка...
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="h-4 w-4" />
                            Отправить тест
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setAnswers({})} disabled={submittingTest}>
                        Сбросить всё
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}

            {activeTab === "results" && result && (
              <Card className="rounded-[28px]">
                <div className="mb-6 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Результаты теста</h2>
                </div>

                <div className={`rounded-2xl border p-6 mb-6 text-center ${
                  result.passed
                    ? "border-secondary/30 bg-secondary/10"
                    : "border-destructive/30 bg-destructive/10"
                }`}>
                  <h3 className="mb-2 text-xl font-semibold">
                    {result.passed ? "Тест пройден" : "Тест не пройден"}
                  </h3>
                  <p className="text-lg">
                    Результат: {result.score_percent}% ({result.correct_answers}/{result.total_questions} правильных ответов)
                  </p>
                  {!result.passed && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Для прохождения нужно набрать {testData?.pass_threshold}%
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    Разбор ответов
                  </h3>
                  {answerReview.map((review, idx) => (
                    <div
                      key={review.questionId}
                      className={`rounded-2xl border p-4 ${
                        review.isCorrect 
                          ? "border-secondary/30 bg-secondary/5" 
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {review.isCorrect ? (
                          <ThumbsUp className="h-5 w-5 text-secondary mt-0.5" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{idx + 1}. {review.questionText}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Ваш ответ:</span>{" "}
                              <span className={review.isCorrect ? "text-secondary font-medium" : "text-destructive font-medium"}>
                                {review.userAnswer}
                              </span>
                            </p>
                            {!review.isCorrect && (
                              <p>
                                <span className="text-muted-foreground">Правильный ответ:</span>{" "}
                                <span className="text-secondary font-medium">{review.correctAnswer}</span>
                              </p>
                            )}
                            {review.explanation && (
                              <div className="mt-2 rounded-lg bg-muted/30 p-2">
                                <p className="text-xs text-muted-foreground">Пояснение:</p>
                                <p className="text-sm">{review.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  {!result.passed && (
                    <Button onClick={resetTest} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Пройти тест заново
                    </Button>
                  )}
                  <Button onClick={handleBackToOverview} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Вернуться к уроку
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="rounded-[28px]">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <LevelBadge level={level} className="mt-1" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Видео</span>
                    <span>{videoWatched ? "100%" : "0%"}</span>
                  </div>
                  <ProgressBar progress={videoWatched ? 100 : 0} color="primary" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Словарь</span>
                    <span>{Math.round(wordsMasteredPercent)}%</span>
                  </div>
                  <ProgressBar progress={wordsMasteredPercent} color="primary" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Тест</span>
                    <span>{result?.passed ? "100%" : result ? `${Math.round(testScorePercent)}%` : "0%"}</span>
                  </div>
                  <ProgressBar progress={result?.passed ? 100 : testScorePercent} color="primary" />
                </div>
              </div>
              {savingProgress && (
                <p className="mt-3 text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Сохранение...
                </p>
              )}
            </Card>

            <Card className="rounded-[28px]">
              <h3 className="mb-3 flex items-center gap-2">
                Рекомендации
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Сначала посмотрите видео полностью</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Затем изучите все слова в словаре</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>После этого приступайте к тесту</span>
                </li>
              </ul>
            </Card>

            {!result?.passed && videoWatched && reviewedCount === totalWords && totalWords > 0 && (
              <Card className="rounded-[28px] border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Вы готовы к тесту</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Видео просмотрено и все слова изучены. Пора проверить знания.
                </p>
                <Button className="mt-3 w-full" onClick={() => setActiveTab("test")}>
                  Начать тест
                </Button>
              </Card>
            )}

            {result?.passed && (
              <Card className="rounded-[28px] border-secondary/30 bg-secondary/5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold">Урок пройден</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Отличная работа. Вы полностью освоили этот урок.
                </p>
                <Button className="mt-3 w-full" onClick={handleNavigateToCatalog}>
                  Продолжить обучение
                </Button>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}