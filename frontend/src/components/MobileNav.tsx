import React, { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Home,
  Sparkles,
  User,
} from "lucide-react";
import { createPortal } from "react-dom";

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

  // ESC close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // 🔥 PORTAL RENDER (SUPERPOSITION LAYER)
  return (
    <>
      {/* BURGER BUTTON (если у тебя он отдельно — оставь свой) */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-foreground"
      >
        <User className="w-6 h-6" />
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <>
            {/* OVERLAY */}
            {open && (
              <div
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
              />
            )}

            {/* DRAWER */}
            <aside
              className={cn(
                "fixed right-0 top-0 z-[1000] h-screen w-72 bg-background border-l border-border/80 shadow-2xl transition-transform duration-300 will-change-transform",
                open ? "translate-x-0" : "translate-x-full"
              )}
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
          </>,
          document.body
        )}
    </>
  );
};