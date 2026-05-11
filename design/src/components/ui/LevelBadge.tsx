import React from 'react';

interface LevelBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const colors: Record<string, string> = {
    'A1': 'bg-secondary/10 text-secondary border-secondary/20',
    'A2': 'bg-primary/10 text-primary border-primary/20',
    'B1': 'bg-accent/30 text-accent-foreground border-accent/40',
    'B2': 'bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2',
  };
  
  return (
    <span 
      className={`inline-block rounded-full border ${colors[level] || colors['A1']} ${sizes[size]}`}
    >
      {level}
    </span>
  );
}
