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
      { id: "lesson", label: "Lesson Template", icon: Video },
      { id: "dictionary", label: "Dictionary", icon: BookOpenCheck },
      { id: "students", label: "Students Progress", icon: UsersRound },
      { id: "analytics", label: "Test Analytics", icon: BarChart3 },
    ] as const,
    []
  );

  const resetFeedback = () => {
    setError("");
    setSuccess("");
  };

  const formatDateTime = (isoValue?: string) => {
    if (!isoValue) return "-";
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
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
          "Studio endpoints are unavailable. Check that you are logged in as the content manager."
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
      setSuccess("Lesson loaded into editor.");
    } catch (error) {
      setError(extractApiErrorMessage(error, "Failed to load lesson template for editing."));
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
      setSuccess("Lesson deleted successfully.");
      await loadStudioData(true);
    } catch (error) {
      setError(extractApiErrorMessage(error, "Failed to delete lesson."));
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
        setSuccess("Lesson template updated successfully.");
      } else {
        await api.post("/studio/lessons/template/", {
          ...lessonPayload,
          test_questions: questionsPayload,
          vocabulary_words: wordsPayload,
        });
        setSuccess("Lesson template saved successfully.");
      }

      resetLessonEditor();
      await loadStudioData(true);
    } catch (error) {
      setError(
        extractApiErrorMessage(
          error,
          "Failed to save lesson template. Please validate fields and try again."
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
      setSuccess("Word deleted successfully.");
      await loadStudioData(true);
    } catch (error) {
      setError(extractApiErrorMessage(error, "Failed to delete word."));
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
        setSuccess("Word updated successfully.");
      } else {
        await api.post("/studio/vocabulary/", payload);
        setSuccess("Word added to dictionary.");
      }

      resetWordEditor();
      await loadStudioData(true);
    } catch (error) {
      setError(extractApiErrorMessage(error, "Failed to save dictionary word."));
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
      setError(extractApiErrorMessage(error, "Failed to load analytics."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      void refreshAnalytics();
    }
  }, [activeTab, analyticsLessonFilter]);

  const previewLessonTitle = lessonForm.title.trim() || "Your lesson title";
  const previewLessonDescription =
    lessonForm.description.trim() || "Lesson description preview will appear here.";
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
            <h1 className="mb-2">Content Studio</h1>
            <p className="text-muted-foreground">
              Single-manager control panel for lessons, tests, words and student analytics.
            </p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("dashboard")}>
            Back to Dashboard
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
              <h2>{editingLessonId ? `Editing Lesson #${editingLessonId}` : "New Lesson Template"}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Lesson title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="YouTube video id"
                value={lessonForm.youtube_id}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, youtube_id: e.target.value }))
                }
              />
              <textarea
                className="md:col-span-2 rounded-xl border border-border px-4 py-3"
                placeholder="Lesson description"
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Thumbnail URL"
                value={lessonForm.thumbnail}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, thumbnail: e.target.value }))
                }
              />
              <input
                type="number"
                min={1}
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Duration (minutes)"
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
                Publish immediately
              </label>
              {editingLessonId && (
                <Button variant="ghost" onClick={resetLessonEditor}>
                  Cancel editing
                </Button>
              )}
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <h2>Lesson Test Builder</h2>
              </div>
              <Button variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            <div className="space-y-5">
              {testQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3>Question #{questionIndex + 1}</h3>
                    {testQuestions.length > 1 && (
                      <Button variant="ghost" onClick={() => removeQuestion(questionIndex)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <textarea
                    className="mb-3 w-full rounded-xl border border-border px-3 py-2"
                    placeholder="Question text"
                    value={question.question_text}
                    onChange={(e) =>
                      updateQuestion(questionIndex, "question_text", e.target.value)
                    }
                  />
                  <textarea
                    className="mb-3 w-full rounded-xl border border-border px-3 py-2"
                    placeholder="Explanation (optional)"
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
                          placeholder={`Option ${optionIndex + 1}`}
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
                          Correct
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
              <h2>Vocabulary For This Lesson</h2>
              <Button variant="outline" onClick={addLessonWord}>
                <Plus className="h-4 w-4" />
                Add Word
              </Button>
            </div>

            <div className="space-y-4">
              {lessonWords.map((word, wordIndex) => (
                <div key={wordIndex} className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3>Word #{wordIndex + 1}</h3>
                    {lessonWords.length > 1 && (
                      <Button variant="ghost" onClick={() => removeLessonWord(wordIndex)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder="Word"
                      value={word.word}
                      onChange={(e) => updateLessonWord(wordIndex, "word", e.target.value)}
                    />
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder="Translation"
                      value={word.translation}
                      onChange={(e) =>
                        updateLessonWord(wordIndex, "translation", e.target.value)
                      }
                    />
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder="Pronunciation"
                      value={word.pronunciation}
                      onChange={(e) =>
                        updateLessonWord(wordIndex, "pronunciation", e.target.value)
                      }
                    />
                    <input
                      className="rounded-xl border border-border px-3 py-2"
                      placeholder="Category"
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
                      placeholder="Example sentence"
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
                ? "Saving..."
                : editingLessonId
                ? "Update Lesson Template"
                : "Save Lesson Template"}
            </Button>
          </div>

          <Card className="rounded-[28px] border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <div className="mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h2>Live Preview</h2>
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
                  <p className="mb-2 text-xs uppercase text-muted-foreground">Final Test Preview</p>
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
                      Add at least one question to see test preview.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs uppercase text-muted-foreground">Vocabulary Preview</p>
                  {previewLessonWords.length > 0 ? (
                    <div className="space-y-2">
                      {previewLessonWords.map((word, index) => (
                        <div key={`${word.word}-${index}`} className="rounded-xl border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{word.word || "Word"}</span>
                            <span className="text-xs text-muted-foreground">{word.level}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {word.translation || "Translation"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add lesson words to see vocabulary cards preview.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">Created Lessons</h2>
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
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void deleteLesson(lesson.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
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
                ? `Edit Dictionary Word #${editingWordId}`
                : "Add Word To Global Dictionary"}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Word"
                value={wordForm.word}
                onChange={(e) => setWordForm((prev) => ({ ...prev, word: e.target.value }))}
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Translation"
                value={wordForm.translation}
                onChange={(e) =>
                  setWordForm((prev) => ({ ...prev, translation: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Pronunciation"
                value={wordForm.pronunciation}
                onChange={(e) =>
                  setWordForm((prev) => ({ ...prev, pronunciation: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-border px-4 py-3"
                placeholder="Category"
                value={wordForm.category}
                onChange={(e) =>
                  setWordForm((prev) => ({ ...prev, category: e.target.value }))
                }
              />
              <input
                className="md:col-span-2 rounded-xl border border-border px-4 py-3"
                placeholder="Example sentence"
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
                <option value="">No lesson link</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={submitDictionaryWord} disabled={loading}>
                {editingWordId ? "Update Word" : "Add Word"}
              </Button>
              {editingWordId && (
                <Button variant="ghost" onClick={resetWordEditor}>
                  Cancel
                </Button>
              )}
            </div>
          </Card>

          <Card className="rounded-[28px] border-secondary/20 bg-gradient-to-br from-card to-secondary/10">
            <div className="mb-4 flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-secondary" />
              <h2>Dictionary Live Preview</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-1">{wordForm.word || "Word"}</h3>
                <p className="text-sm text-muted-foreground">
                  {wordForm.pronunciation || "Pronunciation"}
                </p>
                <p className="mt-2">{wordForm.translation || "Translation"}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {wordForm.example || "Example sentence will appear here."}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{wordForm.category || "General"}</span>
                  <span>{wordForm.level}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-2 text-xs uppercase text-muted-foreground">Linked lesson</p>
                <p className="font-medium">
                  {previewDictionaryLinkedLesson?.title || "No lesson selected"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {previewDictionaryLinkedLesson
                    ? `${previewDictionaryLinkedLesson.level} - ${previewDictionaryLinkedLesson.category}`
                    : "This word will be global in dictionary."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">Dictionary Preview ({dictionary.length})</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dictionary.slice(0, 60).map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-4">
                  <h3 className="mb-1">{item.word}</h3>
                  <p className="text-sm text-muted-foreground">{item.translation}</p>
                  {item.example && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.example}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.category || "General"} - {item.level || "-"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="ghost" onClick={() => startEditWord(item)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void deleteWord(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
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
            <h2 className="mb-4">Students Monitoring</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Completed</th>
                    <th className="px-3 py-3">In Progress</th>
                    <th className="px-3 py-3">Average</th>
                    <th className="px-3 py-3">Latest Test</th>
                    <th className="px-3 py-3">Details</th>
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
                              <span className="text-muted-foreground">No tests yet</span>
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
                              {expanded ? "Hide" : "View"}
                            </Button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-b border-border/60 bg-muted/30">
                            <td className="px-3 py-4" colSpan={6}>
                              {student.lessons.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No lesson progress yet.
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
                                        Updated: {formatDateTime(lesson.updated_at)}
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
                                        <span>{lesson.progress}% progress</span>
                                        <span>Test: {lesson.test_score}%</span>
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
                <h2>Lesson Test Analytics</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-xl border border-border px-3 py-2"
                  value={analyticsLessonFilter}
                  onChange={(e) => setAnalyticsLessonFilter(e.target.value)}
                >
                  <option value="all">All lessons</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <Button onClick={() => void refreshAnalytics()} disabled={loading}>
                  Refresh
                </Button>
              </div>
            </div>

            {analytics ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-semibold">{analytics.summary.total_attempts}</p>
                </div>
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-semibold">{analytics.summary.average_score}%</p>
                </div>
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-semibold">{analytics.summary.pass_rate}%</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No analytics data yet.</p>
            )}
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">Recent Test Attempts</h2>
            {analytics && analytics.recent_attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-3 py-3">Student</th>
                      <th className="px-3 py-3">Lesson</th>
                      <th className="px-3 py-3">Score</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Date</th>
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
                            {attempt.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-3 py-3">{formatDateTime(attempt.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attempts yet.</p>
            )}
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="mb-4">Question Accuracy</h2>
            {analytics && analytics.question_breakdown.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {analytics.question_breakdown.slice(0, 12).map((question) => (
                  <div key={question.question_id} className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">{question.lesson_title}</p>
                    <p className="mt-1 font-medium">
                      Q{question.order}: {question.question_text}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Attempts: {question.attempts} - Correct: {question.correct_rate}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Question analytics will appear after attempts.</p>
            )}
          </Card>

          <Card className="rounded-[28px]">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <h2>Audit Log</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="space-y-2">
                {auditLogs.slice(0, 20).map((logItem) => (
                  <div
                    key={logItem.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{logItem.username || "system"}</span>{" "}
                      <span className="text-muted-foreground">{logItem.action}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {logItem.entity_type}#{logItem.entity_id} - {formatDateTime(logItem.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No audit events yet.</p>
            )}
          </Card>
        </motion.section>
      )}
    </div>
  );
};

