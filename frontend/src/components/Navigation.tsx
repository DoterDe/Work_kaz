import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { AppControls } from "./AppControls";
import { Button } from "./ui/Button";
import { cn } from "./ui/utils";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { language } = useAppPreferences();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const mobileMenuId = useId();
  const lastScrollY = useRef(0);

  const copy =
    language === "ru"
      ? {
          home: "Главная",
          catalog: "Каталог",
          vocabulary: "Словарь",
          dashboard: "Кабинет",
          studio: "Студия",
          login: "Войти",
          register: "Регистрация",
          account: "Профиль",
          logout: "Выйти",
          menu: "Открыть меню",
          closeMenu: "Закрыть меню",
          navigation: "Основная навигация",
        }
      : {
          home: "Басты бет",
          catalog: "Каталог",
          vocabulary: "Сөздік",
          dashboard: "Кабинет",
          studio: "Студия",
          login: "Кіру",
          register: "Тіркелу",
          account: "Профиль",
          logout: "Шығу",
          menu: "Мәзірді ашу",
          closeMenu: "Мәзірді жабу",
          navigation: "Негізгі навигация",
        };

  const items = [
    { label: copy.home, page: "home", icon: Home },

    ...(isAuthenticated
      ? [
          { label: copy.catalog, page: "catalog", icon: Library },
          { label: copy.vocabulary, page: "vocabulary", icon: BookOpenCheck },
          { label: copy.dashboard, page: "dashboard", icon: LayoutDashboard },

          ...(user?.is_content_manager
            ? [{ label: copy.studio, page: "studio", icon: Sparkles }]
            : []),
        ]
      : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 24);

      if (currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY.current - 6) {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const closeAndNavigate = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAndNavigate("home");
  };

  return (
    <motion.header
      initial={false}
      animate={{
        y: showNavbar ? 0 : -120,
        scale: scrolled ? 0.985 : 1,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        `
        fixed
        top-0
        left-0
        right-0
        z-[9999]
        transition-all
        duration-500
      `,
        scrolled
          ? `
            border-b
            border-white/10
            bg-background/55
            shadow-2xl
            backdrop-blur-3xl
            supports-[backdrop-filter]:bg-background/45
          `
          : `
            bg-transparent
          `
      )}
      style={{
        pointerEvents: "auto",
      }}
    >
      <nav
        aria-label={copy.navigation}
        className={cn(
          `
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-8
          transition-all
          duration-500
        `,
          scrolled ? "h-14" : "h-16"
        )}
      >
        {/* 3D LOGO */}
        <motion.button
          type="button"
          onClick={() => onNavigate("home")}
          whileHover={
            prefersReducedMotion
              ? {}
              : {
                  rotateX: 18,
                  rotateY: 180,
                  scale: 1.08,
                }
          }
          whileTap={{
            scale: 0.92,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          className="
            interactive
            relative
            flex
            h-12
            w-12
            items-center
            justify-center
            overflow-hidden
            rounded-[18px]
            border
            border-white/10
            bg-gradient-to-br
            from-primary/25
            via-primary/10
            to-cyan-400/10
            shadow-[0_10px_40px_rgba(59,130,246,0.25)]
            outline-none
            transition-all
            duration-500
            hover:shadow-[0_10px_55px_rgba(59,130,246,0.45)]
            focus-visible:ring-2
            focus-visible:ring-ring
            before:absolute
            before:inset-0
            before:rounded-[18px]
            before:bg-white/10
            before:opacity-0
            before:transition-opacity
            hover:before:opacity-100
          "
          style={{
            transformStyle: "preserve-3d",
            perspective: "1200px",
          }}
        >
          {/* GLOW */}
          <div
            className="
              absolute
              inset-[-40%]
              bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_60%)]
              opacity-60
              blur-2xl
            "
          />

          {/* 3D Q */}
          <motion.div
            animate={{
              rotateZ: [0, 3, -3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              relative
              z-10
              select-none
              text-[1.45rem]
              font-black
              tracking-tight
              text-white
            "
            style={{
              transform: "translateZ(25px)",
              textShadow:
                "0 4px 15px rgba(255,255,255,0.25), 0 0 30px rgba(59,130,246,0.35)",
            }}
          >
            Q
          </motion.div>
        </motion.button>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-2 md:flex">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.page;

            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  `
                  interactive
                  inline-flex
                  min-w-fit
                  whitespace-nowrap
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  duration-300
                  hover:bg-white/10
                  hover:backdrop-blur-xl
                  hover:scale-[1.03]
                  active:scale-[0.98]
                `,
                  `
                  focus-visible:ring-2
                  focus-visible:ring-ring
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-background
                `,
                  active
                    ? "border-primary/25 bg-primary/10 text-primary shadow-lg shadow-primary/10"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />

                <span className="whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="ml-2 flex items-center gap-2 border-l border-border/70 pl-4">
            <AppControls />

            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("login")}
                >
                  {copy.login}
                </Button>

                <Button
                  size="sm"
                  onClick={() => onNavigate("register")}
                >
                  {copy.register}
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="
                    interactive
                    inline-flex
                    h-10
                    max-w-[12rem]
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-transparent
                    px-3
                    text-sm
                    font-medium
                    text-muted-foreground
                    outline-none
                    transition-all
                    duration-300
                    hover:border-border
                    hover:bg-white/10
                    hover:text-foreground
                    hover:backdrop-blur-xl
                    focus-visible:ring-2
                    focus-visible:ring-ring
                  "
                  onClick={() => onNavigate("dashboard")}
                >
                  <User className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {user?.username || copy.account}
                  </span>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {copy.logout}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          className="
            interactive
            inline-flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-border/60
            bg-card/70
            text-foreground
            outline-none
            transition-all
            duration-300
            hover:bg-muted
            focus-visible:ring-2
            focus-visible:ring-ring
            md:hidden
          "
          aria-label={mobileOpen ? copy.closeMenu : copy.menu}
          aria-controls={mobileMenuId}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            id={mobileMenuId}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: -12 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -12 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.2,
            }}
            className="
              border-t
              border-border/70
              bg-background/95
              shadow-2xl
              backdrop-blur-2xl
              md:hidden
            "
          >
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
              <div className="flex justify-end">
                <AppControls />
              </div>

              <div className="grid gap-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.page;

                  return (
                    <button
                      key={item.page}
                      type="button"
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        `
                        interactive
                        inline-flex
                        w-full
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        px-4
                        py-3
                        text-left
                        text-sm
                        font-medium
                        outline-none
                        transition-all
                        duration-300
                      `,
                        active
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => closeAndNavigate(item.page)}
                    >
                      <Icon className="h-4 w-4 shrink-0" />

                      <span className="whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-2 border-t border-border/70 pt-3">
                {!isAuthenticated ? (
                  <>
                    <Button
                      fullWidth
                      variant="ghost"
                      onClick={() => closeAndNavigate("login")}
                    >
                      {copy.login}
                    </Button>

                    <Button
                      fullWidth
                      onClick={() => closeAndNavigate("register")}
                    >
                      {copy.register}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="ghost"
                      onClick={() => closeAndNavigate("dashboard")}
                    >
                      {copy.dashboard}
                    </Button>

                    <Button
                      fullWidth
                      variant="outline"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {copy.logout}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navigation;