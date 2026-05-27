import React from "react";
import { BookOpen, GraduationCap, Home, Sparkles, User } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { cn } from "./ui/utils";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isBurgerOpen?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  isBurgerOpen = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();

  const [hidden, setHidden] = React.useState(false);
  const lastScrollY = React.useRef(0);

  const copy =
    language === "ru"
      ? {
          home: "Главная",
          lessons: "Уроки",
          words: "Слова",
          studio: "Студия",
          profile: "Профиль",
          login: "Вход",
          navigation: "Мобильная навигация",
        }
      : {
          home: "Басты бет",
          lessons: "Сабақтар",
          words: "Сөздер",
          studio: "Студия",
          profile: "Профиль",
          login: "Кіру",
          navigation: "Мобильді навигация",
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

  // 📌 scroll logic (disabled when burger open)
  React.useEffect(() => {
    if (isBurgerOpen) return;

    let ticking = false;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY > lastScrollY.current && currentY > 80) {
            setHidden(true);
          } else {
            setHidden(false);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBurgerOpen]);

  const isHidden = hidden || isBurgerOpen;

  return (
    <nav
      aria-label={copy.navigation}
      style={{
        zIndex: 2147483647,
      }}
      className="safe-area-inset-bottom fixed inset-x-0 bottom-0 border-t border-border/80 bg-background/92 px-2 pb-2 pt-2 shadow-lg backdrop-blur-xl md:hidden"
    >
      {/* INNER WRAPPER controls animation WITHOUT affecting layout */}
      <div
        className="mx-auto grid max-w-md grid-cols-4 gap-1"
        style={{
          transform: isHidden ? "translateY(120%)" : "translateY(0)",
          opacity: isHidden ? 0 : 1,
          pointerEvents: isHidden ? "none" : "auto",
          transition: "transform 0.25s ease, opacity 0.2s ease",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "interactive flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium outline-none transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};