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
import { useAppPreferences } from "../context/AppPreferencesContext";
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
  const { language, translateCategory } = useAppPreferences();
  const [featuredLessons, setFeaturedLessons] = useState<Lesson[]>([]);
  const [meta, setMeta] = useState<LessonsMeta | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroRef = useRef<HTMLElement | null>(null);
  const galleryRef = useRef<HTMLElement | null>(null);

  const copy =
    language === "ru"
      ? {
          statsError: "Не удалось загрузить статистику главной страницы.",
          featuredError: "Не удалось загрузить рекомендуемые уроки.",
          heroBadge: "Короткие живые уроки для уверенного старта",
          heroTitle: "Изучайте казахский через настоящие видеосюжеты",
          heroDescription:
            "Соберите устойчивую языковую практику: смотрите, разбирайте слова, проходите мини-тесты и фиксируйте прогресс без перегруза.",
          startLearning: "Начать обучение",
          practiceVocabulary: "Тренировать словарь",
          publishedLessons: "Опубликованные уроки",
          averageRating: "Средний рейтинг",
          topCategory: "Главная категория",
          fallbackCategory: "Путешествия",
          cinematicTitle: "Визуально насыщенный формат обучения",
          cinematicDescription:
            "Страница двигается мягко и создаёт ощущение глубины, чтобы обучение выглядело современно и живо.",
          flowTitle: "Как устроен учебный цикл",
          flowDescription:
            "Понятная последовательность, которая переводит ученика от просмотра к активной речи и закреплению.",
          levelsTitle: "Выберите свой уровень",
          levelsDescription:
            "Двигайтесь по понятной траектории от первых фраз до уверенного общения.",
          topLessonsTitle: "Лучшие уроки для старта",
          topLessonsDescription:
            "Подборка уроков с высоким рейтингом, чтобы вы быстрее вошли в ритм.",
          openCatalog: "Открыть каталог",
          signInTitle: "Войдите, чтобы открыть уроки",
          signInDescription:
            "Каталог, словарь и личный кабинет становятся доступны после авторизации.",
          loginToContinue: "Войти и продолжить",
          noLessonsTitle: "Рекомендуемые уроки пока не появились",
          noLessonsDescription:
            "Добавьте опубликованные уроки через Django Admin или Content Studio, и они появятся здесь.",
          supportTitle: "Всё, что нужно для устойчивой практики",
          supportDescription:
            "Короткий, но сильный набор инструментов для просмотра, запоминания и самопроверки.",
          faqTitle: "Частые вопросы",
          faqDescription:
            "Короткие ответы про уроки, прогресс и публикацию контента.",
          lessonsSuffix: "уроков",
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
              description: "Используйте более сложные структуры и звучите естественно.",
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
              title: "Гибкие субтитры",
              description: "Переключайтесь между казахским, русским и смешанным режимом.",
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
          parallaxPhotos: [
            {
              title: "Погружение в звучание",
              subtitle: "Живая речь с контекстными субтитрами",
              image:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
              depth: "-0.45",
            },
            {
              title: "Практика без формальности",
              subtitle: "Слова и тесты, связанные с каждым уроком",
              image:
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
              depth: "0.2",
            },
            {
              title: "Прогресс на виду",
              subtitle: "Понятная траектория роста в одном кабинете",
              image:
                "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80",
              depth: "0.7",
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
                "Посмотрите видео, разберите словарь урока и отправьте финальный тест. Успешная сдача отмечает урок как завершённый.",
            },
            {
              question: "Кто может добавлять уроки и тесты?",
              answer:
                "Публикацией и редактированием контента занимается только аккаунт контент-менеджера через Content Studio.",
            },
          ],
        }
      : {
          statsError: "Басты бет статистикасын жүктеу мүмкін болмады.",
          featuredError: "Ұсынылған сабақтарды жүктеу мүмкін болмады.",
          heroBadge: "Сенімді бастауға арналған қысқа әрі тірі сабақтар",
          heroTitle: "Қазақ тілін шынайы бейнесюжеттер арқылы үйреніңіз",
          heroDescription:
            "Тұрақты тілдік әдет қалыптастырыңыз: көріңіз, сөздерді талдаңыз, қысқа тесттен өтіңіз және прогресті артық жүктемесіз бақылаңыз.",
          startLearning: "Оқуды бастау",
          practiceVocabulary: "Сөздікті жаттықтыру",
          publishedLessons: "Жарияланған сабақтар",
          averageRating: "Орташа рейтинг",
          topCategory: "Негізгі санат",
          fallbackCategory: "Саяхат",
          cinematicTitle: "Көрнекі әрі әсерлі оқу форматы",
          cinematicDescription:
            "Парақ жұмсақ қозғалып, тереңдік әсерін береді, сондықтан оқу заманауи әрі тірі сезіледі.",
          flowTitle: "Оқу циклі қалай жұмыс істейді",
          flowDescription:
            "Оқушыны қараудан белсенді сөйлеуге және бекітуге апаратын түсінікті реттік жүйе.",
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
          loginToContinue: "Кіріп, жалғастыру",
          noLessonsTitle: "Ұсынылған сабақтар әзірге жоқ",
          noLessonsDescription:
            "Жарияланған сабақтарды Django Admin немесе Content Studio арқылы қоссаңыз, олар осы жерде көрінеді.",
          supportTitle: "Тұрақты тәжірибеге керектің бәрі",
          supportDescription:
            "Көру, есте сақтау және өзін-өзі тексеру үшін қысқа, бірақ қуатты құралдар жинағы.",
          faqTitle: "Жиі қойылатын сұрақтар",
          faqDescription:
            "Сабақтар, прогресс және контент жариялау туралы қысқа жауаптар.",
          lessonsSuffix: "сабақ",
          levelCards: [
            {
              level: "A1",
              title: "Бастау",
              description: "Негізгі сөздер, амандасу және күнделікті тіркестерді меңгеріңіз.",
              icon: BookOpen,
            },
            {
              level: "A2",
              title: "Сөйлеу негізі",
              description: "Күнделікті тақырыптарда сенімдірек сөйлеп, сөйлем құрастырыңыз.",
              icon: Target,
            },
            {
              level: "B1",
              title: "Сенімді қарым-қатынас",
              description: "Ұзақ диалогтар мен мәдени контексті жақсырақ түсініңіз.",
              icon: TrendingUp,
            },
            {
              level: "B2",
              title: "Еркін тәжірибе",
              description: "Күрделі құрылымдарды қолданып, табиғи сөйлеңіз.",
              icon: Award,
            },
          ],
          features: [
            {
              icon: Play,
              title: "Тірі бейнесабақтар",
              description: "Шынайы сөйлеу, жағдаяттар және бірден қолданылатын сөздік.",
            },
            {
              icon: Headphones,
              title: "Икемді субтитрлер",
              description: "Қазақша, орысша және аралас режим арасында ауысыңыз.",
            },
            {
              icon: FileText,
              title: "Ақылды сөз карталары",
              description: "Сөздерді мысалмен, айтылыммен және контекстпен қайталаңыз.",
            },
            {
              icon: BarChart3,
              title: "Тәртіпті прогресс",
              description: "Сабақтар, тесттер және оқу қарқынын бір жерден қадағалаңыз.",
            },
          ],
          learnSteps: [
            {
              index: "01",
              title: "Көріңіз",
              description: "Қысқа видео көріп, тірі контексті ұстап алыңыз.",
            },
            {
              index: "02",
              title: "Сөз жинаңыз",
              description: "Сабақтың негізгі сөздерін жеке тілдік базаңызға қосыңыз.",
            },
            {
              index: "03",
              title: "Тестпен бекітіңіз",
              description: "Түсінгеніңізді тексеріп, нәтижені бірден көріңіз.",
            },
            {
              index: "04",
              title: "Ырғақты сақтаңыз",
              description: "Тоқтаған жеріңізден жалғастырып, ілгері жүріңіз.",
            },
          ],
          parallaxPhotos: [
            {
              title: "Дыбысқа ену",
              subtitle: "Контекстік субтитрлері бар тірі сөйлеу",
              image:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
              depth: "-0.45",
            },
            {
              title: "Ресми емес практика",
              subtitle: "Әр сабаққа байланысқан сөздер мен тесттер",
              image:
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
              depth: "0.2",
            },
            {
              title: "Көрінетін прогресс",
              subtitle: "Бір кабинеттегі анық өсу траекториясы",
              image:
                "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80",
              depth: "0.7",
            },
          ],
          faqItems: [
            {
              question: "Тоқтаған жерімнен жалғастыра аламын ба?",
              answer:
                "Иә. Сабақ прогресі мен тест нәтижелері аккаунтқа байланады және беттер арасында сақталады.",
            },
            {
              question: "Сабақ толық өту үшін не істеу керек?",
              answer:
                "Видеоны көріңіз, сабақ сөздігін қайталаңыз және қорытынды тест тапсырыңыз. Сәтті нәтиже сабақтың аяқталғанын белгілейді.",
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
        setRequestError((prev) =>
          prev || extractApiErrorMessage(error, copy.statsError)
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
          prev || extractApiErrorMessage(error, copy.featuredError)
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

  const levelCards = useMemo(() => copy.levelCards, [copy.levelCards]);
  const features = copy.features;
  const learnSteps = copy.learnSteps;

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

  const parallaxPhotos = copy.parallaxPhotos;
  const faqItems = copy.faqItems;

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
              {copy.heroBadge}
            </div>
            <h1 className="mb-5 text-4xl leading-tight lg:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {copy.heroDescription}
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => handleActionClick("catalog")}>
                {copy.startLearning}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleActionClick("vocabulary")}
              >
                {copy.practiceVocabulary}
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
            <h2 className="mb-3">{copy.cinematicTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {copy.cinematicDescription}
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
            <h2 className="mb-3">{copy.flowTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {copy.flowDescription}
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
            <h2 className="mb-3">{copy.levelsTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {copy.levelsDescription}
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
                  <p className="text-sm text-primary">
                    {count} {copy.lessonsSuffix}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="mb-2">{copy.topLessonsTitle}</h2>
            <p className="text-muted-foreground">
              {copy.topLessonsDescription}
            </p>
          </div>
          <Button variant="outline" onClick={() => handleActionClick("catalog")}>
            {copy.openCatalog}
          </Button>
        </div>

        {!isAuthenticated && (
          <Card className="rounded-[24px] border-dashed text-center">
            <h3 className="mb-2">{copy.signInTitle}</h3>
            <p className="mb-5 text-muted-foreground">
              {copy.signInDescription}
            </p>
            <Button onClick={() => onNavigate("login")}>{copy.loginToContinue}</Button>
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
            <h3 className="mb-2">{copy.noLessonsTitle}</h3>
            <p className="text-muted-foreground">
              {copy.noLessonsDescription}
            </p>
          </Card>
        )}
      </section>

      <section id="support-section" className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3">{copy.supportTitle}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {copy.supportDescription}
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
            <h2 className="mb-3">{copy.faqTitle}</h2>
            <p className="text-muted-foreground">
              {copy.faqDescription}
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
