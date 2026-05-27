import React, { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Home,
  Sparkles,
  User,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { cn } from "./ui/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  page: string;
}

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();

  const [open, setOpen] = useState(false);

  const copy =
    language === "ru"
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

  const navItems: NavItem[] = [
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

  // Блокировка скролла body при открытом меню
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // Компенсация ширины скроллбара, чтобы страница не дёргалась
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = "";
      };
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* Верхняя панель: при открытом меню фиксируется, чтобы не уезжала при скролле (который заблокирован) */}
      <div
        className={cn(
          "w-full transition-all duration-200 z-50",
          open && "fixed top-0 left-0 right-0"
        )}
      >
        <header className="w-full bg-background border-b border-border/80">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
            >
              {open ? "✕" : "☰"}
            </button>
            <div className="font-semibold">Logo</div>
          </div>
        </header>
      </div>

      {/* Компенсация высоты для фиксированной панели */}
      {open && <div className="h-14" />}

      {/* Затемняющий оверлей */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Боковая шторка (drawer) */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-screen w-72 bg-background border-l border-border/80 shadow-2xl transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Мобильное меню"
      >
        <div className="flex flex-col gap-1 p-3 pt-20 overflow-y-auto h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
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