import React, { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal, Star } from "lucide-react";

import api from "../api/axios";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { extractApiErrorMessage } from "../utils/apiError";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { CardGlow } from "./ui/CardGlow";
import { LessonCard } from "./ui/LessonCard";
import { LevelBadge } from "./ui/LevelBadge";
import { SearchInput } from "./ui/SearchInput";
import { cn } from "./ui/utils";

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
          subtitle:
            "Фильтруйте по уровню, теме и прогрессу, чтобы быстро найти следующий урок.",
          lessons: "Уроки",
          started: "Начато",
          averageRating: "Средний рейтинг",
          searchPlaceholder: "Поиск по названию или ключевому слову...",
          levelLabel: "Уровень",
          categoryLabel: "Тема",
          onlyStarted: "Только начатые уроки",
          clearAll: "Сбросить все",
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
          toggleFilters: "Показать фильтры",
        }
      : {
          title: "Бейнесабақтар каталогы",
          subtitle:
            "Келесі сабақты тез табу үшін деңгейді, тақырыпты және прогресті сүзгіден өткізіңіз.",
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
          toggleFilters: "Сүзгілерді көрсету",
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
        setRequestError(extractApiErrorMessage(error, copy.fetchError));
      } finally {
        setLoading(false);
      }
    };

    void loadLessons();
  }, [debouncedSearch, level, category, sortBy]);

  const displayedLessons = useMemo(
    () => (onlyStarted ? lessons.filter((lesson) => lesson.progress > 0) : lessons),
    [lessons, onlyStarted],
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <CardGlow className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{copy.subtitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
              <Card padding="sm" className="text-center">
                <p className="text-xs text-muted-foreground">{copy.lessons}</p>
                <p className="text-xl font-semibold text-foreground">{stats.total}</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-muted-foreground">{copy.started}</p>
                <p className="text-xl font-semibold text-foreground">{stats.started}</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-muted-foreground">{copy.averageRating}</p>
                <p className="inline-flex items-center justify-center gap-1 text-xl font-semibold text-foreground">
                  {stats.avgRating}
                  <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                </p>
              </Card>
            </div>
          </div>
        </CardGlow>
      </section>

      <section className="mb-6">
        <div className="mb-4 flex gap-3">
          <SearchInput
            className="flex-1"
            placeholder={copy.searchPlaceholder}
            value={search}
            onChange={setSearch}
          />
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={copy.toggleFilters}
            aria-expanded={showFilters}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2" aria-label={copy.levelLabel}>
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={level === item}
              onClick={() => setLevel(level === item ? null : item)}
              className="interactive rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LevelBadge level={item} size="md" />
            </button>
          ))}
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {filter}
              </span>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {copy.clearAll}
            </Button>
          </div>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className={cn("lg:col-span-1", showFilters ? "block" : "hidden lg:block")}>
          <Card className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-base font-semibold text-foreground">{copy.filters}</h2>
              </div>

              <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="lesson-sort">
                {copy.sortBy}
              </label>
              <select
                id="lesson-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="h-11 w-full rounded-xl border border-border bg-input-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="newest">{copy.newest}</option>
                <option value="rating">{copy.rating}</option>
                <option value="duration">{copy.duration}</option>
                <option value="title">{copy.titleSort}</option>
              </select>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">{copy.categoryLabel}</h3>
              <div className="space-y-2">
                {categories.map((item) => {
                  const active = category === item || (!category && item === "All Topics");

                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(item === "All Topics" ? null : item)}
                      className={cn(
                        "interactive w-full rounded-xl border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item === "All Topics" ? copy.allTopics : translateCategory(item)}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="interactive inline-flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={onlyStarted}
                onChange={(event) => setOnlyStarted(event.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              {copy.onlyStarted}
            </label>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          {requestError ? (
            <Card className="mb-6 border-destructive/20 bg-destructive/10 text-sm text-destructive">
              {requestError}
            </Card>
          ) : null}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} padding="none" className="overflow-hidden">
                  <div className="h-40 animate-pulse bg-muted motion-reduce:animate-none" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="h-8 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
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

          {!loading && displayedLessons.length === 0 ? (
            <Card className="py-12 text-center">
              <h3 className="mb-2 text-xl font-semibold text-foreground">{copy.noLessons}</h3>
              <p className="mb-5 text-muted-foreground">{copy.noLessonsDescription}</p>
              <Button variant="outline" onClick={clearFilters}>
                {copy.resetFilters}
              </Button>
            </Card>
          ) : null}
        </main>
      </div>
    </div>
  );
}
