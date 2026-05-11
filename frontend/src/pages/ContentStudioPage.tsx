import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
  Video,
} from "lucide-react";

import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LevelBadge } from "../components/ui/LevelBadge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { extractApiErrorMessage } from "../utils/apiError";

type StudioTab = "lesson" | "dictionary" | "students" | "analytics";

interface ContentStudioPageProps {
  onNavigate: (page: string) => void;
}

interface LessonTemplateListItem {
  id: number;
  title: string;
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  duration_minutes: number;
  question_count: number;
  vocabulary_count: number;
  is_published: boolean;
}

interface StudentRow {
  user_id: number;
  username: string;
  email: string;
  completed_lessons: number;
  in_progress_lessons: number;
  average_progress: number;
  latest_test_attempt: {
    lesson_title: string;
    score_percent: number;
    passed: boolean;
  } | null;
  lessons: Array<{
    lesson_id: number;
    lesson_title: string;
    progress: number;
    completed: boolean;
    test_score: number;
    updated_at: string;
  }>;
}

interface AnalyticsSummary {
  total_attempts: number;
  average_score: number;
  pass_rate: number;
}

interface AnalyticsAttempt {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  username: string;
  score_percent: number;
  passed: boolean;
  submitted_at: string;
}

interface AnalyticsQuestion {
  question_id: number;
  lesson_id: number;
  lesson_title: string;
  order: number;
  question_text: string;
  attempts: number;
  correct_rate: number;
  options: Array<{
    option_id: number;
    option_text: string;
    is_correct: boolean;
    selected_count: number;
    selected_rate: number;
  }>;
}

interface TestAnalyticsResponse {
  summary: AnalyticsSummary;
  recent_attempts: AnalyticsAttempt[];
  lesson_breakdown: Array<{
    lesson_id: number;
    lesson_title: string;
    attempts: number;
    average_score: number;
    pass_rate: number;
  }>;
  question_breakdown: AnalyticsQuestion[];
}

interface AuditLogItem {
  id: number;
  username: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

interface VocabularyItem {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  example?: string;
  category: string;
  level: "A1" | "A2" | "B1" | "B2" | null;
  lesson: number | null;
  lesson_title?: string;
}

interface TestOptionInput {
  option_text: string;
  is_correct: boolean;
}

interface TestQuestionInput {
  order: number;
  question_text: string;
  explanation: string;
  options: TestOptionInput[];
}

interface LessonWordInput {
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  category: string;
  level: "A1" | "A2" | "B1" | "B2";
}

const makeQuestion = (order: number): TestQuestionInput => ({
  order,
  question_text: "",
  explanation: "",
  options: [
    { option_text: "", is_correct: true },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ],
});

const makeLessonWord = (): LessonWordInput => ({
  word: "",
  translation: "",
  pronunciation: "",
  example: "",
  category: "",
  level: "A1",
});

export const ContentStudioPage: React.FC<ContentStudioPageProps> = ({ onNavigate }) => {
  const { language, locale, translateCategory } = useAppPreferences();
  const isRu = language === "ru";
  const [activeTab, setActiveTab] = useState<StudioTab>("lesson");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingWordId, setEditingWordId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<TestAnalyticsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [analyticsLessonFilter, setAnalyticsLessonFilter] = useState<string>("all");

  const [lessons, setLessons] = useState<LessonTemplateListItem[]>([]);
  const [dictionary, setDictionary] = useState<VocabularyItem[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    level: "A1",
    category: "Travel",
    duration_minutes: 10,
    youtube_id: "",
    thumbnail: "",
    rating: 4.5,
    is_published: true,
  });
  const [testQuestions, setTestQuestions] = useState<TestQuestionInput[]>([makeQuestion(1)]);
  const [lessonWords, setLessonWords] = useState<LessonWordInput[]>([makeLessonWord()]);

  const [wordForm, setWordForm] = useState({
    word: "",
    translation: "",
    pronunciation: "",
    example: "",
    category: "",
    level: "A1",
    lesson: "",
  });

  const lessonLevelOptions = ["A1", "A2", "B1", "B2"] as const;
  const lessonCategoryOptions = [
    "Everyday Speech",
    "Travel",
    "School & Education",
    "Work & Business",
    "Grammar",
    "Culture",
    "Food & Dining",
  ] as const;

  const tabs = useMemo(
    () => [
      {
        id: "lesson",
        label: isRu ? "Конструктор уроков" : "Сабақ конструкторы",
        icon: Video,
      },
      {
        id: "dictionary",
        label: isRu ? "Словарь" : "Сөздік",
        icon: BookOpenCheck,
      },
      {
        id: "students",
        label: isRu ? "Прогресс учеников" : "Оқушы прогресі",
        icon: UsersRound,
      },
      {
        id: "analytics",
        label: isRu ? "Аналитика тестов" : "Тест аналитикасы",
        icon: BarChart3,
      },
    ] as const,
    [isRu]
  );

