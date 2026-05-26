import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, CheckCircle2, Shuffle, Target } from "lucide-react";

import api from "../api/axios";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { extractApiErrorMessage } from "../utils/apiError";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { CardGlow } from "./ui/CardGlow";
import { SearchInput } from "./ui/SearchInput";
import { cn } from "./ui/utils";

interface VocabularyPageProps {
  onNavigate: (page: string) => void;
}

interface VocabularyWord {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  category: string;
  level: "A1" | "A2" | "B1" | "B2" | null;
  lesson: number | null;
  lesson_title?: string;
}

type Mode = "learn" | "flashcards" | "quiz";

interface QuizOption {
  word_id: number;
  translation: string;
}

interface QuizQuestion {
  question_word_id: number;
  word: string;
  pronunciation: string;
  options: QuizOption[];
}

interface QuizGenerateResponse {
  token: string;
  question_count: number;
  category: string;
  level: string;
  questions: QuizQuestion[];
}

interface QuizReviewItem {
  question_word: string;
  correct_translation: string;
  selected_translation: string;
  is_correct: boolean;
}

interface QuizHistoryItem {
  id: number;
  score_percent: number;
  correct_answers: number;
  total_questions: number;
  category_filter: string;
  level_filter: string | null;
  created_at: string;
}

interface QuizSubmitResponse {
  attempt_id: number;
  score_percent: number;
  correct_answers: number;
  total_questions: number;
  review: QuizReviewItem[];
  history: QuizHistoryItem[];
}

