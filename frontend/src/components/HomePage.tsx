import React, { useEffect, useMemo, useState } from "react";
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
import { useAppPreferences } from "../context/AppPreferencesContext";
import { extractApiErrorMessage } from "../utils/apiError";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { CardGlow } from "./ui/CardGlow";
import { LessonCard } from "./ui/LessonCard";
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
  const { language, translateCategory } = useAppPreferences();
  const [featuredLessons, setFeaturedLessons] = useState<Lesson[]>([]);
  const [meta, setMeta] = useState<LessonsMeta | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const copy =
    language === "ru"
      ? {
          statsError: "Не удалось загрузить статистику главной страницы.",
          featuredError: "Не удалось загрузить рекомендуемые уроки.",
          heroBadge: "Видео, словарь и тесты в одном учебном цикле",
          heroTitle: "Учите казахский через живые видеосюжеты",
          heroDescription:
            "Смотрите короткие уроки, разбирайте слова, проходите мини-тесты и сохраняйте прогресс без лишней сложности.",
          startLearning: "Начать обучение",
          practiceVocabulary: "Тренировать словарь",
          publishedLessons: "Уроки",
          averageRating: "Средний рейтинг",
          topCategory: "Главная тема",
          fallbackCategory: "Путешествия",
          flowTitle: "Как устроен учебный цикл",
          flowDescription:
            "Понятная последовательность переводит ученика от просмотра к активной речи и закреплению.",
          levelsTitle: "Выберите свой уровень",
          levelsDescription:
            "Двигайтесь по понятной траектории от первых фраз до уверенного общения.",
          topLessonsTitle: "Лучшие уроки для старта",
          topLessonsDescription:
            "Подборка уроков с высоким рейтингом, чтобы быстрее войти в ритм.",
          openCatalog: "Открыть каталог",
          signInTitle: "Войдите, чтобы открыть уроки",
          signInDescription:
            "Каталог, словарь и личный кабинет становятся доступны после авторизации.",
          loginToContinue: "Войти и продолжить",
          noLessonsTitle: "Рекомендуемые уроки пока не появились",
          noLessonsDescription:
            "Добавьте опубликованные уроки через Django Admin или Content Studio, и они появятся здесь.",
          supportTitle: "Все, что нужно для устойчивой практики",
          supportDescription:
            "Короткий, но сильный набор инструментов для просмотра, запоминания и самопроверки.",
          faqTitle: "Частые вопросы",
          faqDescription: "Короткие ответы про уроки, прогресс и публикацию контента.",
          lessonsSuffix: "уроков",
          minutes: "мин",
          levelCards: [
            {
              level: "A1",
              title: "Старт",
              description: "Освойте базовые слова, приветствия и повседневные фразы.",
              icon: BookOpen,
            },
            {
              level: "A2",
              title: "Разговорная база",
              description: "Говорите о повседневных темах и увереннее стройте фразы.",
              icon: Target,
            },
            {
              level: "B1",
              title: "Уверенное общение",
              description: "Понимайте длинные диалоги и культурный контекст.",
              icon: TrendingUp,
            },
            {
              level: "B2",
              title: "Свободная практика",
              description: "Используйте сложные конструкции и звучите естественнее.",
              icon: Award,
            },
          ],
          features: [
            {
              icon: Play,
              title: "Живые видеоуроки",
              description: "Реальная речь, ситуации и словарь, который можно сразу применить.",
            },
            {
              icon: Headphones,
              title: "Гибкий темп",
              description: "Возвращайтесь к урокам, словам и тестам тогда, когда удобно.",
            },
            {
              icon: FileText,
              title: "Умные карточки слов",
              description: "Повторяйте слова с примерами, произношением и контекстом.",
            },
            {
              icon: BarChart3,
              title: "Прогресс без хаоса",
              description: "Следите за уроками, тестами и темпом обучения в одном месте.",
            },
          ],
          learnSteps: [
            {
              index: "01",
              title: "Смотрите",
              description: "Начните с короткого видео и поймайте живой контекст.",
            },
            {
              index: "02",
              title: "Собирайте слова",
              description: "Перенесите ключевые слова урока в личную языковую базу.",
            },
            {
              index: "03",
              title: "Закрепляйте тестом",
              description: "Проверьте понимание и сразу увидьте результат.",
            },
            {
              index: "04",
              title: "Держите темп",
              description: "Возвращайтесь туда, где остановились, и двигайтесь дальше.",
            },
          ],
          faqItems: [
            {
              question: "Можно ли продолжить с того места, где я остановился?",
              answer:
                "Да. Прогресс по урокам и результаты тестов привязаны к вашему аккаунту и сохраняются между переходами.",
            },
            {
              question: "Как засчитывается полное прохождение урока?",
              answer:
                "Посмотрите видео, разберите словарь урока и отправьте финальный тест. Успешная сдача отмечает урок как завершенный.",
            },
            {
              question: "Кто может добавлять уроки и тесты?",
              answer:
                "Публикацией и редактированием контента занимается аккаунт контент-менеджера через Content Studio.",
            },
          ],
        }
      : {
          statsError: "Басты бет статистикасын жүктеу мүмкін болмады.",
          featuredError: "Ұсынылған сабақтарды жүктеу мүмкін болмады.",
          heroBadge: "Видео, сөздік және тест бір оқу циклінде",
          heroTitle: "Қазақ тілін шынайы бейнесюжеттер арқылы үйреніңіз",
          heroDescription:
            "Қысқа сабақ көріп, сөздерді талдап, шағын тесттен өтіп, прогресті артық жүктемесіз бақылаңыз.",
          startLearning: "Оқуды бастау",
          practiceVocabulary: "Сөздікті жаттықтыру",
          publishedLessons: "Сабақтар",
          averageRating: "Орташа рейтинг",
          topCategory: "Негізгі санат",
          fallbackCategory: "Саяхат",
          flowTitle: "Оқу циклі қалай жұмыс істейді",
          flowDescription:
            "Түсінікті рет оқушыны көруден белсенді сөйлеуге және бекітуге апарады.",
          levelsTitle: "Өз деңгейіңізді таңдаңыз",
          levelsDescription:
            "Алғашқы тіркестерден сенімді қарым-қатынасқа дейінгі айқын траекториямен жүріңіз.",
          topLessonsTitle: "Бастауға арналған үздік сабақтар",
          topLessonsDescription:
            "Ырғаққа тез ену үшін жоғары бағаланған сабақтар топтамасы.",
          openCatalog: "Каталогты ашу",
          signInTitle: "Сабақтарды ашу үшін кіріңіз",
          signInDescription:
            "Каталог, сөздік және жеке кабинет авторизациядан кейін қолжетімді болады.",
          loginToContinue: "Кіру және жалғастыру",
          noLessonsTitle: "Ұсынылған сабақтар әзірге жоқ",
          noLessonsDescription:
            "Жарияланған сабақтарды Django Admin немесе Content Studio арқылы қосыңыз, сонда олар осында көрінеді.",
          supportTitle: "Тұрақты практикаға қажет құралдар",
          supportDescription:
            "Көру, есте сақтау және өзін тексеруге арналған қысқа әрі мықты құралдар жинағы.",
          faqTitle: "Жиі қойылатын сұрақтар",
          faqDescription: "Сабақ, прогресс және контент жариялау туралы қысқа жауаптар.",
          lessonsSuffix: "сабақ",
          minutes: "мин",
          levelCards: [
            {
              level: "A1",
              title: "Бастау",
              description: "Базалық сөздерді, амандасуды және күнделікті тіркестерді меңгеріңіз.",
              icon: BookOpen,
            },
            {
              level: "A2",
              title: "Сөйлеу базасы",
              description: "Күнделікті тақырыптарда сөйлеп, фразаларды сенімді құраңыз.",
              icon: Target,
            },
            {
              level: "B1",
              title: "Сенімді қарым-қатынас",
              description: "Ұзақ диалогтарды және мәдени контексті түсініңіз.",
              icon: TrendingUp,
            },
            {
              level: "B2",
              title: "Еркін практика",
              description: "Күрделі құрылымдарды қолданып, табиғи сөйлеуге жақындаңыз.",
              icon: Award,
            },
          ],
          features: [
            {
              icon: Play,
              title: "Тірі бейнесабақтар",
              description: "Бірден қолдануға болатын шынайы сөздер мен жағдайлар.",
            },
            {
              icon: Headphones,
              title: "Икемді қарқын",
              description: "Сабақтарға, сөздерге және тесттерге өзіңізге ыңғайлы уақытта оралыңыз.",
            },
            {
              icon: FileText,
              title: "Ақылды сөз карточкалары",
              description: "Сөздерді мысал, айтылу және контекст арқылы қайталаңыз.",
            },
            {
              icon: BarChart3,
              title: "Ретті прогресс",
              description: "Сабақ, тест және оқу қарқынын бір жерден бақылаңыз.",
            },
          ],
          learnSteps: [
            {
              index: "01",
              title: "Көріңіз",
              description: "Қысқа видеодан бастап, тірі контексті сезініңіз.",
            },
            {
              index: "02",
              title: "Сөз жинаңыз",
              description: "Сабақтағы негізгі сөздерді жеке тілдік базаға қосыңыз.",
            },
            {
              index: "03",
              title: "Тестпен бекітіңіз",
              description: "Түсінікті тексеріп, нәтижені бірден көріңіз.",
            },
            {
              index: "04",
              title: "Қарқынды сақтаңыз",
              description: "Тоқтаған жеріңізден жалғастырып, әрі қарай жүріңіз.",
            },
          ],
          faqItems: [
            {
              question: "Тоқтаған жерімнен жалғастыра аламын ба?",
              answer:
                "Иә. Сабақ прогресі мен тест нәтижелері аккаунтқа байланып, беттер арасында сақталады.",
            },
            {
              question: "Сабақты толық өту үшін не істеу керек?",
              answer:
                "Видеоны көріп, сабақ сөздігін қайталап, қорытынды тест тапсырыңыз. Сәтті нәтиже сабақтың аяқталғанын белгілейді.",
            },
            {
              question: "Сабақтар мен тесттерді кім қоса алады?",
              answer:
                "Контентті тек контент-менеджер аккаунты Content Studio арқылы жариялап, өңдей алады.",
            },
          ],
        };

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
        setRequestError((prev) => prev || extractApiErrorMessage(error, copy.statsError));
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
        setRequestError((prev) => prev || extractApiErrorMessage(error, copy.featuredError));
      } finally {
        setLoadingLessons(false);
      }
    };

    void fetchLessons();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!requestError) return undefined;
    const timer = window.setTimeout(() => {
      setRequestError("");
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [requestError]);

  const levelCards = useMemo(() => copy.levelCards, [copy.levelCards]);
  const heroStats = [
    {
      label: copy.publishedLessons,
      value: meta?.total_lessons?.toString() ?? "0",
    },
    {
      label: copy.averageRating,
      value: meta ? meta.average_rating.toFixed(1) : "0.0",
    },
    {
      label: copy.topCategory,
      value: translateCategory(meta?.categories?.[0]?.category ?? copy.fallbackCategory),
    },
  ];

  return (
    <div>
      <section id="hero-section" className="relative overflow-hidden border-b border-border/70 bg-background">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              {copy.heroBadge}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {copy.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => handleActionClick("catalog")}>
                {copy.startLearning}
              </Button>
              <Button variant="outline" size="lg" onClick={() => handleActionClick("vocabulary")}>
                {copy.practiceVocabulary}
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <Card key={item.label} padding="sm" className="bg-card/70">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
                </Card>
              ))}
            </div>
          </div>

          <CardGlow padding="none" className="overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1600&q=80"
              alt="Students studying online"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </CardGlow>
        </div>
      </section>

      {requestError ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="border-destructive/30 bg-destructive/10 text-sm text-destructive" role="alert">
            {requestError}
          </Card>
        </div>
      ) : null}

      <section id="flow-section" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-foreground">{copy.flowTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{copy.flowDescription}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {copy.learnSteps.map((step) => (
              <Card key={step.index} hover className="text-center">
                <p className="mb-2 text-2xl font-semibold text-primary">{step.index}</p>
                <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/35 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-foreground">{copy.levelsTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{copy.levelsDescription}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {levelCards.map((item) => {
              const Icon = item.icon;
              const count = meta?.levels?.[item.level] ?? 0;

              return (
                <Card
                  key={item.level}
                  hover
                  className="text-center"
                  onClick={() => handleActionClick("catalog")}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <LevelBadge level={item.level} size="md" />
                  <h3 className="mb-2 mt-3 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm text-primary">
                    {count} {copy.lessonsSuffix}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-semibold text-foreground">{copy.topLessonsTitle}</h2>
            <p className="max-w-2xl text-muted-foreground">{copy.topLessonsDescription}</p>
          </div>
          <Button variant="outline" onClick={() => handleActionClick("catalog")}>
            {copy.openCatalog}
          </Button>
        </div>

        {!isAuthenticated ? (
          <Card className="border-dashed text-center">
            <h3 className="mb-2 text-xl font-semibold text-foreground">{copy.signInTitle}</h3>
            <p className="mb-5 text-muted-foreground">{copy.signInDescription}</p>
            <Button onClick={() => onNavigate("login")}>{copy.loginToContinue}</Button>
          </Card>
        ) : null}

        {isAuthenticated && loadingLessons ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} padding="none" className="overflow-hidden">
                <div className="h-48 animate-pulse bg-muted motion-reduce:animate-none" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-2 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {isAuthenticated && !loadingLessons && featuredLessons.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredLessons.map((lesson) => {
              const duration = lesson.duration ?? lesson.duration_minutes;
              const thumbnail = lesson.youtube_id
                ? `https://img.youtube.com/vi/${lesson.youtube_id}/hqdefault.jpg`
                : lesson.thumbnail;

              return (
                <LessonCard
                  key={lesson.id}
                  title={lesson.title}
                  level={lesson.level}
                  duration={`${duration} ${copy.minutes}`}
                  thumbnail={thumbnail}
                  progress={lesson.progress}
                  onClick={() => handleActionClick("lesson", lesson)}
                />
              );
            })}
          </div>
        ) : null}

        {isAuthenticated && !loadingLessons && featuredLessons.length === 0 ? (
          <Card className="text-center">
            <h3 className="mb-2 text-xl font-semibold text-foreground">{copy.noLessonsTitle}</h3>
            <p className="text-muted-foreground">{copy.noLessonsDescription}</p>
          </Card>
        ) : null}
      </section>

      <section id="support-section" className="bg-muted/35 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-foreground">{copy.supportTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{copy.supportDescription}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {copy.features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} hover>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq-section" className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-foreground">{copy.faqTitle}</h2>
            <p className="text-muted-foreground">{copy.faqDescription}</p>
          </div>
          <div className="space-y-3">
            {copy.faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <Card key={item.question} padding="none">
                  <button
                    type="button"
                    className="interactive flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex((prev) => (prev === index ? null : index))}
                  >
                    <span className="font-medium text-foreground">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-border px-5 py-4 text-sm leading-6 text-muted-foreground">
                      {item.answer}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
