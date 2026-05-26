import React from "react";
import { Clock, Play } from "lucide-react";

import { useAppPreferences } from "../../context/AppPreferencesContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CardGlow } from "./CardGlow";
import { LevelBadge } from "./LevelBadge";

interface LessonCardProps {
  title: string;
  level: string;
  duration: string;
  thumbnail: string;
  progress?: number;
  onClick?: () => void;
}

export function LessonCard({
  title,
  level,
  duration,
  thumbnail,
  progress = 0,
  onClick,
}: LessonCardProps) {
  const { language } = useAppPreferences();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const actionLabel =
    progress > 0
      ? language === "ru"
        ? "Продолжить"
        : "Жалғастыру"
      : language === "ru"
        ? "Начать урок"
        : "Сабақты бастау";

  return (
    <CardGlow
      hover
      padding="none"
      className="overflow-hidden"
      onClick={onClick}
      aria-label={onClick ? title : undefined}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover/card-glow:scale-[1.03]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover/card-glow:bg-black/15">
          <span className="flex h-14 w-14 scale-95 items-center justify-center rounded-full border border-white/60 bg-white/92 text-primary opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover/card-glow:scale-100 group-hover/card-glow:opacity-100">
            <Play className="ml-0.5 h-7 w-7" aria-hidden="true" />
          </span>
        </div>
        {clampedProgress > 0 ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/25">
            <div
              className="h-full origin-left bg-primary transition-transform duration-500"
              style={{ transform: `scaleX(${clampedProgress / 100})` }}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-6 text-card-foreground">
            {title}
          </h3>
          <LevelBadge level={level} size="sm" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {duration}
          </span>
        </div>

        <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors group-hover/card-glow:bg-primary/90">
          {actionLabel}
        </span>
      </div>
    </CardGlow>
  );
}