export function VocabularyPage({ onNavigate }: VocabularyPageProps) {
  const { language, translateCategory, translateMode } = useAppPreferences();
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("flashcards");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [quizToken, setQuizToken] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);

  const copy =
    language === "ru"
      ? {
          fetchError: "Не удалось загрузить словарь.",
          quizGenerateError:
            "Не удалось собрать квиз. Попробуйте другие фильтры или добавьте больше слов.",
          quizSubmitError: "Не удалось отправить квиз.",
          answerAll: "Ответьте на все вопросы перед отправкой квиза.",
          title: "Vocabulary Lab",
          subtitle:
            "Тренируйте слова из уроков и укрепляйте запоминание через карточки, поиск и квизы.",
          backToLessons: "Назад к урокам",
          totalWords: "Всего слов",
          filtered: "По фильтру",
          categories: "Категории",
          search: "Искать слова или переводы...",
          all: "Все",
          loading: "Загружаем словарь...",
          noWords: "По текущим фильтрам слова не найдены.",
          card: "Карточка",
          clickToFlip: "Нажмите, чтобы перевернуть",
          noExample: "Пример пока не добавлен",
          shuffle: "Перемешать",
          next: "Дальше",
          generating: "Генерируем...",
          generateNewQuiz: "Собрать новый квиз",
          noQuiz: "Квиз пока не загружен.",
          question: "Вопрос",
          submitQuiz: "Отправить квиз",
          checking: "Проверяем...",
          quizResult: "Результат квиза",
          selected: "Ваш ответ",
          correct: "Правильный",
          recentAttempts: "Последние попытки",
          noAttempts: "Попыток пока нет.",
          example: "Пример",
          general: "Общее",
          filters: "Фильтры",
          level: "Уровень",
          score: "Результат",
        }
      : {
          fetchError: "Сөздікті жүктеу мүмкін болмады.",
          quizGenerateError:
            "Квизді құрастыру мүмкін болмады. Басқа сүзгілерді қолданып көріңіз немесе көбірек сөз қосыңыз.",
          quizSubmitError: "Квизді жіберу мүмкін болмады.",
          answerAll: "Квизді жібермес бұрын барлық сұрақтарға жауап беріңіз.",
          title: "Vocabulary Lab",
          subtitle:
            "Сабақ сөздерін карточка, іздеу және квиз режимдері арқылы жаттықтырыңыз.",
          backToLessons: "Сабақтарға қайту",
          totalWords: "Барлық сөз",
          filtered: "Сүзгі бойынша",
          categories: "Санаттар",
          search: "Сөздер мен аудармаларды іздеу...",
          all: "Барлығы",
          loading: "Сөздік жүктеліп жатыр...",
          noWords: "Қазіргі сүзгілер бойынша сөздер табылмады.",
          card: "Карта",
          clickToFlip: "Аудару үшін басыңыз",
          noExample: "Мысал әлі қосылмаған",
          shuffle: "Араластыру",
          next: "Келесі",
          generating: "Құрастырылып жатыр...",
          generateNewQuiz: "Жаңа квиз құрастыру",
          noQuiz: "Квиз әлі жүктелген жоқ.",
          question: "Сұрақ",
          submitQuiz: "Квизді жіберу",
          checking: "Тексеріліп жатыр...",
          quizResult: "Квиз нәтижесі",
          selected: "Сіздің жауабыңыз",
          correct: "Дұрыс",
          recentAttempts: "Соңғы талпыныстар",
          noAttempts: "Әзірге талпыныстар жоқ.",
          example: "Мысал",
          general: "Жалпы",
          filters: "Сүзгілер",
          level: "Деңгей",
          score: "Нәтиже",
        };

  useEffect(() => {
    const loadWords = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get<VocabularyWord[]>("/vocabulary/");
        setWords(res.data);
      } catch (error) {
        setError(extractApiErrorMessage(error, copy.fetchError));
      } finally {
        setLoading(false);
      }
    };
    void loadWords();
  }, []);

  const loadQuizHistory = async () => {
    try {
      const res = await api.get<QuizHistoryItem[]>("/vocabulary/quiz/history/");
      setQuizHistory(res.data);
    } catch {
      setQuizHistory([]);
    }
  };

  useEffect(() => {
    void loadQuizHistory();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(words.map((item) => item.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [words]);

  const levels = useMemo(() => {
    const unique = new Set(words.map((item) => item.level).filter(Boolean));
    return ["All", ...(Array.from(unique) as string[])];
  }, [words]);

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesSearch =
        word.word.toLowerCase().includes(search.toLowerCase()) ||
        word.translation.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || word.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || word.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [words, search, selectedCategory, selectedLevel]);

  useEffect(() => {
    setFlashcardIndex(0);
    setShowBack(false);
  }, [filteredWords.length]);

  const currentFlashcard = filteredWords[flashcardIndex];

  const stats = [
    { label: copy.totalWords, value: words.length, icon: BookOpen, color: "text-primary" },
    { label: copy.filtered, value: filteredWords.length, icon: Brain, color: "text-secondary" },
    { label: copy.categories, value: categories.length - 1, icon: Target, color: "text-accent" },
  ];

  const nextFlashcard = () => {
    if (!filteredWords.length) return;
    setShowBack(false);
    setFlashcardIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const shuffleFlashcards = () => {
    if (!filteredWords.length) return;
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    setFlashcardIndex(randomIndex);
    setShowBack(false);
  };

  const generateQuiz = async () => {
    setQuizLoading(true);
    setError("");
    setQuizResult(null);
    try {
      const res = await api.get<QuizGenerateResponse>("/vocabulary/quiz/", {
        params: {
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          level: selectedLevel !== "All" ? selectedLevel : undefined,
          question_count: 8,
        },
      });
      setQuizToken(res.data.token);
      setQuizQuestions(res.data.questions);
      setQuizAnswers({});
    } catch (error) {
      setQuizToken("");
      setQuizQuestions([]);
      setError(extractApiErrorMessage(error, copy.quizGenerateError));
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quizToken || quizQuestions.length === 0) return;
    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      setError(copy.answerAll);
      return;
    }

    setQuizSubmitting(true);
    setError("");
    try {
      const answers = quizQuestions.map((question) => ({
        question_word_id: question.question_word_id,
        selected_word_id: quizAnswers[question.question_word_id],
      }));

      const res = await api.post<QuizSubmitResponse>("/vocabulary/quiz/submit/", {
        token: quizToken,
        category: selectedCategory !== "All" ? selectedCategory : "",
        level: selectedLevel !== "All" ? selectedLevel : "",
        answers,
      });

      setQuizResult(res.data);
      setQuizHistory(res.data.history);
    } catch (error) {
      setError(extractApiErrorMessage(error, copy.quizSubmitError));
    } finally {
      setQuizSubmitting(false);
    }
  };

  useEffect(() => {
    if (mode === "quiz") {
      void generateQuiz();
    }
  }, [mode, selectedCategory, selectedLevel]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <CardGlow className="mb-8 p-6 sm:p-8" glowColor="rgba(16, 185, 129, 0.16)">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{copy.subtitle}</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("catalog")}>
              {copy.backToLessons}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} padding="sm" className="text-center">
                  <Icon className={`mx-auto mb-2 h-5 w-5 ${item.color}`} aria-hidden="true" />
                  <div className="text-xl font-semibold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </Card>
              );
            })}
          </div>
        </CardGlow>
      </motion.div>

      {error ? (
        <Card className="mb-4 border-destructive/20 bg-destructive/10 text-destructive" role="alert">
          {error}
        </Card>
      ) : null}

      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["learn", "flashcards", "quiz"] as Mode[]).map((item) => (
            <Button
              key={item}
              variant={mode === item ? "primary" : "ghost"}
              aria-pressed={mode === item}
              onClick={() => setMode(item)}
            >
              {translateMode(item)}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <SearchInput placeholder={copy.search} value={search} onChange={setSearch} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">{copy.categories}</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "interactive rounded-full border px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    selectedCategory === category
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {category === "All" ? copy.all : translateCategory(category)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">{copy.level}</h2>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={selectedLevel === level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "interactive rounded-full border px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    selectedLevel === level
                      ? "border-secondary/25 bg-secondary/10 text-secondary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {level === "All" ? copy.all : level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="py-10 text-center text-muted-foreground">{copy.loading}</Card>
      ) : null}

      {!loading && filteredWords.length === 0 ? (
        <Card className="py-10 text-center text-muted-foreground">{copy.noWords}</Card>
      ) : null}

      {!loading && filteredWords.length > 0 && mode === "learn" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWords.map((word) => (
            <CardGlow key={word.id} hover className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{word.word}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{word.pronunciation || "-"}</p>
              </div>
              <p className="text-base font-medium text-foreground">{word.translation}</p>
              {word.example ? (
                <p className="rounded-2xl bg-muted/45 p-3 text-sm leading-6 text-muted-foreground">
                  {copy.example}: {word.example}
                </p>
              ) : null}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{translateCategory(word.category || "General") || copy.general}</span>
                <span>{word.level || "-"}</span>
              </div>
            </CardGlow>
          ))}
        </div>
      ) : null}

      {!loading && filteredWords.length > 0 && mode === "flashcards" && currentFlashcard ? (
        <div className="mx-auto max-w-2xl">
          <CardGlow
            className="min-h-[300px] text-center"
            onClick={() => setShowBack((prev) => !prev)}
            aria-label={copy.clickToFlip}
          >
            <div className="mb-4 text-xs text-muted-foreground">
              {copy.card} {flashcardIndex + 1} / {filteredWords.length}
            </div>
            {!showBack ? (
              <>
                <h2 className="mb-3 text-4xl font-semibold text-foreground">{currentFlashcard.word}</h2>
                <p className="text-muted-foreground">
                  {currentFlashcard.pronunciation || copy.clickToFlip}
                </p>
              </>
            ) : (
              <>
                <h2 className="mb-3 text-3xl font-semibold text-foreground">
                  {currentFlashcard.translation}
                </h2>
                <p className="text-muted-foreground">
                  {currentFlashcard.example || copy.noExample}
                </p>
              </>
            )}
          </CardGlow>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={shuffleFlashcards}>
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              {copy.shuffle}
            </Button>
            <Button onClick={nextFlashcard}>{copy.next}</Button>
          </div>
        </div>
      ) : null}

      {!loading && mode === "quiz" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => void generateQuiz()}
              disabled={quizLoading}
              loading={quizLoading}
              loadingText={copy.generating}
            >
              {copy.generateNewQuiz}
            </Button>
          </div>

          {quizQuestions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {quizQuestions.map((question, index) => (
                <Card key={question.question_word_id}>
                  <div className="mb-2 text-xs text-muted-foreground">
                    {copy.question} {index + 1} / {quizQuestions.length}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{question.word}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {question.pronunciation || "-"}
                  </p>
                  <div className="grid gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option.word_id}
                        type="button"
                        onClick={() =>
                          setQuizAnswers((prev) => ({
                            ...prev,
                            [question.question_word_id]: option.word_id,
                          }))
                        }
                        className={cn(
                          "interactive rounded-xl border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          quizAnswers[question.question_word_id] === option.word_id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-primary/5",
                        )}
                      >
                        {option.translation}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center text-muted-foreground">{copy.noQuiz}</Card>
          )}

          {quizQuestions.length > 0 ? (
            <div className="flex justify-end">
              <Button
                onClick={() => void submitQuiz()}
                disabled={quizSubmitting || quizLoading}
                loading={quizSubmitting}
                loadingText={copy.checking}
              >
                {copy.submitQuiz}
              </Button>
            </div>
          ) : null}

          {quizResult ? (
            <Card>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{copy.quizResult}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {copy.score}: {quizResult.score_percent}% ({quizResult.correct_answers}/
                {quizResult.total_questions})
              </p>
              <div className="grid gap-2">
                {quizResult.review.map((item, index) => (
                  <div
                    key={`${item.question_word}-${index}`}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm",
                      item.is_correct
                        ? "border-secondary/30 bg-secondary/10"
                        : "border-destructive/30 bg-destructive/10",
                    )}
                  >
                    <span className="font-medium">{item.question_word}</span> - {copy.selected}:{" "}
                    {item.selected_translation} - {copy.correct}: {item.correct_translation}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <Card>
            <h3 className="mb-3 text-xl font-semibold text-foreground">{copy.recentAttempts}</h3>
            {quizHistory.length > 0 ? (
              <div className="space-y-2">
                {quizHistory.slice(0, 10).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" aria-hidden="true" />
                      {attempt.score_percent}% ({attempt.correct_answers}/{attempt.total_questions})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(attempt.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.noAttempts}</p>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