  const resetFeedback = () => {
    setError("");
    setSuccess("");
  };

  const formatDateTime = (isoValue?: string) => {
    if (!isoValue) return "-";
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(locale);
  };

  const loadAnalytics = async (lessonId?: number) => {
    const analyticsRes = await api.get<TestAnalyticsResponse>("/studio/analytics/tests/", {
      params: lessonId ? { lesson: lessonId } : undefined,
    });
    setAnalytics(analyticsRes.data);
  };

  const loadAuditLogs = async () => {
    const auditRes = await api.get<AuditLogItem[]>("/studio/audit/", {
      params: { limit: 40 },
    });
    setAuditLogs(auditRes.data);
  };

  const loadStudioData = async (preserveFeedback = false) => {
    setLoading(true);
    if (!preserveFeedback) {
      resetFeedback();
    }
    try {
      const [lessonsRes, dictionaryRes, studentsRes] = await Promise.all([
        api.get<LessonTemplateListItem[]>("/studio/lessons/template/"),
        api.get<VocabularyItem[]>("/studio/vocabulary/"),
        api.get<{ students: StudentRow[] }>("/studio/students/"),
      ]);
      setLessons(lessonsRes.data);
      setDictionary(dictionaryRes.data);
      setStudents(studentsRes.data.students);
      await Promise.all([loadAnalytics(), loadAuditLogs()]);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu
            ? "Эндпоинты студии недоступны. Проверьте, что вы вошли как контент-менеджер."
            : "Студия эндпоинттері қолжетімсіз. Контент-менеджер ретінде кіргеніңізді тексеріңіз."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudioData();
  }, []);

  const addQuestion = () => {
    setTestQuestions((prev) => [...prev, makeQuestion(prev.length + 1)]);
  };

