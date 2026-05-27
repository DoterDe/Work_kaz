import React from "react";
import { BookOpen, GraduationCap, Home, Sparkles, User } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { cn } from "./ui/utils";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;

  // NEW: burger control (optional but recommended)
  isMenuOpen?: boolean;
  setIsMenuOpen?: (v: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  isMenuOpen = false,
  setIsMenuOpen,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();

  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);
  const ticking = React.useRef(false);

  const copy =
    language === "ru"
      ? {
          home: "Главная",
          lessons: "Уроки",
          words: "Слова",
          studio: "Студия",
          profile: "Профиль",
          login: "Вход",
          navigation: "Навигация",
        }
      : {
          home: "Басты бет",
          lessons: "Сабақтар",
          words: "Сөздер",
          studio: "Студия",
          profile: "Профиль",
          login: "Кіру",
          navigation: "Navigation",
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

  /* =========================
     APPLE SCROLL BEHAVIOR
  ========================= */

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      if (!ticking.current) {
        requestAnimationFrame(() => {
          const diff = y - lastY.current;

          if (Math.abs(diff) > 10 && !isMenuOpen) {
            if (diff > 0 && y > 80) {
              setHidden(true);
            } else {
              setHidden(false);
            }
          }

          lastY.current = y;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isMenuOpen]);

  /* =========================
     LOCK SCROLL WHEN MENU OPEN
  ========================= */

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  /* =========================
     HIDDEN STATE
  ========================= */

  const isHidden = hidden || isMenuOpen;

  return (
    <div
      style={{
        zIndex: 2147483647,
      }}
      className="fixed top-0 inset-x-0 md:hidden"
    >
      {/* NAV CONTAINER (NO LAYOUT SHIFT) */}
      <div
        className="mx-auto max-w-md px-3 pt-3 transition-all duration-300"
        style={{
          opacity: isHidden ? 0 : 1,
          transform: isHidden ? "translateY(-20px)" : "translateY(0)",
          pointerEvents: isHidden ? "none" : "auto",
        }}
      >
        {/* GLASS NAV BAR */}
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-2xl px-2 py-2 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={cn(
                  "interactive flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};