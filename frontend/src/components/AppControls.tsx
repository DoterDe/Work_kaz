import React from "react";
import { Languages, MoonStar, SunMedium } from "lucide-react";

import { Button } from "./ui/Button";
import { useAppPreferences } from "../context/AppPreferencesContext";

export function AppControls() {
  const { language, setLanguage, theme, toggleTheme, languageLabel } =
    useAppPreferences();

  const nextLanguage = language === "ru" ? "kk" : "ru";
  const copy =
    language === "ru"
      ? {
          languageSwitch: "Переключить язык",
          themeSwitch: "Переключить тему",
        }
      : {
          languageSwitch: "Тілді ауыстыру",
          themeSwitch: "Тақырыпты ауыстыру",
        };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-w-[90px]"
        onClick={() => setLanguage(nextLanguage)}
        aria-label={copy.languageSwitch}
      >
        <Languages className="h-4 w-4" />
        {languageLabel(language)}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-w-[48px] px-3"
        onClick={toggleTheme}
        aria-label={copy.themeSwitch}
      >
        {theme === "dark" ? (
          <SunMedium className="h-4 w-4" />
        ) : (
          <MoonStar className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
