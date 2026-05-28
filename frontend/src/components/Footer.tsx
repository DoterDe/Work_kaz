import React, { useEffect, useRef } from "react";
import { Facebook, Instagram, Mail, Youtube } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { cn } from "./ui/utils";

interface FooterProps {
  onNavigate: (page: string) => void;
}

const supportEmail = "support@qazaqvideolearn.com";

export function Footer({ onNavigate }: FooterProps) {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();
  const prefersReducedMotion = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);

  // Жидкий градиент внутри футера (локальный эффект)
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || prefersReducedMotion) return;

    // Отключаем на устройствах без точного указателя
    if (window.matchMedia("(hover: none)").matches) return;

    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = footer.getBoundingClientRect();
      // Нормализованные координаты внутри футера (0..1)
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
    };

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const update = () => {
      currentX = lerp(currentX, targetX, 0.07);
      currentY = lerp(currentY, targetY, 0.07);
      footer.style.setProperty("--footer-mouse-x", String(currentX));
      footer.style.setProperty("--footer-mouse-y", String(currentY));
      rafId = requestAnimationFrame(update);
    };

    footer.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(update);

    return () => {
      footer.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const copy =
    language === "ru"
      ? {
          description:
            "Платформа для изучения казахского языка через видеоуроки, словарь и понятный трекер прогресса.",
          learn: "Обучение",
          beginner: "Начальный путь A1-A2",
          intermediate: "Средний путь B1-B2",
          lessons: "Видеоуроки",
          vocabulary: "Словарь",
          dashboard: "Кабинет",
          studio: "Контент-студия",
          support: "Поддержка",
          faq: "Частые вопросы",
          help: "Центр помощи",
          contact: "Связаться",
          privacy: "Политика конфиденциальности",
          connect: "Контакты",
          rights: "Все права защищены.",
          supportSubject: "Поддержка Qazaq Video Learn",
          feedbackSubject: "Отзыв о Qazaq Video Learn",
          social: "Социальные сети",
        }
      : {
          description:
            "Қазақ тілін бейнесабақтар, сөздік және түсінікті прогресс трекері арқылы үйренуге арналған платформа.",
          learn: "Оқу",
          beginner: "Бастапқы жол A1-A2",
          intermediate: "Орта жол B1-B2",
          lessons: "Бейнесабақтар",
          vocabulary: "Сөздік",
          dashboard: "Кабинет",
          studio: "Контент студиясы",
          support: "Қолдау",
          faq: "Жиі сұрақтар",
          help: "Көмек орталығы",
          contact: "Байланыс",
          privacy: "Құпиялылық саясаты",
          connect: "Байланыс арналары",
          rights: "Барлық құқықтар қорғалған.",
          supportSubject: "Qazaq Video Learn қолдауы",
          feedbackSubject: "Qazaq Video Learn туралы пікір",
          social: "Әлеуметтік желілер",
        };

  const linkClass =
    "interactive rounded-md text-left text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const scrollToSection = (sectionId: string) => {
    onNavigate("home");
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    }, 90);
  };

  const openSupportEmail = (subject: string) => {
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <footer
      ref={footerRef}
      className={cn(
        "relative z-content mt-20 border-t border-white/5",
        // Стеклянный фон + скругление сверху
        "glass rounded-t-3xl",
        // Внутренний анимированный градиент (реагирует на мышь)
        "before:pointer-events-none before:absolute before:inset-0 before:z-[-1] before:rounded-t-3xl",
        "before:opacity-40",
        prefersReducedMotion ? "before:hidden" : "",
        "dark:before:bg-[radial-gradient(circle_at_calc(var(--footer-mouse-x,0.5)*100%)_calc(var(--footer-mouse-y,0.5)*100%),rgba(59,130,246,0.25)_0%,transparent_65%)]",
        "before:bg-[radial-gradient(circle_at_calc(var(--footer-mouse-x,0.5)*100%)_calc(var(--footer-mouse-y,0.5)*100%),rgba(28,110,250,0.18)_0%,transparent_65%)]"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Бренд */}
          <div>
            <button
              type="button"
              className="interactive mb-4 flex items-center gap-3 rounded-2xl pr-3 text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => onNavigate("home")}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-semibold text-primary shadow-glow">
                Q
              </span>
              <span>
                <span className="block text-lg font-semibold text-foreground">
                  Qazaq Video Learn
                </span>
                <span className="block text-xs text-muted-foreground">A1-B2</span>
              </span>
            </button>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              {copy.description}
            </p>
          </div>

          {/* Обучение */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{copy.learn}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" className={linkClass} onClick={() => onNavigate("catalog")}>
                  {copy.beginner}
                </button>
              </li>
              <li>
                <button type="button" className={linkClass} onClick={() => onNavigate("catalog")}>
                  {copy.intermediate}
                </button>
              </li>
              <li>
                <button type="button" className={linkClass} onClick={() => onNavigate("catalog")}>
                  {copy.lessons}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={linkClass}
                  onClick={() => onNavigate(isAuthenticated ? "vocabulary" : "login")}
                >
                  {copy.vocabulary}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={linkClass}
                  onClick={() =>
                    onNavigate(
                      isAuthenticated
                        ? user?.is_content_manager
                          ? "studio"
                          : "dashboard"
                        : "login",
                    )
                  }
                >
                  {user?.is_content_manager ? copy.studio : copy.dashboard}
                </button>
              </li>
            </ul>
          </div>

          {/* Поддержка */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{copy.support}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" className={linkClass} onClick={() => scrollToSection("faq-section")}>
                  {copy.faq}
                </button>
              </li>
              <li>
                <button type="button" className={linkClass} onClick={() => scrollToSection("support-section")}>
                  {copy.help}
                </button>
              </li>
              <li>
                <button type="button" className={linkClass} onClick={() => openSupportEmail(copy.supportSubject)}>
                  {copy.contact}
                </button>
              </li>
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(linkClass, "inline-block")}
                >
                  {copy.privacy}
                </a>
              </li>
            </ul>
          </div>

          {/* Социальные сети */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{copy.connect}</h2>
            <div className="flex gap-3" aria-label={copy.social}>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="interactive flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="interactive flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="interactive flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Youtube className="h-5 w-5" aria-hidden="true" />
              </a>
              <button
                type="button"
                aria-label={copy.contact}
                className="interactive flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => openSupportEmail(copy.feedbackSubject)}
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-8 border-t border-border/70 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Qazaq Video Learn. {copy.rights}</p>
        </div>
      </div>
    </footer>
  );
}