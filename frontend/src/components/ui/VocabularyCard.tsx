import React, { useState } from "react";
import { Star, Volume2 } from "lucide-react";

import { useAppPreferences } from "../../context/AppPreferencesContext";
import { CardGlow } from "./CardGlow";
import { cn } from "./utils";

interface VocabularyCardProps {
  word: string;
  pronunciation: string;
  translation: string;
  example?: string;
  saved?: boolean;
  onToggleSave?: () => void;
}

export function VocabularyCard({
  word,
  pronunciation,
  translation,
  example,
  saved = false,
  onToggleSave,
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { language } = useAppPreferences();

  const copy =
    language === "ru"
      ? {
          save: saved ? "Убрать из избранного" : "Добавить в избранное",
          listen: "Слушать",
          flip: "Нажмите, чтобы перевернуть",
          showTranslation: "Показать перевод",
          showWord: "Показать слово",
        }
      : {
          save: saved ? "Таңдаулыдан алып тастау" : "Таңдаулыға қосу",
          listen: "Тыңдау",
          flip: "Аудару үшін басыңыз",
          showTranslation: "Аудармасын көрсету",
          showWord: "Сөзді көрсету",
        };

  return (
    <CardGlow padding="none" className="min-h-[220px] overflow-hidden">
      <button
        type="button"
        onClick={() => onToggleSave?.()}
        aria-label={copy.save}
        aria-pressed={saved}
        className="interactive absolute right-4 top-4 z-10 rounded-full border border-border bg-background/80 p-2 text-muted-foreground outline-none backdrop-blur transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Star
          className={cn("h-5 w-5", saved && "fill-primary text-primary")}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? copy.showWord : copy.showTranslation}
        className="interactive flex min-h-[220px] w-full flex-col items-center justify-center px-6 py-8 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {!isFlipped ? (
          <>
            <div className="mb-5">
              <h2 className="mb-2 text-2xl font-semibold text-card-foreground">{word}</h2>
              <p className="text-sm italic text-muted-foreground">{pronunciation}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              {copy.listen}
            </span>
          </>
        ) : (
          <div>
            <p className="text-xl font-semibold text-card-foreground">{translation}</p>
            {example ? (
              <p className="mx-auto mt-4 max-w-sm text-sm italic leading-6 text-muted-foreground">
                “{example}”
              </p>
            ) : null}
          </div>
        )}

        <span className="mt-6 text-xs font-medium text-muted-foreground">{copy.flip}</span>
      </button>
    </CardGlow>
  );
}
