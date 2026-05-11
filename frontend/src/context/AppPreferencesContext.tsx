import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ru" | "kk";
export type ThemeMode = "light" | "dark";

const DEFAULT_LANGUAGE: Language =
  import.meta.env.VITE_DEFAULT_LANGUAGE === "kk" ? "kk" : "ru";
const DEFAULT_THEME: ThemeMode =
  import.meta.env.VITE_DEFAULT_THEME === "light" ? "light" : "dark";

const LANGUAGE_LABELS: Record<Language, string> = {
  ru: "Рус",
  kk: "Қаз",
};

const CATEGORY_LABELS: Record<Language, Record<string, string>> = {
  ru: {
    All: "Все",
    "All Topics": "Все темы",
    "Everyday Speech": "Повседневная речь",
    Travel: "Путешествия",
    "School & Education": "Школа и образование",
    "Work & Business": "Работа и бизнес",
    Grammar: "Грамматика",
    Culture: "Культура",
    "Food & Dining": "Еда и общение",
  },
  kk: {
    All: "Барлығы",
    "All Topics": "Барлық тақырып",
    "Everyday Speech": "Күнделікті сөйлеу",
    Travel: "Саяхат",
    "School & Education": "Мектеп пен оқу",
    "Work & Business": "Жұмыс пен бизнес",
    Grammar: "Грамматика",
    Culture: "Мәдениет",
    "Food & Dining": "Тағам мен қарым-қатынас",
  },
};

const MODE_LABELS: Record<Language, Record<string, string>> = {
  ru: {
    learn: "Изучение",
    flashcards: "Карточки",
    quiz: "Квиз",
  },
  kk: {
    learn: "Үйрену",
    flashcards: "Карталар",
    quiz: "Квиз",
  },
};

interface AppPreferencesContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  locale: string;
  languageLabel: (language: Language) => string;
  translateCategory: (value: string) => string;
  translateMode: (value: string) => string;
  formatMinutes: (value: number) => string;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_LANGUAGE;
    }

    const stored = window.localStorage.getItem("app-language");
    return stored === "kk" || stored === "ru" ? stored : DEFAULT_LANGUAGE;
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_THEME;
    }

    const stored = window.localStorage.getItem("app-theme");
    return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
  });

  useEffect(() => {
    window.localStorage.setItem("app-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("app-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.dataset.theme = theme;
  }, [theme]);

  const value: AppPreferencesContextValue = {
    language,
    setLanguage,
    theme,
    setTheme,
    toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    locale: language === "ru" ? "ru-RU" : "kk-KZ",
    languageLabel: (item) => LANGUAGE_LABELS[item],
    translateCategory: (item) => CATEGORY_LABELS[language][item] || item,
    translateMode: (item) => MODE_LABELS[language][item] || item,
    formatMinutes: (value) => `${value} ${language === "ru" ? "мин" : "мин"}`,
  };

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }

  return context;
}
