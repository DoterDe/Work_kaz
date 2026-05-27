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
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);

  const lastScrollY = useRef(0);

  const prefersReducedMotion = useReducedMotion();
  const mobileMenuId = useId();

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

      setAtTop(currentScrollY <= 12);

      if (currentScrollY < lastScrollY.current - 5) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        setVisible(false);
      }

      if (currentScrollY <= 0) {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

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

    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <>
      {/* SPACER */}
      <div className="h-20" />

      <motion.header
        initial={false}
        animate={{
          y: visible ? 0 : -120,
          opacity: visible ? 1 : 0.98,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "fixed left-0 top-0 w-full transition-all duration-300",
          atTop
            ? "bg-transparent"
            : "border-b border-border/50 bg-background/70 backdrop-blur-3xl shadow-[0_12px_40px_rgba(0,0,0,0.16)]",
        )}
        style={{
          zIndex: 99990,
          pointerEvents: "auto",
        }}
      >
        <nav
          aria-label={copy.navigation}
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* LOGO */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="interactive group relative mr-3 flex items-center justify-center outline-none"
            style={{
              perspective: "1600px",
              zIndex: 999999,
            }}
          >
            <motion.div
              whileHover={{
                rotateY: 360,
                rotateX: 14,
                scale: 1.12,
              }}
              transition={{
                duration: 1.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex h-16 w-16 items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                zIndex: 999999,
              }}
            >
              {/* glow */}
              <div
                className="
                  absolute inset-0 rounded-[26px]
                  bg-primary/20 blur-2xl
                  opacity-80 transition-all duration-500
                  group-hover:scale-125
                  group-hover:opacity-100
                "
              />

              {/* transparent case */}
              <div
                className="
                  relative flex h-16 w-16 items-center justify-center
                  rounded-[26px]
                  border border-white/10
                  bg-transparent
                  shadow-[0_12px_50px_rgba(0,0,0,0.35)]
                  backdrop-blur-md
                  transition-all duration-500
                  group-hover:shadow-[0_20px_70px_rgba(59,130,246,0.35)]
                "
              >
                <img
                  src="/logo-q.png"
                  alt="Q"
                  draggable={false}
                  className="
                    h-14 w-14
                    object-contain
                    select-none
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                  style={{
                    pointerEvents: "none",
                  }}
                />
              </div>
            </motion.div>
          </button>

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
                    "interactive inline-flex min-w-fit items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-medium outline-none transition-all duration-300",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active
                      ? "border-primary/30 bg-primary/10 text-primary shadow-lg"
                      : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}

            <div className="ml-2 flex items-center gap-2 border-l border-border/70 pl-3">
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
                    className="interactive inline-flex h-10 max-w-[12rem] items-center gap-2 rounded-2xl border border-transparent px-3 text-sm font-medium text-muted-foreground outline-none transition-all duration-300 hover:border-border/60 hover:bg-muted/70 hover:text-foreground"
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
            className="interactive inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-foreground backdrop-blur-xl transition-all duration-300 hover:bg-muted/70 md:hidden"
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
              initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
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
                duration: prefersReducedMotion ? 0 : 0.22,
              }}
              className="border-t border-border/60 bg-background/92 backdrop-blur-3xl md:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
                <div className="mb-2 flex justify-end">
                  <AppControls />
                </div>

                {items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.page;

                  return (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => closeAndNavigate(item.page)}
                      className={cn(
                        "interactive inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}

                <div className="mt-3 grid gap-2 border-t border-border/60 pt-3">
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
    </>
  );
};

export default Navigation;