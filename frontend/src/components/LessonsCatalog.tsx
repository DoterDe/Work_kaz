import React, { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import api from "../api/axios";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { extractApiErrorMessage } from "../utils/apiError";
import { Card } from "./ui/Card";
import { LessonCard } from "./ui/LessonCard";
import { LevelBadge } from "./ui/LevelBadge";
import { SearchInput } from "./ui/SearchInput";

interface Lesson {
  id: number;
  title: string;
  description: string;
  level: "A1" | "A2" | "B1" | "B2";
  duration: number;
  duration_minutes: number;
  category: string;
  thumbnail: string;
  rating: number;
  youtube_id: string;
  progress: number;
}

interface Props {
  onNavigate: (page: string, lesson?: Lesson) => void;
}

type SortOption = "newest" | "rating" | "duration" | "title";

export function LessonsCatalog({ onNavigate }: Props) {
  const { language, translateCategory, formatMinutes } = useAppPreferences();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [onlyStarted, setOnlyStarted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const copy =
    language === "ru"
      ? {
          title: "Каталог видеоуроков",
          subtitle: "Фильтруйте по уровню, теме и прогрессу, чтобы быстро найти следующий урок.",
          lessons: "Уроки",
          started: "Начато",
          averageRating: "Средний рейтинг",
          searchPlaceholder: "Поиск по названию или ключевому слову...",
          levelLabel: "Уровень",
          categoryLabel: "Тема",
          onlyStarted: "Только начатые уроки",
          clearAll: "Сбросить всё",
          filters: "Фильтры",
          sortBy: "Сортировка",
          newest: "Сначала новые",
          rating: "Сначала высокий рейтинг",
          duration: "Сначала короткие",
          titleSort: "По названию А-Я",
          fetchError: "Не удалось загрузить уроки. Обновите страницу и попробуйте снова.",
          showing: "Показано уроков",
          noLessons: "По текущим условиям уроки не найдены",
          noLessonsDescription: "Измените фильтры или поисковый запрос.",
          resetFilters: "Сбросить фильтры",
          allTopics: "Все темы",
          activeLevel: "Уровень",
          activeCategory: "Тема",
          activeStarted: "Только начатые",
          activeSearch: "Поиск",
        }
      : {
          title: "Бейнесабақтар каталогы",
          subtitle: "Келесі сабақты тез табу үшін деңгейді, тақырыпты және прогресті сүзгіден өткізіңіз.",
          lessons: "Сабақтар",
          started: "Басталған",
          averageRating: "Орташа рейтинг",
          searchPlaceholder: "Атауы немесе кілтсөз бойынша іздеу...",
          levelLabel: "Деңгей",
          categoryLabel: "Тақырып",
          onlyStarted: "Тек басталған сабақтар",
          clearAll: "Барлығын тазарту",
          filters: "Сүзгілер",
          sortBy: "Сұрыптау",
          newest: "Алдымен жаңасы",
          rating: "Алдымен жоғары рейтинг",
          duration: "Алдымен қысқасы",
          titleSort: "Атауы бойынша А-Я",
          fetchError: "Сабақтарды жүктеу мүмкін болмады. Бетті жаңартып, қайта көріңіз.",
          showing: "Көрсетілген сабақ саны",
          noLessons: "Осы шарттар бойынша сабақтар табылмады",
          noLessonsDescription: "Сүзгілерді немесе іздеу сұрауын өзгертіп көріңіз.",
          resetFilters: "Сүзгілерді тазарту",
          allTopics: "Барлық тақырып",
          activeLevel: "Деңгей",
          activeCategory: "Тақырып",
          activeStarted: "Тек басталғаны",
          activeSearch: "Іздеу",
        };

  const levels = ["A1", "A2", "B1", "B2"];
  const categories = [
    "All Topics",
    "Everyday Speech",
    "Travel",
    "School & Education",
    "Work & Business",
    "Grammar",
    "Culture",
    "Food & Dining",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      setRequestError("");

      try {
        const response = await api.get<Lesson[]>("/lessons/", {
          params: {
            search: debouncedSearch || undefined,
            level: level || undefined,
            category: category && category !== "All Topics" ? category : undefined,
            ordering: sortBy,
          },
        });
        setLessons(response.data);
      } catch (error) {
        setLessons([]);
        setRequestError(
          extractApiErrorMessage(error, copy.fetchError)
        );
      } finally {
        setLoading(false);
      }
    };

    void loadLessons();
  }, [debouncedSearch, level, category, sortBy]);

  const displayedLessons = useMemo(
    () => (onlyStarted ? lessons.filter((lesson) => lesson.progress > 0) : lessons),
    [lessons, onlyStarted]
  );

  const stats = useMemo(() => {
    const started = lessons.filter((lesson) => lesson.progress > 0).length;
    const avgRating =
      lessons.length > 0
        ? lessons.reduce((acc, lesson) => acc + lesson.rating, 0) / lessons.length
        : 0;

    return {
      total: lessons.length,
      started,
      avgRating: avgRating.toFixed(1),
    };
  }, [lessons]);

  const activeFilters = [
    level ? `${copy.activeLevel}: ${level}` : null,
    category ? `${copy.activeCategory}: ${translateCategory(category)}` : null,
    onlyStarted ? copy.activeStarted : null,
    debouncedSearch ? `${copy.activeSearch}: ${debouncedSearch}` : null,
  ].filter(Boolean) as string[];

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setLevel(null);
    setCategory(null);
    setOnlyStarted(false);
    setSortBy("newest");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 rounded-[28px] border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="mb-2">{copy.title}</h1>
            <p className="text-muted-foreground">
              {copy.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">{copy.lessons}</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">{copy.started}</p>
              <p className="text-xl font-semibold">{stats.started}</p>
            </Card>
            <Card className="rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">{copy.averageRating}</p>
              <p className="text-xl font-semibold">{stats.avgRating}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-4 flex gap-3">
          <SearchInput
            className="flex-1"
            placeholder={copy.searchPlaceholder}
            value={search}
            onChange={setSearch}
          />
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="rounded-xl border border-border bg-card px-4 py-3 md:hidden"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {levels.map((item) => (
            <button key={item} onClick={() => setLevel(level === item ? null : item)}>
              <LevelBadge level={item} size="md" />
            </button>
          ))}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs"
              >
                {filter}
              </span>
            ))}
            <button className="text-sm text-primary hover:text-[#1557CC]" onClick={clearFilters}>
              {copy.clearAll}
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
          <Card className="space-y-6 rounded-[24px]">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Filter size={18} />
                <h3>{copy.filters}</h3>
              </div>

              <label className="mb-2 block text-sm text-muted-foreground">{copy.sortBy}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full rounded-xl border border-border bg-input-background px-3 py-2"
              >
                <option value="newest">{copy.newest}</option>
                <option value="rating">{copy.rating}</option>
                <option value="duration">{copy.duration}</option>
                <option value="title">{copy.titleSort}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted-foreground">{copy.categoryLabel}</label>
              <div className="space-y-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item === "All Topics" ? null : item)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      category === item || (!category && item === "All Topics")
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item === "All Topics" ? copy.allTopics : translateCategory(item)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyStarted}
                  onChange={(e) => setOnlyStarted(e.target.checked)}
                />
                {copy.onlyStarted}
              </label>
            </div>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          {requestError && (
            <Card className="mb-6 rounded-[24px] border-destructive/20 bg-destructive/10 text-sm text-destructive">
              {requestError}
            </Card>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-[24px] p-0">
                  <div className="h-40 animate-pulse bg-muted" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-full animate-pulse rounded bg-muted" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                {copy.showing}: {displayedLessons.length}
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {displayedLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    title={lesson.title}
                    level={lesson.level}
                    duration={formatMinutes(lesson.duration ?? lesson.duration_minutes)}
                    thumbnail={`https://img.youtube.com/vi/${lesson.youtube_id}/hqdefault.jpg`}
                    progress={lesson.progress}
                    onClick={() => onNavigate("lesson", lesson)}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && displayedLessons.length === 0 && (
            <Card className="rounded-[24px] py-12 text-center">
              <h3 className="mb-2">{copy.noLessons}</h3>
              <p className="mb-5 text-muted-foreground">{copy.noLessonsDescription}</p>
              <button className="text-primary hover:text-[#1557CC]" onClick={clearFilters}>
                {copy.resetFilters}
              </button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
