import React, { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import api from "../api/axios";
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
          extractApiErrorMessage(error, "Failed to load lessons. Please refresh the page.")
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
    level ? `Level: ${level}` : null,
    category ? `Category: ${category}` : null,
    onlyStarted ? "Only started lessons" : null,
    debouncedSearch ? `Search: ${debouncedSearch}` : null,
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
            <h1 className="mb-2">Video Lessons Catalog</h1>
            <p className="text-muted-foreground">
              Filter by level, category, and progress to find your next lesson.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Lessons</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-xl font-semibold">{stats.started}</p>
            </Card>
            <Card className="rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-semibold">{stats.avgRating}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-4 flex gap-3">
          <SearchInput
            className="flex-1"
            placeholder="Search by title or keyword..."
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
              Clear all
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
                <h3>Filters</h3>
              </div>

              <label className="mb-2 block text-sm text-muted-foreground">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full rounded-xl border border-border bg-input-background px-3 py-2"
              >
                <option value="newest">Newest first</option>
                <option value="rating">Highest rating</option>
                <option value="duration">Shortest duration</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted-foreground">Category</label>
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
                    {item}
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
                Only started lessons
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
                Showing {displayedLessons.length} lesson
                {displayedLessons.length === 1 ? "" : "s"}
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {displayedLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    title={lesson.title}
                    level={lesson.level}
                    duration={`${lesson.duration ?? lesson.duration_minutes} min`}
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
              <h3 className="mb-2">No lessons found</h3>
              <p className="mb-5 text-muted-foreground">
                Try changing filters or search query.
              </p>
              <button className="text-primary hover:text-[#1557CC]" onClick={clearFilters}>
                Reset filters
              </button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