  const removeQuestion = (index: number) => {
    setTestQuestions((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((question, idx) => ({ ...question, order: idx + 1 }))
    );
  };

  const updateQuestion = (
    index: number,
    field: "question_text" | "explanation",
    value: string
  ) => {
    setTestQuestions((prev) =>
      prev.map((question, idx) =>
        idx === index ? { ...question, [field]: value } : question
      )
    );
  };

  const updateOption = <
    K extends keyof TestOptionInput
  >(
    questionIndex: number,
    optionIndex: number,
    field: K,
    value: TestOptionInput[K]
  ) => {
    setTestQuestions((prev) =>
      prev.map((question, qIdx) => {
        if (qIdx !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, oIdx) => {
            if (oIdx !== optionIndex) return option;
            return { ...option, [field]: value };
          }),
        };
      })
    );
  };

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    setTestQuestions((prev) =>
      prev.map((question, qIdx) => {
        if (qIdx !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, oIdx) => ({
            ...option,
            is_correct: oIdx === optionIndex,
          })),
        };
      })
    );
  };

  const addLessonWord = () => {
    setLessonWords((prev) => [...prev, makeLessonWord()]);
  };

  const removeLessonWord = (index: number) => {
    setLessonWords((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateLessonWord = <
    K extends keyof LessonWordInput
  >(
    index: number,
    field: K,
    value: LessonWordInput[K]
  ) => {
    setLessonWords((prev) =>
      prev.map((word, idx) => (idx === index ? { ...word, [field]: value } : word))
    );
  };

  const resetLessonEditor = () => {
    setEditingLessonId(null);
    setLessonForm({
      title: "",
      description: "",
      level: "A1",
      category: "Travel",
      duration_minutes: 10,
      youtube_id: "",
      thumbnail: "",
      rating: 4.5,
      is_published: true,
    });
    setTestQuestions([makeQuestion(1)]);
    setLessonWords([makeLessonWord()]);
  };

  const resetWordEditor = () => {
    setEditingWordId(null);
    setWordForm({
      word: "",
      translation: "",
      pronunciation: "",
      example: "",
      category: "",
      level: "A1",
      lesson: "",
    });
  };

  const startEditLesson = async (lessonId: number) => {
    resetFeedback();
    setLoading(true);
    try {
      const [detailRes, testsRes, wordsRes] = await Promise.all([
        api.get(`/lessons/${lessonId}/`),
        api.get<{
          id: number;
          order: number;
          question_text: string;
          explanation: string;
          options: Array<{ id: number; option_text: string; is_correct: boolean }>;
        }[]>(`/studio/lessons/${lessonId}/tests/`),
        api.get<VocabularyItem[]>(`/studio/lessons/${lessonId}/vocabulary/`),
      ]);

      const detail = detailRes.data;
      setEditingLessonId(lessonId);
      setLessonForm({
        title: detail.title,
        description: detail.description,
        level: detail.level,
        category: detail.category,
        duration_minutes: detail.duration_minutes,
        youtube_id: detail.youtube_id,
        thumbnail: detail.thumbnail,
        rating: detail.rating,
        is_published: detail.is_published,
      });

      const preparedQuestions =
        testsRes.data.length > 0
          ? testsRes.data.map((question, index) => ({
              order: question.order || index + 1,
              question_text: question.question_text,
              explanation: question.explanation || "",
              options:
                question.options.length > 0
                  ? question.options.map((option) => ({
                      option_text: option.option_text,
                      is_correct: option.is_correct,
                    }))
                  : makeQuestion(index + 1).options,
            }))
          : [makeQuestion(1)];
      setTestQuestions(preparedQuestions);

      const preparedWords =
        wordsRes.data.length > 0
          ? wordsRes.data.map((word) => ({
              word: word.word,
              translation: word.translation,
              pronunciation: word.pronunciation || "",
              example: word.example || "",
              category: word.category || "",
              level: (word.level || "A1") as LessonWordInput["level"],
            }))
          : [makeLessonWord()];
      setLessonWords(preparedWords);

      setActiveTab("lesson");
      setSuccess(isRu ? "Урок загружен в редактор." : "Сабақ редакторға жүктелді.");
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu
            ? "Не удалось загрузить шаблон урока для редактирования."
            : "Сабақ шаблонын редакциялау үшін жүктеу мүмкін болмады."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId: number) => {
    resetFeedback();
    setLoading(true);
    try {
      await api.delete(`/studio/lessons/${lessonId}/`);
      if (editingLessonId === lessonId) {
        resetLessonEditor();
      }
      setSuccess(isRu ? "Урок удалён." : "Сабақ өшірілді.");
      await loadStudioData(true);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu ? "Не удалось удалить урок." : "Сабақты өшіру мүмкін болмады."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const submitLessonTemplate = async () => {
    resetFeedback();
    setLoading(true);
    try {
      const lessonPayload = {
        ...lessonForm,
        duration_minutes: Number(lessonForm.duration_minutes),
        rating: Number(lessonForm.rating),
      };

      const questionsPayload = testQuestions
        .filter((question) => question.question_text.trim())
        .map((question, index) => ({
          order: question.order || index + 1,
          question_text: question.question_text.trim(),
          explanation: question.explanation || "",
          options: question.options
            .filter((option) => option.option_text.trim())
            .map((option) => ({
              option_text: option.option_text.trim(),
              is_correct: option.is_correct,
            })),
        }));

      const wordsPayload = lessonWords
        .filter((word) => word.word.trim() && word.translation.trim())
        .map((word) => ({
          word: word.word.trim(),
          translation: word.translation.trim(),
          pronunciation: word.pronunciation.trim(),
          example: word.example.trim(),
          category: word.category.trim(),
          level: word.level,
        }));

      if (editingLessonId) {
        await Promise.all([
          api.patch(`/studio/lessons/${editingLessonId}/`, lessonPayload),
          api.put(`/studio/lessons/${editingLessonId}/tests/`, {
            questions: questionsPayload,
          }),
          api.put(`/studio/lessons/${editingLessonId}/vocabulary/`, {
            words: wordsPayload,
          }),
        ]);
        setSuccess(
          isRu ? "Шаблон урока успешно обновлён." : "Сабақ шаблоны сәтті жаңартылды."
        );
      } else {
        await api.post("/studio/lessons/template/", {
          ...lessonPayload,
          test_questions: questionsPayload,
          vocabulary_words: wordsPayload,
        });
        setSuccess(
          isRu ? "Шаблон урока успешно сохранён." : "Сабақ шаблоны сәтті сақталды."
        );
      }

      resetLessonEditor();
      await loadStudioData(true);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu
            ? "Не удалось сохранить шаблон урока. Проверьте поля и попробуйте снова."
            : "Сабақ шаблонын сақтау мүмкін болмады. Өрістерді тексеріп, қайта көріңіз."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const startEditWord = (item: VocabularyItem) => {
    setEditingWordId(item.id);
    setWordForm({
      word: item.word,
      translation: item.translation,
      pronunciation: item.pronunciation || "",
      example: item.example || "",
      category: item.category || "",
      level: (item.level || "A1") as "A1" | "A2" | "B1" | "B2",
      lesson: item.lesson ? String(item.lesson) : "",
    });
    setActiveTab("dictionary");
  };

  const deleteWord = async (wordId: number) => {
    resetFeedback();
    setLoading(true);
    try {
      await api.delete(`/studio/vocabulary/${wordId}/`);
      if (editingWordId === wordId) {
        resetWordEditor();
      }
      setSuccess(isRu ? "Слово удалено." : "Сөз өшірілді.");
      await loadStudioData(true);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu ? "Не удалось удалить слово." : "Сөзді өшіру мүмкін болмады."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const submitDictionaryWord = async () => {
    resetFeedback();
    setLoading(true);
    try {
      const payload = {
        ...wordForm,
        lesson: wordForm.lesson ? Number(wordForm.lesson) : null,
      };
      if (editingWordId) {
        await api.patch(`/studio/vocabulary/${editingWordId}/`, payload);
        setSuccess(isRu ? "Слово обновлено." : "Сөз жаңартылды.");
      } else {
        await api.post("/studio/vocabulary/", payload);
        setSuccess(isRu ? "Слово добавлено в словарь." : "Сөз сөздікке қосылды.");
      }

      resetWordEditor();
      await loadStudioData(true);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu
            ? "Не удалось сохранить слово словаря."
            : "Сөзді сөздікке сақтау мүмкін болмады."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    resetFeedback();
    setLoading(true);
    try {
      const lessonId =
        analyticsLessonFilter !== "all" ? Number(analyticsLessonFilter) : undefined;
      await Promise.all([loadAnalytics(lessonId), loadAuditLogs()]);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          isRu ? "Не удалось загрузить аналитику." : "Аналитиканы жүктеу мүмкін болмады."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      void refreshAnalytics();
    }
  }, [activeTab, analyticsLessonFilter]);

  const previewLessonTitle =
    lessonForm.title.trim() || (isRu ? "Название урока" : "Сабақ атауы");
  const previewLessonDescription =
    lessonForm.description.trim() ||
    (isRu
      ? "Здесь появится краткое описание урока."
      : "Мұнда сабақтың қысқаша сипаттамасы көрінеді.");
  const previewLessonDuration = Number(lessonForm.duration_minutes) || 0;
  const previewYoutubeId = lessonForm.youtube_id.trim();
  const previewThumbnail = previewYoutubeId
    ? `https://img.youtube.com/vi/${previewYoutubeId}/hqdefault.jpg`
    : lessonForm.thumbnail.trim() ||
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80";
  const previewMainQuestion =
    testQuestions.find(
      (question) =>
        question.question_text.trim() &&
        question.options.some((option) => option.option_text.trim())
    ) || null;
  const previewLessonWords = lessonWords
    .filter((word) => word.word.trim() || word.translation.trim())
    .slice(0, 4);
  const previewDictionaryLinkedLesson = lessons.find(
    (lesson) => String(lesson.id) === wordForm.lesson
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-[30px] border border-border bg-gradient-to-br from-card to-primary/5 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2">{isRu ? "Content Studio" : "Content Studio"}</h1>
            <p className="text-muted-foreground">
              {isRu
                ? "Единая студия для управления уроками, тестами, словарём и аналитикой учеников."
                : "Сабақтарды, тесттерді, сөздікті және оқушы аналитикасын басқаруға арналған біртұтас студия."}
            </p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("dashboard")}>
            {isRu ? "Назад в кабинет" : "Кабинетке оралу"}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>

      {error && (
        <Card className="mb-4 rounded-2xl border-destructive/30 bg-destructive/10 text-destructive">
          {error}
        </Card>
      )}
      {success && (
        <Card className="mb-4 rounded-2xl border-secondary/30 bg-secondary/10 text-secondary">
          {success}
        </Card>
      )}

      {activeTab === "lesson" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card className="rounded-[28px]">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2>
                {editingLessonId
                  ? isRu
                    ? `Редактирование урока #${editingLessonId}`
                    : `Сабақты өңдеу #${editingLessonId}`
                  : isRu
                    ? "Новый шаблон урока"
                    : "Жаңа сабақ шаблоны"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Название урока" : "Сабақ атауы"}
                value={lessonForm.title}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "YouTube video id" : "YouTube video id"}
                value={lessonForm.youtube_id}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, youtube_id: e.target.value }))
                }
              />
              <textarea
                className="md:col-span-2 rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Описание урока" : "Сабақ сипаттамасы"}
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Ссылка на обложку" : "Мұқаба сілтемесі"}
                value={lessonForm.thumbnail}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, thumbnail: e.target.value }))
                }
              />
              <input
                type="number"
                min={1}
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Длительность (минуты)" : "Ұзақтығы (минут)"}
                value={lessonForm.duration_minutes}
                onChange={(e) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    duration_minutes: Number(e.target.value || 1),
                  }))
                }
              />
              <select
                className="rounded-xl border border-border px-4 py-3"
                value={lessonForm.level}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, level: e.target.value }))}
              >
                {lessonLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-border px-4 py-3"
                value={lessonForm.category}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                {lessonCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lessonForm.is_published}
                  onChange={(e) =>
                    setLessonForm((prev) => ({ ...prev, is_published: e.target.checked }))
                  }
                />
                {isRu ? "Опубликовать сразу" : "Бірден жариялау"}
              </label>
              {editingLessonId && (
                <Button variant="ghost" onClick={resetLessonEditor}>
                  {isRu ? "Отменить редактирование" : "Өңдеуді болдырмау"}
                </Button>
              )}
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <h2>{isRu ? "Конструктор теста" : "Тест конструкторы"}</h2>
              </div>
              <Button variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4" />
                {isRu ? "Добавить вопрос" : "Сұрақ қосу"}
              </Button>
            </div>

            <div className="space-y-5">
              {testQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3>
                      {isRu ? `Вопрос #${questionIndex + 1}` : `Сұрақ #${questionIndex + 1}`}
                    </h3>
                    {testQuestions.length > 1 && (
                      <Button variant="ghost" onClick={() => removeQuestion(questionIndex)}>
                        {isRu ? "Удалить" : "Өшіру"}
                      </Button>
                    )}
                  </div>

                  <textarea
                    className="mb-3 w-full rounded-xl border border-border px-3 py-2"
                    placeholder={isRu ? "Текст вопроса" : "Сұрақ мәтіні"}
                    value={question.question_text}
                    onChange={(e) =>
                      updateQuestion(questionIndex, "question_text", e.target.value)
                    }
                  />
                  <textarea
                    className="mb-3 w-full rounded-xl border border-border px-3 py-2"
                    placeholder={isRu ? "Пояснение (необязательно)" : "Түсіндірме (міндетті емес)"}
                    value={question.explanation}
                    onChange={(e) =>
                      updateQuestion(questionIndex, "explanation", e.target.value)
                    }
                  />

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded-xl border border-border px-3 py-2"
                          placeholder={
                            isRu ? `Вариант ${optionIndex + 1}` : `Нұсқа ${optionIndex + 1}`
                          }
                          value={option.option_text}
                          onChange={(e) =>
                            updateOption(
                              questionIndex,
                              optionIndex,
                              "option_text",
                              e.target.value
                            )
                          }
                        />
                        <button
                          className={`rounded-xl px-3 py-2 text-sm ${
                            option.is_correct
                              ? "bg-secondary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                          onClick={() => setCorrectOption(questionIndex, optionIndex)}
                        >
                          {isRu ? "Верный" : "Дұрыс"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <h2>{isRu ? "Словарь этого урока" : "Осы сабақтың сөздігі"}</h2>
              <Button variant="outline" onClick={addLessonWord}>
                <Plus className="h-4 w-4" />
                {isRu ? "Добавить слово" : "Сөз қосу"}
              </Button>
            </div>

            <div className="space-y-4">
              {lessonWords.map((word, wordIndex) => (
                <div key={wordIndex} className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3>{isRu ? `Слово #${wordIndex + 1}` : `Сөз #${wordIndex + 1}`}</h3>
                    {lessonWords.length > 1 && (
                      <Button variant="ghost" onClick={() => removeLessonWord(wordIndex)}>
                        {isRu ? "Удалить" : "Өшіру"}
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder={isRu ? "Слово" : "Сөз"}
                      value={word.word}
                      onChange={(e) => updateLessonWord(wordIndex, "word", e.target.value)}
                    />
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder={isRu ? "Перевод" : "Аударма"}
                      value={word.translation}
                      onChange={(e) =>
                        updateLessonWord(wordIndex, "translation", e.target.value)
                      }
                    />
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder={isRu ? "Произношение" : "Айтылуы"}
                      value={word.pronunciation}
                      onChange={(e) =>
                        updateLessonWord(wordIndex, "pronunciation", e.target.value)
                      }
                    />
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder={isRu ? "Категория" : "Санат"}
                      value={word.category}
                      onChange={(e) =>
                        updateLessonWord(wordIndex, "category", e.target.value)
                      }
                    />
                    <select
                      className="rounded-xl border border-border px-3 py-2"
                      value={word.level}
                      onChange={(e) =>
                        updateLessonWord(
                          wordIndex,
                          "level",
                          e.target.value as LessonWordInput["level"]
                        )
                      }
                    >
                      {lessonLevelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <input
                      className="md:col-span-2 rounded-xl border border-border px-3 py-2"
                      placeholder={isRu ? "Пример предложения" : "Мысал сөйлем"}
                      value={word.example}
                      onChange={(e) => updateLessonWord(wordIndex, "example", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={submitLessonTemplate} disabled={loading}>
              {loading
                ? isRu
                  ? "Сохраняем..."
                  : "Сақталып жатыр..."
                : editingLessonId
                ? isRu
                  ? "Обновить шаблон урока"
                  : "Сабақ шаблонын жаңарту"
                : isRu
                  ? "Сохранить шаблон урока"
                  : "Сабақ шаблонын сақтау"}
            </Button>
          </div>

          <Card className="rounded-[28px] border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h2>{isRu ? "Предпросмотр" : "Алдын ала көрініс"}</h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative h-48">
                  <img
                    src={previewThumbnail}
                    alt={previewLessonTitle}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <LevelBadge level={lessonForm.level} size="sm" />
                    <span className="rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                      {previewLessonDuration} min
                    </span>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <h3>{previewLessonTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {previewLessonDescription}
                  </p>
                  <ProgressBar progress={35} color="primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs uppercase text-muted-foreground">
                    {isRu ? "Предпросмотр теста" : "Тесттің алдын ала көрінісі"}
                  </p>
                  {previewMainQuestion ? (
                    <>
                      <p className="mb-3 font-medium">{previewMainQuestion.question_text}</p>
                      <div className="space-y-2">
                        {previewMainQuestion.options
                          .filter((option) => option.option_text.trim())
                          .slice(0, 4)
                          .map((option, index) => (
                            <div
                              key={`${option.option_text}-${index}`}
                              className={`rounded-xl border px-3 py-2 text-sm ${
                                option.is_correct
                                  ? "border-secondary/30 bg-secondary/10"
                                  : "border-border"
                              }`}
                            >
                              {option.option_text}
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isRu
                        ? "Добавьте хотя бы один вопрос, чтобы увидеть тест."
                        : "Тестті көру үшін кемінде бір сұрақ қосыңыз."}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs uppercase text-muted-foreground">
                    {isRu ? "Предпросмотр словаря" : "Сөздік алдын ала көрінісі"}
                  </p>
                  {previewLessonWords.length > 0 ? (
                    <div className="space-y-2">
                      {previewLessonWords.map((word, index) => (
                        <div key={`${word.word}-${index}`} className="rounded-xl border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">
                              {word.word || (isRu ? "Слово" : "Сөз")}
                            </span>
                            <span className="text-xs text-muted-foreground">{word.level}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {word.translation || (isRu ? "Перевод" : "Аударма")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isRu
                        ? "Добавьте слова урока, чтобы увидеть карточки словаря."
                        : "Сөздік карточкаларын көру үшін сабақ сөздерін қосыңыз."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">{isRu ? "Созданные уроки" : "Жасалған сабақтар"}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="rounded-2xl border border-border p-4">
                  <h3 className="mb-2">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {lesson.level} - {lesson.category} - {lesson.duration_minutes} min
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tests: {lesson.question_count} - Words: {lesson.vocabulary_count}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="ghost" onClick={() => void startEditLesson(lesson.id)}>
                      <Pencil className="h-4 w-4" />
                      {isRu ? "Изменить" : "Өңдеу"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void deleteLesson(lesson.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isRu ? "Удалить" : "Өшіру"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      )}

      {activeTab === "dictionary" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card className="rounded-[28px]">
            <h2 className="mb-4">
              {editingWordId
                ? isRu
                  ? `Редактирование слова #${editingWordId}`
                  : `Сөзді өңдеу #${editingWordId}`
                : isRu
                  ? "Добавить слово в общий словарь"
                  : "Жалпы сөздікке сөз қосу"}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Слово" : "Сөз"}
                value={wordForm.word}
                onChange={(e) => setWordForm((prev) => ({ ...prev, word: e.target.value }))}
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Перевод" : "Аударма"}
                value={wordForm.translation}
                onChange={(e) =>
                  setWordForm((prev) => ({ ...prev, translation: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Произношение" : "Айтылуы"}
                value={wordForm.pronunciation}
                onChange={(e) =>
                  setWordForm((prev) => ({ ...prev, pronunciation: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Категория" : "Санат"}
                value={wordForm.category}
                onChange={(e) =>
                  setWordForm((prev) => ({ ...prev, category: e.target.value }))
                }
              />
              <input
                className="md:col-span-2 rounded-xl border border-border px-4 py-3"
                placeholder={isRu ? "Пример предложения" : "Мысал сөйлем"}
                value={wordForm.example}
                onChange={(e) => setWordForm((prev) => ({ ...prev, example: e.target.value }))}
              />
              <select
                className="rounded-xl border border-border px-4 py-3"
                value={wordForm.level}
                onChange={(e) => setWordForm((prev) => ({ ...prev, level: e.target.value }))}
              >
                {lessonLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-border px-4 py-3"
                value={wordForm.lesson}
                onChange={(e) => setWordForm((prev) => ({ ...prev, lesson: e.target.value }))}
              >
                <option value="">{isRu ? "Без привязки к уроку" : "Сабаққа байланыссыз"}</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={submitDictionaryWord} disabled={loading}>
                {editingWordId
                  ? isRu
                    ? "Обновить слово"
                    : "Сөзді жаңарту"
                  : isRu
                    ? "Добавить слово"
                    : "Сөз қосу"}
              </Button>
              {editingWordId && (
                <Button variant="ghost" onClick={resetWordEditor}>
                  {isRu ? "Отмена" : "Болдырмау"}
                </Button>
              )}
            </div>
          </Card>

          <Card className="rounded-[28px] border-secondary/20 bg-gradient-to-br from-card to-secondary/10">
            <div className="mb-4 flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-secondary" />
              <h2>{isRu ? "Предпросмотр словаря" : "Сөздік алдын ала көрінісі"}</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-1">{wordForm.word || (isRu ? "Слово" : "Сөз")}</h3>
                <p className="text-sm text-muted-foreground">
                  {wordForm.pronunciation || (isRu ? "Произношение" : "Айтылуы")}
                </p>
                <p className="mt-2">{wordForm.translation || (isRu ? "Перевод" : "Аударма")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {wordForm.example ||
                    (isRu
                      ? "Здесь появится пример предложения."
                      : "Мұнда мысал сөйлем көрінеді.")}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{wordForm.category || (isRu ? "Общее" : "Жалпы")}</span>
                  <span>{wordForm.level}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-2 text-xs uppercase text-muted-foreground">
                  {isRu ? "Привязанный урок" : "Байланысқан сабақ"}
                </p>
                <p className="font-medium">
                  {previewDictionaryLinkedLesson?.title ||
                    (isRu ? "Урок не выбран" : "Сабақ таңдалмаған")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {previewDictionaryLinkedLesson
                    ? `${previewDictionaryLinkedLesson.level} - ${translateCategory(
                        previewDictionaryLinkedLesson.category
                      )}`
                    : isRu
                      ? "Слово будет доступно в общем словаре."
                      : "Бұл сөз жалпы сөздікте қолжетімді болады."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">
              {(isRu ? "Словарь" : "Сөздік") + ` (${dictionary.length})`}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dictionary.slice(0, 60).map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-4">
                  <h3 className="mb-1">{item.word}</h3>
                  <p className="text-sm text-muted-foreground">{item.translation}</p>
                  {item.example && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.example}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(item.category ? translateCategory(item.category) : isRu ? "Общее" : "Жалпы")} -{" "}
                    {item.level || "-"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="ghost" onClick={() => startEditWord(item)}>
                      <Pencil className="h-4 w-4" />
                      {isRu ? "Изменить" : "Өңдеу"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void deleteWord(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isRu ? "Удалить" : "Өшіру"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      )}

      {activeTab === "students" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="rounded-[28px]">
            <h2 className="mb-4">{isRu ? "Мониторинг учеников" : "Оқушылар мониторингі"}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-3 py-3">{isRu ? "Ученик" : "Оқушы"}</th>
                    <th className="px-3 py-3">{isRu ? "Завершено" : "Аяқталды"}</th>
                    <th className="px-3 py-3">{isRu ? "В процессе" : "Орындалуда"}</th>
                    <th className="px-3 py-3">{isRu ? "Среднее" : "Орташа"}</th>
                    <th className="px-3 py-3">{isRu ? "Последний тест" : "Соңғы тест"}</th>
                    <th className="px-3 py-3">{isRu ? "Детали" : "Толығырақ"}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const expanded = expandedStudentId === student.user_id;
                    return (
                      <React.Fragment key={student.user_id}>
                        <tr className="border-b border-border/60">
                          <td className="px-3 py-3">
                            <div className="font-medium">{student.username}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </td>
                          <td className="px-3 py-3">{student.completed_lessons}</td>
                          <td className="px-3 py-3">{student.in_progress_lessons}</td>
                          <td className="px-3 py-3">{student.average_progress}%</td>
                          <td className="px-3 py-3">
                            {student.latest_test_attempt ? (
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  student.latest_test_attempt.passed
                                    ? "bg-secondary/15 text-secondary"
                                    : "bg-destructive/15 text-destructive"
                                }`}
                              >
                                {student.latest_test_attempt.score_percent}% -{" "}
                                {student.latest_test_attempt.lesson_title}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {isRu ? "Тестов пока нет" : "Тесттер әлі жоқ"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setExpandedStudentId((prev) =>
                                  prev === student.user_id ? null : student.user_id
                                )
                              }
                            >
                              {expanded
                                ? isRu
                                  ? "Скрыть"
                                  : "Жасыру"
                                : isRu
                                  ? "Открыть"
                                  : "Ашу"}
                            </Button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-b border-border/60 bg-muted/30">
                            <td className="px-3 py-4" colSpan={6}>
                              {student.lessons.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  {isRu
                                    ? "По урокам пока нет прогресса."
                                    : "Сабақтар бойынша прогресс әлі жоқ."}
                                </p>
                              ) : (
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                  {student.lessons.map((lesson) => (
                                    <div
                                      key={lesson.lesson_id}
                                      className="rounded-2xl border border-border bg-card p-3"
                                    >
                                      <p className="mb-2 font-medium">{lesson.lesson_title}</p>
                                      <p className="mb-2 text-xs text-muted-foreground">
                                        {(isRu ? "Обновлено" : "Жаңартылды")}:{" "}
                                        {formatDateTime(lesson.updated_at)}
                                      </p>
                                      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                          className={`h-full ${
                                            lesson.completed ? "bg-secondary" : "bg-primary"
                                          }`}
                                          style={{ width: `${lesson.progress}%` }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span>
                                          {lesson.progress}% {isRu ? "прогресс" : "прогресс"}
                                        </span>
                                        <span>
                                          {isRu ? "Тест" : "Тест"}: {lesson.test_score}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.section>
      )}

      {activeTab === "analytics" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card className="rounded-[28px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2>{isRu ? "Аналитика тестов" : "Тест аналитикасы"}</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-xl border border-border px-3 py-2"
                  value={analyticsLessonFilter}
                  onChange={(e) => setAnalyticsLessonFilter(e.target.value)}
                >
                  <option value="all">{isRu ? "Все уроки" : "Барлық сабақ"}</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <Button onClick={() => void refreshAnalytics()} disabled={loading}>
                  {isRu ? "Обновить" : "Жаңарту"}
                </Button>
              </div>
            </div>

            {analytics ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {isRu ? "Всего попыток" : "Барлық талпыныс"}
                  </p>
                  <p className="text-2xl font-semibold">{analytics.summary.total_attempts}</p>
                </div>
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {isRu ? "Средний балл" : "Орташа балл"}
                  </p>
                  <p className="text-2xl font-semibold">{analytics.summary.average_score}%</p>
                </div>
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {isRu ? "Процент прохождения" : "Өту пайызы"}
                  </p>
                  <p className="text-2xl font-semibold">{analytics.summary.pass_rate}%</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isRu ? "Аналитика пока пуста." : "Аналитика әзірше бос."}
              </p>
            )}
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">{isRu ? "Последние попытки" : "Соңғы талпыныстар"}</h2>
            {analytics && analytics.recent_attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-3 py-3">{isRu ? "Ученик" : "Оқушы"}</th>
                      <th className="px-3 py-3">{isRu ? "Урок" : "Сабақ"}</th>
                      <th className="px-3 py-3">{isRu ? "Баллы" : "Балл"}</th>
                      <th className="px-3 py-3">{isRu ? "Статус" : "Күйі"}</th>
                      <th className="px-3 py-3">{isRu ? "Дата" : "Күні"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_attempts.slice(0, 25).map((attempt) => (
                      <tr key={attempt.attempt_id} className="border-b border-border/60">
                        <td className="px-3 py-3">{attempt.username}</td>
                        <td className="px-3 py-3">{attempt.lesson_title}</td>
                        <td className="px-3 py-3">{attempt.score_percent}%</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              attempt.passed
                                ? "bg-secondary/15 text-secondary"
                                : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            {attempt.passed
                              ? isRu
                                ? "Пройден"
                                : "Өтті"
                              : isRu
                                ? "Не пройден"
                                : "Өтпеді"}
                          </span>
                        </td>
                        <td className="px-3 py-3">{formatDateTime(attempt.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isRu ? "Попыток пока нет." : "Талпыныстар әлі жоқ."}
              </p>
            )}
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">{isRu ? "Точность вопросов" : "Сұрақ дәлдігі"}</h2>
            {analytics && analytics.question_breakdown.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {analytics.question_breakdown.slice(0, 12).map((question) => (
                  <div key={question.question_id} className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">{question.lesson_title}</p>
                    <p className="mt-1 font-medium">
                      Q{question.order}: {question.question_text}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isRu ? "Попыток" : "Талпыныс"}: {question.attempts} -{" "}
                      {isRu ? "Верно" : "Дұрыс"}: {question.correct_rate}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isRu
                  ? "Аналитика вопросов появится после первых попыток."
                  : "Сұрақ аналитикасы алғашқы талпыныстардан кейін көрінеді."}
              </p>
            )}
          </Card>

          <Card className="rounded-[28px]">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <h2>{isRu ? "Журнал действий" : "Әрекет журналы"}</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="space-y-2">
                {auditLogs.slice(0, 20).map((logItem) => (
                  <div
                    key={logItem.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {logItem.username || (isRu ? "система" : "жүйе")}
                      </span>{" "}
                      <span className="text-muted-foreground">{logItem.action}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {logItem.entity_type}#{logItem.entity_id} - {formatDateTime(logItem.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isRu ? "Событий пока нет." : "Оқиғалар әлі жоқ."}
              </p>
            )}
          </Card>
        </motion.section>
      )}
    </div>
  );
};
