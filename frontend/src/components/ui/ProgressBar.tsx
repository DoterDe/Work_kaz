import React from "react";

import { cn } from "./utils";

interface ProgressBarProps {
  progress: number;
  color?: "primary" | "secondary" | "accent";
  height?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = "primary",
  height = "md",
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const colors = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  };
  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      <div
        className={cn("w-full overflow-hidden rounded-full bg-muted", heights[height])}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clampedProgress)}
      >
        <div
          className={cn(
            "h-full origin-left rounded-full motion-safe:transition-transform motion-safe:duration-500",
            colors[color],
          )}
          style={{ transform: `scaleX(${clampedProgress / 100})` }}
        />
      </div>
      {showLabel ? (
        <div className="mt-1 text-right text-sm text-muted-foreground">
          {Math.round(clampedProgress)}%
        </div>
      ) : null}
    </div>
  );
}
