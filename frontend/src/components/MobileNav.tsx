import React, { useEffect } from "react";
import { BookOpen, GraduationCap, Home, Sparkles, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { cn } from "./ui/utils";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  open,
  setOpen,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();

  const copy = language === "ru"
    ? {
        home: "Главная",
        lessons: "Уроки",
        words: "Слова",
        studio: "Студия",
        profile: "Профиль",
        login: "Вход",
      }
    : {
        home: "Басты бет",
        lessons: "Сабақтар",
        words: "Сөздер",
        studio: "Студия",
        profile: "Профиль",
        login: "Кіру",
      };

  const navItems = [
    { icon: Home, label: copy.home, page: "home" },
    ...(isAuthenticated
      ? [
          { icon: BookOpen, label: copy.lessons, page: "catalog" },
          { icon: GraduationCap, label: copy.words, page: "vocabulary" },
          ...(user?.is_content_manager
            ? [{ icon: Sparkles, label: copy.studio, page: "studio" }]
            : [{ icon: User, label: copy.profile, page: "dashboard" }]),
        ]
      : [{ icon: User, label: copy.login, page: "login" }]),
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setOpen(false);
  };

  // Закрытие по Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  return (
    <>
      {/* Затемняющий оверлей */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Выдвижная панель */}
      <aside
        className={cn(
          "fixed top-14 right-0 z-50 h-[calc(100%-3.5rem)] w-72 bg-background border-l border-border/80 shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Мобильное меню"
      >
        <div className="flex flex-col gap-1 p-3 overflow-y-auto h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};