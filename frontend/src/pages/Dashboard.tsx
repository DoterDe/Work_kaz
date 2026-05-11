import React, { useEffect, useState } from "react";
import { BookOpen, ChartBar, CheckCircle, Clock } from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LevelBadge } from "../components/ui/LevelBadge";
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
          catalogRating: "Средний рейтинг каталога",
          goCatalog: "К каталогу",
          studio: "Студия",
          logout: "Выйти",
          completed: "Завершено",
          inProgress: "В процессе",
          averageProgress: "Средний прогресс",
          publishedLessons: "Опубликованные уроки",
          recentLessons: "Недавно активные уроки",
          viewAll: "Смотреть всё",
          noActivity: "Активности по урокам пока нет. Начните с каталога.",
          browseLessons: "Открыть каталог",
        }
      : {
          loading: "Кабинет жүктеліп жатыр...",
          empty: "Кабинет уақытша қолжетімсіз",
          fetchError: "Кабинетті жүктеу мүмкін болмады. Қайта кіріп көріңіз.",
          welcome: "Қайта оралғаныңызға қуаныштымыз",
          catalogRating: "Каталогтың орташа рейтингі",
          goCatalog: "Каталогқа өту",
          studio: "Студия",
          logout: "Шығу",
          completed: "Аяқталды",
          inProgress: "Орындалуда",
          averageProgress: "Орташа прогресс",
          publishedLessons: "Жарияланған сабақтар",
          recentLessons: "Жақында белсенді болған сабақтар",
          viewAll: "Барлығын көру",
          noActivity: "Сабақ белсенділігі әлі жоқ. Каталогтан бастаңыз.",
          browseLessons: "Каталогты ашу",
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
    return <p className="py-20 text-center text-muted-foreground">{copy.loading}</p>;
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Card className="rounded-[24px] border-destructive/20 bg-destructive/10 text-destructive">
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
      color: "text-accent-foreground",
    },
    {
      icon: BookOpen,
      label: copy.publishedLessons,
      value: catalogMeta?.total_lessons ?? 0,
      color: "text-primary",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 rounded-[28px] border border-border bg-gradient-to-br from-card to-primary/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2">{copy.welcome}, {dashboard.username}</h1>
            <p className="text-muted-foreground">{dashboard.email}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.catalogRating}: {catalogMeta?.average_rating?.toFixed(1) ?? "0.0"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onNavigate("catalog")}>
              {copy.goCatalog}
            </Button>
            {dashboard.is_content_manager && (
              <Button variant="outline" onClick={() => onNavigate("studio")}>
                {copy.studio}
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              {copy.logout}
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-[24px] text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </Card>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2>{copy.recentLessons}</h2>
          <Button variant="ghost" onClick={() => onNavigate("catalog")}>
            {copy.viewAll}
          </Button>
        </div>

        {dashboard.recent_lessons.length === 0 ? (
          <Card className="rounded-[24px] py-10 text-center">
            <p className="mb-3 text-muted-foreground">{copy.noActivity}</p>
            <Button onClick={() => onNavigate("catalog")}>{copy.browseLessons}</Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.recent_lessons.map((lesson) => (
              <Card
                key={lesson.id}
                hover
                className="cursor-pointer rounded-[24px]"
                onClick={() => onNavigate("lesson", lesson)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3>{lesson.title}</h3>
                  <LevelBadge level={lesson.level} size="sm" />
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {formatMinutes(lesson.duration_minutes)}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
