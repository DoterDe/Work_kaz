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

  const [visible, setVisible] = React.useState(true);

  const lastY = React.useRef(0);
  const velocity = React.useRef(0);
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

  // 🚫 lock when burger open
  React.useEffect(() => {
    if (isBurgerOpen) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [isBurgerOpen]);

  // 🧠 iOS-style scroll intelligence
  React.useEffect(() => {
    if (isBurgerOpen) return;

    const onScroll = () => {
      const y = window.scrollY;

      const diff = y - lastY.current;
      velocity.current = diff;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const absVelocity = Math.abs(velocity.current);

          // 🔥 ignore micro scroll (prevents jitter)
          if (absVelocity < 4) {
            ticking.current = false;
            return;
          }

          // 📉 scrolling down fast → hide
          if (velocity.current > 2 && y > 120) {
            setVisible(false);
          }

          // 📈 scrolling up → show
          if (velocity.current < -2) {
            setVisible(true);
          }

          lastY.current = y;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isBurgerOpen]);

  const isHidden = !visible || isBurgerOpen;

  return (
    <nav
      style={{
        zIndex: 2147483647,
      }}
      className="fixed inset-x-0 bottom-0 md:hidden pointer-events-none"
    >
      {/* container NEVER affects layout */}
      <div
        className="mx-auto max-w-md px-2 pb-2"
        style={{
          opacity: isHidden ? 0 : 1,
          transform: isHidden ? "translateY(120%)" : "translateY(0)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          pointerEvents: isHidden ? "none" : "auto",
        }}
      >
        {/* visual nav only */}
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-2 py-2 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={cn(
                  "interactive flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
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
    </nav>
  );
};