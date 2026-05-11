import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div 
      {...props}
      className={`card-surface bg-card rounded-[24px] shadow-sm border border-border p-6 ${
        hover ? 'card-hoverable' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
