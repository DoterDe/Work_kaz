import React from "react";
import { Facebook, Instagram, Mail, Youtube } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";

interface FooterProps {
  onNavigate: (page: string) => void;
}

const supportEmail = "support@qazaqvideolearn.com";

export function Footer({ onNavigate }: FooterProps) {
  const { isAuthenticated, user } = useAuth();
  const { language } = useAppPreferences();

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
        };

  const scrollToSection = (sectionId: string) => {
    onNavigate("home");
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 90);
  };

  const openSupportEmail = (subject: string) => {
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1">
            <button
              className="mb-4 flex items-center gap-3 rounded-2xl pr-3 text-left transition-colors hover:text-primary"
              onClick={() => onNavigate("home")}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                <span className="text-xl text-white">Q</span>
              </div>
              <div className="text-lg font-semibold">Qazaq Video Learn</div>
            </button>
            <p className="text-sm text-muted-foreground">
              {copy.description}
            </p>
          </div>

          <div>
            <h4 className="mb-4">{copy.learn}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate("catalog")}
                >
                  {copy.beginner}
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate("catalog")}
                >
                  {copy.intermediate}
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate("catalog")}
                >
                  {copy.lessons}
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate(isAuthenticated ? "vocabulary" : "login")}
                >
                  {copy.vocabulary}
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() =>
                    onNavigate(
                      isAuthenticated
                        ? user?.is_content_manager
                          ? "studio"
                          : "dashboard"
                        : "login"
                    )
                  }
                >
                  {user?.is_content_manager ? copy.studio : copy.dashboard}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">{copy.support}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => scrollToSection("faq-section")}
                >
                  {copy.faq}
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => scrollToSection("support-section")}
                >
                  {copy.help}
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => openSupportEmail(copy.supportSubject)}
                >
                  {copy.contact}
                </button>
              </li>
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {copy.privacy}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">{copy.connect}</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
                onClick={() => openSupportEmail(copy.feedbackSubject)}
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>(c) 2026 Qazaq Video Learn. {copy.rights}</p>
        </div>
      </div>
    </footer>
  );
}
