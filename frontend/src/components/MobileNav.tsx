import React from "react";
import {
  Menu,
  X,
  Home,
  BookOpen,
  GraduationCap,
  Sparkles,
  User,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";

/* =========================
   TOP BAR (APPLE STYLE)
========================= */

export function TopNavbar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const [hidden, setHidden] = React.useState(false);

  const lastY = React.useRef(0);
  const ticking = React.useRef(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      if (!ticking.current) {
        requestAnimationFrame(() => {
          const diff = y - lastY.current;

          // ignore micro scroll noise
          if (Math.abs(diff) > 10) {
            if (diff > 0 && y > 80 && !isOpen) {
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
  }, [isOpen]);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <header
      style={{ zIndex: 2147483647 }}
      className="fixed top-0 inset-x-0 h-14 md:h-16"
    >
      {/* glass background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl border-b border-white/10" />

      {/* content */}
      <div
        className="relative h-full flex items-center justify-between px-4 max-w-6xl mx-auto transition-all duration-300"
        style={{
          transform:
            hidden && !isOpen ? "translateY(-110%)" : "translateY(0)",
          opacity: hidden && !isOpen ? 0 : 1,
        }}
      >
        <div className="font-semibold text-lg tracking-tight text-white">
          AppName
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-white/10 transition"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

/* =========================
   BURGER MENU (FULL NAV INSIDE)
========================= */

export function BurgerMenu({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();

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

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <div
      style={{ zIndex: 2147483646 }}
      className="fixed inset-0"
    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-xl transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* PANEL */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white/10 backdrop-blur-3xl border-l border-white/10 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* NAV INSIDE */}
        <div className="pt-20 px-6 flex flex-col gap-3 text-white">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className="flex items-center gap-3 text-lg py-3 px-4 rounded-xl hover:bg-white/10 transition"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================
   APP LAYOUT (FINAL)
========================= */

export default function AppNavigationSystem({
  children,
  navigate,
}: {
  children: React.ReactNode;
  navigate: (page: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavbar isOpen={isOpen} setIsOpen={setIsOpen} />

      <BurgerMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={(page) => {
          navigate(page);
          setIsOpen(false);
        }}
      />

      {/* PAGE */}
      <main className="pt-16">{children}</main>
    </div>
  );
}