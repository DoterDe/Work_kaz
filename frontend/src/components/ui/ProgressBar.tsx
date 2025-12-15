import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'primary' | 'secondary' | 'accent';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ 
  progress, 
  color = 'primary', 
  height = 'md',
  showLabel = false 
}: ProgressBarProps) {
  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
  };
  
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  return (
    <div className="w-full">
      <div className={`w-full bg-muted rounded-full overflow-hidden ${heights[height]}`}>
        <div 
          className={`${colors[color]} ${heights[height]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-muted-foreground text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
