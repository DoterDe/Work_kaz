import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  Headphones,
  Play,
  Target,
  TrendingUp,
} from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { extractApiErrorMessage } from "../utils/apiError";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ThreeHeroCanvas } from "./ThreeHeroCanvas";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { LevelBadge } from "./ui/LevelBadge";

interface HomePageProps {
  onNavigate: (page: string, lesson?: Lesson) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (page: string | null) => void;
}

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

interface LessonsMeta {
  total_lessons: number;
  levels: Record<string, number>;
  categories: Array<{ category: string; count: number }>;
  average_rating: number;
  top_lessons: Array<{ id: number; title: string; rating: number }>;
}

export function HomePage({ onNavigate, setRedirectAfterLogin }: HomePageProps) {
  const { isAuthenticated } = useAuth();
  const [featuredLessons, setFeaturedLessons] = useState<Lesson[]>([]);
  const [meta, setMeta] = useState<LessonsMeta | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroRef = useRef<HTMLElement | null>(null);
  const galleryRef = useRef<HTMLElement | null>(null);

  const handleActionClick = (targetPage: string, lesson?: Lesson) => {
    if (isAuthenticated) {
      onNavigate(targetPage, lesson);
      return;
    }

    setRedirectAfterLogin(targetPage);
    onNavigate("login");
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const response = await api.get<LessonsMeta>("/lessons/meta/");
        setMeta(response.data);
      } catch (error) {
        setMeta(null);
        setRequestError((prev) =>
          prev || extractApiErrorMessage(error, "Failed to load homepage stats.")
        );
      }
    };

    void fetchMeta();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setFeaturedLessons([]);
      return;
    }

    const fetchLessons = async () => {
      setLoadingLessons(true);
      try {
        const response = await api.get<Lesson[]>("/lessons/", {
          params: { ordering: "rating", limit: 6 },
        });
        setFeaturedLessons(response.data);
      } catch (error) {
        setFeaturedLessons([]);
        setRequestError((prev) =>
          prev || extractApiErrorMessage(error, "Failed to load featured lessons.")
        );
      } finally {
        setLoadingLessons(false);
      }
    };

    void fetchLessons();
  }, [isAuthenticated]);

  useEffect(() => {
    const heroElement = heroRef.current;
    const galleryElement = galleryRef.current;
    if (!heroElement && !galleryElement) return;

    let frameId = 0;
    const applyScrollFx = () => {
      const scrollY = window.scrollY;
      const heroParallax = Math.min(scrollY * 0.18, 140);
      const heroScale = 1 + Math.min(scrollY / 9000, 0.05);

      if (heroElement) {
        heroElement.style.setProperty("--hero-parallax", `${heroParallax}px`);
        heroElement.style.setProperty("--hero-scale", heroScale.toFixed(4));
      }

      if (galleryElement) {
        const rect = galleryElement.getBoundingClientRect();
        const relative = window.innerHeight * 0.62 - rect.top;
        const shift = Math.max(-130, Math.min(130, relative * 0.22));
        galleryElement.style.setProperty("--gallery-shift", `${shift.toFixed(2)}px`);
      }

      frameId = 0;
    };

    const onScroll = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(applyScrollFx);
    };

    applyScrollFx();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!requestError) return;
    const timer = window.setTimeout(() => {
      setRequestError("");
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [requestError]);

  const levelCards = useMemo(
    () => [
      {
        level: "A1",
        title: "Beginner",
        description: "Build confidence with core vocabulary and phrases.",
        icon: BookOpen,
      },
      {
        level: "A2",
        title: "Elementary",
        description: "Speak in daily topics with clearer grammar control.",
        icon: Target,
      },
      {
        level: "B1",
        title: "Intermediate",
        description: "Understand longer conversations and cultural context.",
        icon: TrendingUp,
      },
      {
        level: "B2",
        title: "Upper Intermediate",
        description: "Communicate naturally and practice advanced structures.",
        icon: Award,
      },
    ],
    []
  );

  const features = [
    {
      icon: Play,
      title: "Video Lessons",
      description: "Practice with native speech and realistic conversations.",
    },
    {
      icon: Headphones,
      title: "Subtitle Modes",
      description: "Switch between Kazakh, Russian and combined subtitles.",
    },
    {
      icon: FileText,
      title: "Vocabulary Cards",
      description: "Review key words with examples and pronunciation hints.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Measure completed lessons and monitor your learning pace.",
    },
  ];

  const learnSteps = [
    {
      index: "01",
      title: "Watch",
      description: "Start with short native video lessons and context phrases.",
    },
    {
      index: "02",
      title: "Collect Words",
      description: "Build a personal dictionary from each lesson topic.",
    },
    {
      index: "03",
      title: "Pass Test",
      description: "Finish the lesson with a quiz and lock your score.",
    },
    {
      index: "04",
      title: "Track Growth",
      description: "See progress and continue exactly where you stopped.",
    },
  ];

  const heroStats = [
    {
      label: "Published Lessons",
      value: meta?.total_lessons?.toString() ?? "0",
    },
    {
      label: "Average Rating",
      value: meta ? meta.average_rating.toFixed(1) : "0.0",
    },
    {
      label: "Top Category",
      value: meta?.categories?.[0]?.category ?? "Travel",
    },
  ];

  const parallaxPhotos = [
    {
      title: "Immersive Listening",
      subtitle: "Native speech with contextual subtitles",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
      depth: "-0.45",
    },
    {
      title: "Real Practice",
      subtitle: "Vocabulary and tests that match each lesson",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
      depth: "0.2",
    },
    {
      title: "Visible Progress",
      subtitle: "See your level growth in one clean dashboard",
      image:
        "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80",
      depth: "0.7",
    },
  ];

  const faqItems = [
    {
      question: "Can I continue from where I stopped?",
      answer:
        "Yes. Lesson progress and test results are tied to your account, so your state is preserved across navigation.",
    },
    {
      question: "How do I unlock full lesson completion?",
      answer:
        "Watch the video, review lesson vocabulary and submit the final quiz. Passing the quiz marks the lesson as completed.",
    },
    {
      question: "Who can add lessons and tests?",
      answer:
        "Only content manager accounts can open Content Studio and publish/edit lessons, tests and dictionary content.",
    },
  ];

  return (
    <div>
      <section
        id="hero-section"
        ref={heroRef}
        className="hero-root relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10"
      >
        <div className="hero-scroll-backdrop" />
        <div className="hero-webgl-layer" aria-hidden="true">
          <ThreeHeroCanvas />
        </div>
        <div className="absolute -left-20 top-8 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-slide-up">
            <div className="mb-4 inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm">
              Learn Kazakh with practical, short-form lessons
            </div>
            <h1 className="mb-5 text-4xl leading-tight lg:text-6xl">
              Learn Kazakh through real video lessons
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Build speaking confidence using native content, vocabulary review,
              and progress analytics that keep your routine consistent.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => handleActionClick("catalog")}>
                Start Learning
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleActionClick("vocabulary")}
              >
                Practice Vocabulary
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {heroStats.map((item, idx) => (
                <Card
                  key={item.label}
                  className="animate-fade-slide-up rounded-2xl p-4"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{item.value}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="overflow-hidden rounded-[32px] border border-border shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1600&q=80"
                alt="Students studying online"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {requestError && (
        <div className="mx-auto mt-4 max-w-7xl px-4">
          <Card className="rounded-2xl border-destructive/30 bg-destructive/10 text-sm text-destructive">
            {requestError}
          </Card>
        </div>
      )}

      <section ref={galleryRef} className="photo-parallax-section py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3">Cinematic Learning Experience</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Large visual blocks move with scroll and create depth without slowing the page.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {parallaxPhotos.map((item, index) => (
              <article
                key={item.title}
                className="photo-parallax-card animate-fade-slide-up"
                style={
                  {
                    "--photo-depth": item.depth,
                    animationDelay: `${index * 0.08}s`,
                  } as React.CSSProperties
                }
              >
                <div className="photo-parallax-media">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="photo-parallax-content">
                  <h3 className="mb-1 text-white">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flow-section" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3">How The Learning Flow Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A structured loop that helps learners move from video input to active speaking.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {learnSteps.map((step, idx) => (
              <Card
                key={step.index}
                hover
                className="animate-fade-slide-up rounded-[24px] text-center"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <p className="mb-2 text-2xl font-semibold text-primary">{step.index}</p>
                <h3 className="mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3">Choose Your Level</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Follow a level-based path from beginner to upper intermediate.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {levelCards.map((item, index) => {
              const Icon = item.icon;
              const count = meta?.levels?.[item.level] ?? 0;
              return (
                <Card
                  key={item.level}
                  hover
                  className="animate-fade-slide-up cursor-pointer rounded-[24px] text-center"
                  style={{ animationDelay: `${index * 0.07}s` }}
                  onClick={() => handleActionClick("catalog")}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <LevelBadge level={item.level} size="md" />
                  <h3 className="mb-2 mt-3">{item.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm text-primary">{count} lessons</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="mb-2">Top Rated Lessons</h2>
            <p className="text-muted-foreground">
              Curated lessons to help you start with high-impact topics.
            </p>
          </div>
          <Button variant="outline" onClick={() => handleActionClick("catalog")}>
            Open Catalog
          </Button>
        </div>

        {!isAuthenticated && (
          <Card className="rounded-[24px] border-dashed text-center">
            <h3 className="mb-2">Sign in to access lessons</h3>
            <p className="mb-5 text-muted-foreground">
              The catalog and dashboard are available after authentication.
            </p>
            <Button onClick={() => onNavigate("login")}>Login to Continue</Button>
          </Card>
        )}

        {isAuthenticated && loadingLessons && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="rounded-[24px] p-0">
                <div className="h-48 animate-pulse bg-muted" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-full animate-pulse rounded bg-muted" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {isAuthenticated && !loadingLessons && featuredLessons.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredLessons.map((lesson, index) => {
              const duration = lesson.duration ?? lesson.duration_minutes;
              return (
                <Card
                  key={lesson.id}
                  hover
                  className="animate-fade-slide-up cursor-pointer overflow-hidden p-0"
                  style={{ animationDelay: `${index * 0.07}s` }}
                  onClick={() => handleActionClick("lesson", lesson)}
                >
                  <div className="relative h-48 bg-black/5">
                    <img
                      src={`https://img.youtube.com/vi/${lesson.youtube_id}/hqdefault.jpg`}
                      alt={lesson.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1">{lesson.title}</h3>
                    <div className="mb-3 flex items-center justify-between">
                      <LevelBadge level={lesson.level} size="sm" />
                      <span className="text-sm text-muted-foreground">{duration} min</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${lesson.progress}%` }} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {isAuthenticated && !loadingLessons && featuredLessons.length === 0 && (
          <Card className="rounded-[24px] text-center">
            <h3 className="mb-2">No featured lessons yet</h3>
            <p className="text-muted-foreground">
              Add published lessons in Django Admin to populate this section.
            </p>
          </Card>
        )}
      </section>

      <section id="support-section" className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3">Everything Needed For Learning</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A compact toolkit focused on speaking practice and retention.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  hover
                  className="animate-fade-slide-up rounded-[24px]"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq-section" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3">FAQ</h2>
            <p className="text-muted-foreground">
              Quick answers about lessons, progress, and content management.
            </p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <Card key={item.question} className="rounded-2xl p-0">
                  <button
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                    }
                  >
                    <span className="font-medium">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="animate-fade-slide-up border-t border-border px-5 py-4 text-sm text-muted-foreground">
                      {item.answer}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
