import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Shuffle, Target } from "lucide-react";

import api from "../api/axios";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { extractApiErrorMessage } from "../utils/apiError";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { SearchInput } from "./ui/SearchInput";

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
          subtitle: "Тренируйте слова из уроков и укрепляйте запоминание через разные режимы.",
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
        }
      : {
          fetchError: "Сөздікті жүктеу мүмкін болмады.",
          quizGenerateError:
            "Квизді құрастыру мүмкін болмады. Басқа сүзгілерді қолданып көріңіз немесе көбірек сөз қосыңыз.",
          quizSubmitError: "Квизді жіберу мүмкін болмады.",
          answerAll: "Квизді жібермес бұрын барлық сұрақтарға жауап беріңіз.",
          title: "Vocabulary Lab",
          subtitle: "Сабақ сөздерін түрлі режимдер арқылы жаттықтырып, есте сақтауды күшейтіңіз.",
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
          correct: "Дұрыс жауап",
          recentAttempts: "Соңғы талпыныстар",
          noAttempts: "Әзірге талпыныстар жоқ.",
          example: "Мысал",
          general: "Жалпы",
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
    return ["All", ...Array.from(unique) as string[]];
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
    { label: "Total Words", value: words.length, icon: BookOpen, color: "text-primary" },
    { label: "Filtered", value: filteredWords.length, icon: Brain, color: "text-secondary" },
    { label: "Categories", value: categories.length - 1, icon: Target, color: "text-accent-foreground" },
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
      setError(
        extractApiErrorMessage(
          error,
          copy.quizGenerateError
        )
      );
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 rounded-[28px] border border-border bg-gradient-to-br from-card to-secondary/10 p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mb-2">{copy.title}</h1>
              <p className="text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("catalog")}>
              {copy.backToLessons}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="rounded-2xl p-4 text-center">
                  <Icon className={`mx-auto mb-2 h-5 w-5 ${item.color}`} />
                  <div className="text-xl font-semibold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.label === "Total Words"
                      ? copy.totalWords
                      : item.label === "Filtered"
                        ? copy.filtered
                        : copy.categories}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </motion.div>

      {error && (
        <Card className="mb-4 rounded-2xl border-destructive/20 bg-destructive/10 text-destructive">
          {error}
        </Card>
      )}

      <Card className="mb-6 rounded-[28px]">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["learn", "flashcards", "quiz"] as Mode[]).map((item) => (
            <Button
              key={item}
              variant={mode === item ? "primary" : "ghost"}
              onClick={() => setMode(item)}
            >
              {translateMode(item)}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <SearchInput
            placeholder={copy.search}
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {category === "All" ? copy.all : translateCategory(category)}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`rounded-full px-4 py-2 text-xs transition-colors ${
                selectedLevel === level
                  ? "bg-secondary text-white"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <p className="py-10 text-center text-muted-foreground">{copy.loading}</p>
      ) : null}

      {!loading && filteredWords.length === 0 && (
        <Card className="rounded-[28px] py-10 text-center">
          {copy.noWords}
        </Card>
      )}

      {!loading && filteredWords.length > 0 && mode === "learn" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWords.map((word) => (
            <Card key={word.id} hover className="rounded-[24px]">
              <h3 className="mb-1">{word.word}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{word.pronunciation || "-"}</p>
              <p className="mb-3">{word.translation}</p>
              {word.example && (
                <p className="mb-3 text-sm text-muted-foreground">{copy.example}: {word.example}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{translateCategory(word.category || "General") || copy.general}</span>
                <span>{word.level || "-"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredWords.length > 0 && mode === "flashcards" && currentFlashcard && (
        <div className="mx-auto max-w-2xl">
          <Card
            className="min-h-[280px] cursor-pointer rounded-[28px] text-center"
            onClick={() => setShowBack((prev) => !prev)}
          >
            <div className="mb-4 text-xs text-muted-foreground">
              {copy.card} {flashcardIndex + 1} / {filteredWords.length}
            </div>
            {!showBack ? (
              <>
                <h2 className="mb-2">{currentFlashcard.word}</h2>
                <p className="text-muted-foreground">
                  {currentFlashcard.pronunciation || copy.clickToFlip}
                </p>
              </>
            ) : (
              <>
                <h2 className="mb-2">{currentFlashcard.translation}</h2>
                <p className="text-muted-foreground">
                  {currentFlashcard.example || copy.noExample}
                </p>
              </>
            )}
          </Card>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={shuffleFlashcards}>
              <Shuffle className="h-4 w-4" />
              {copy.shuffle}
            </Button>
            <Button onClick={nextFlashcard}>{copy.next}</Button>
          </div>
        </div>
      )}

      {!loading && mode === "quiz" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => void generateQuiz()} disabled={quizLoading}>
              {quizLoading ? copy.generating : copy.generateNewQuiz}
            </Button>
          </div>

          {quizQuestions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {quizQuestions.map((question, index) => (
                <Card key={question.question_word_id} className="rounded-[24px]">
                  <div className="mb-2 text-xs text-muted-foreground">
                    {copy.question} {index + 1} / {quizQuestions.length}
                  </div>
                  <h3 className="mb-1">{question.word}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {question.pronunciation || "-"}
                  </p>
                  <div className="grid gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option.word_id}
                        onClick={() =>
                          setQuizAnswers((prev) => ({
                            ...prev,
                            [question.question_word_id]: option.word_id,
                          }))
                        }
                        className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                          quizAnswers[question.question_word_id] === option.word_id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-primary/5"
                        }`}
                      >
                        {option.translation}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-[24px] text-center">
              {copy.noQuiz}
            </Card>
          )}

          {quizQuestions.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => void submitQuiz()} disabled={quizSubmitting || quizLoading}>
                {quizSubmitting ? copy.checking : copy.submitQuiz}
              </Button>
            </div>
          )}

          {quizResult && (
            <Card className="rounded-[24px]">
              <h3 className="mb-2">{copy.quizResult}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Score: {quizResult.score_percent}% ({quizResult.correct_answers}/
                {quizResult.total_questions})
              </p>
              <div className="grid gap-2">
                {quizResult.review.map((item, index) => (
                  <div
                    key={`${item.question_word}-${index}`}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      item.is_correct
                        ? "border-secondary/30 bg-secondary/10"
                        : "border-destructive/30 bg-destructive/10"
                    }`}
                  >
                    <span className="font-medium">{item.question_word}</span> - {copy.selected}:{" "}
                    {item.selected_translation} - {copy.correct}: {item.correct_translation}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="rounded-[24px]">
            <h3 className="mb-3">{copy.recentAttempts}</h3>
            {quizHistory.length > 0 ? (
              <div className="space-y-2">
                {quizHistory.slice(0, 10).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span>
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
      )}
    </div>
  );
}
