import React from "react";

import { cn } from "./utils";

interface LevelBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const colors: Record<string, string> = {
    A1: "border-secondary/25 bg-secondary/10 text-secondary",
    A2: "border-primary/25 bg-primary/10 text-primary",
    B1: "border-accent/30 bg-accent/10 text-accent",
    B2: "border-warning/30 bg-warning/10 text-warning",
  };
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-semibold leading-none",
        colors[level] || colors.A1,
        sizes[size],
      )}
    >
      {level}
    </span>
  );
}
