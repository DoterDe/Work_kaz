import React, { useEffect, useId, useState } from "react";
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

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { language } = useAppPreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const mobileMenuId = useId();

  const copy =
    language === "ru"
      ? {
          brandSubtitle: "Живые уроки и практический казахский",
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
          brandSubtitle: "Тірі сабақтар және практикалық қазақ тілі",
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
    <header className="sticky top-0 z-nav border-b border-border/70 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
      <nav
        aria-label={copy.navigation}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          className="interactive group rounded-xl px-1.5 py-1 text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => onNavigate("home")}
        >
          <span className="block text-base font-semibold tracking-normal text-foreground sm:text-lg">
            Qazaq Video Learn
          </span>
          <span className="block max-w-[15rem] truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground/75">
            {copy.brandSubtitle}
          </span>
        </button>

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
                  "interactive inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow]",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary/25 bg-primary/10 text-primary shadow-sm"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}

          <div className="ml-1 flex items-center gap-2 border-l border-border/80 pl-3">
            <AppControls />
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>
                  {copy.login}
                </Button>
                <Button size="sm" onClick={() => onNavigate("register")}>
                  {copy.register}
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="interactive inline-flex h-10 max-w-[11rem] items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => onNavigate("dashboard")}
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{user?.username || copy.account}</span>
                </button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {copy.logout}
                </Button>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="interactive inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          aria-label={mobileOpen ? copy.closeMenu : copy.menu}
          aria-controls={mobileMenuId}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            id={mobileMenuId}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="border-t border-border/80 bg-background/96 shadow-lg backdrop-blur-xl md:hidden"
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
                        "interactive inline-flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => closeAndNavigate(item.page)}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-2 border-t border-border/70 pt-3">
                {!isAuthenticated ? (
                  <>
                    <Button fullWidth variant="ghost" onClick={() => closeAndNavigate("login")}>
                      {copy.login}
                    </Button>
                    <Button fullWidth onClick={() => closeAndNavigate("register")}>
                      {copy.register}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button fullWidth variant="ghost" onClick={() => closeAndNavigate("dashboard")}>
                      {copy.dashboard}
                    </Button>
                    <Button fullWidth variant="outline" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      {copy.logout}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
