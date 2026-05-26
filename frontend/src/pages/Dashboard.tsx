import React, { useEffect, useState } from "react";
import { BookOpen, ChartBar, CheckCircle, Clock, LogOut, Sparkles, Star } from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CardGlow } from "../components/ui/CardGlow";
import { LevelBadge } from "../components/ui/LevelBadge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { extractApiErrorMessage } from "../utils/apiError";

interface DashboardProps {
  onNavigate: (page: string, lesson?: any) => void;
}

interface LessonPreview {
  id: number;
  title: string;
  level: "A1" | "A2" | "B1" | "B2";
  duration_minutes: number;
  progress: number;
}

interface DashboardResponse {
  username: string;
  email: string;
  is_content_manager?: boolean;
  stats: {
    completed_lessons: number;
    in_progress_lessons: number;
    average_progress: number;
  };
  recent_lessons: LessonPreview[];
}

interface LessonsMetaResponse {
  total_lessons: number;
  average_rating: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { logout } = useAuth();
  const { language, formatMinutes } = useAppPreferences();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [catalogMeta, setCatalogMeta] = useState<LessonsMetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const copy =
    language === "ru"
      ? {
          loading: "Загружаем кабинет...",
          empty: "Кабинет временно недоступен",
          fetchError: "Не удалось загрузить кабинет. Попробуйте войти снова.",
          welcome: "С возвращением",
          subtitle: "Ваш прогресс, недавние уроки и быстрые действия собраны в одном месте.",
          catalogRating: "Средний рейтинг каталога",
          goCatalog: "К каталогу",
          studio: "Студия",
          logout: "Выйти",
          completed: "Завершено",
          inProgress: "В процессе",
          averageProgress: "Средний прогресс",
          publishedLessons: "Уроки в каталоге",
          recentLessons: "Недавно активные уроки",
          viewAll: "Смотреть все",
          noActivity: "Активности по урокам пока нет. Начните с каталога.",
          browseLessons: "Открыть каталог",
          minutes: "Длительность",
        }
      : {
          loading: "Кабинет жүктеліп жатыр...",
          empty: "Кабинет уақытша қолжетімсіз",
          fetchError: "Кабинетті жүктеу мүмкін болмады. Қайта кіріп көріңіз.",
          welcome: "Қайта оралғаныңызға қуаныштымыз",
          subtitle: "Прогресс, соңғы сабақтар және жылдам әрекеттер бір жерде.",
          catalogRating: "Каталогтың орташа рейтингі",
          goCatalog: "Каталогқа өту",
          studio: "Студия",
          logout: "Шығу",
          completed: "Аяқталды",
          inProgress: "Орындалуда",
          averageProgress: "Орташа прогресс",
          publishedLessons: "Каталогтағы сабақтар",
          recentLessons: "Жақында белсенді болған сабақтар",
          viewAll: "Барлығын көру",
          noActivity: "Сабақ белсенділігі әлі жоқ. Каталогтан бастаңыз.",
          browseLessons: "Каталогты ашу",
          minutes: "Ұзақтығы",
        };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardResponse, metaResponse] = await Promise.all([
          api.get<DashboardResponse>("dashboard/"),
          api.get<LessonsMetaResponse>("lessons/meta/"),
        ]);
        setDashboard(dashboardResponse.data);
        setCatalogMeta(metaResponse.data);
      } catch (error) {
        setError(extractApiErrorMessage(error, copy.fetchError));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    onNavigate("login");
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4 py-20">
        <Card className="w-full text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none" />
          <p className="text-muted-foreground">{copy.loading}</p>
        </Card>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Card className="border-destructive/20 bg-destructive/10 text-destructive">
          {error || copy.empty}
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      icon: CheckCircle,
      label: copy.completed,
      value: dashboard.stats.completed_lessons,
      color: "text-secondary",
    },
    {
      icon: Clock,
      label: copy.inProgress,
      value: dashboard.stats.in_progress_lessons,
      color: "text-primary",
    },
    {
      icon: ChartBar,
      label: copy.averageProgress,
      value: `${dashboard.stats.average_progress}%`,
      color: "text-accent",
    },
    {
      icon: BookOpen,
      label: copy.publishedLessons,
      value: catalogMeta?.total_lessons ?? 0,
      color: "text-warning",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <CardGlow className="overflow-hidden p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {copy.catalogRating}: {catalogMeta?.average_rating?.toFixed(1) ?? "0.0"}
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {copy.welcome}, {dashboard.username}
              </h1>
              <p className="mt-3 text-base text-muted-foreground">{copy.subtitle}</p>
              <p className="mt-2 text-sm text-muted-foreground">{dashboard.email}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onNavigate("catalog")}>
                {copy.goCatalog}
              </Button>
              {dashboard.is_content_manager ? (
                <Button variant="outline" onClick={() => onNavigate("studio")}>
                  {copy.studio}
                </Button>
              ) : null}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {copy.logout}
              </Button>
            </div>
          </div>
        </CardGlow>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="text-center" hover>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </Card>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground">{copy.recentLessons}</h2>
          <Button variant="ghost" onClick={() => onNavigate("catalog")}>
            {copy.viewAll}
          </Button>
        </div>

        {dashboard.recent_lessons.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="mb-4 text-muted-foreground">{copy.noActivity}</p>
            <Button onClick={() => onNavigate("catalog")}>{copy.browseLessons}</Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.recent_lessons.map((lesson) => (
              <Card
                key={lesson.id}
                hover
                onClick={() => onNavigate("lesson", lesson)}
                aria-label={lesson.title}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                    {lesson.title}
                  </h3>
                  <LevelBadge level={lesson.level} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {copy.minutes}: {formatMinutes(lesson.duration_minutes)}
                </p>
                <ProgressBar progress={lesson.progress} />
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
