import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const base =
    'btn-interactive inline-flex items-center justify-center gap-2 rounded-[20px] transition-all duration-200 font-medium disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-[#1557CC] hover:shadow-md',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-[#007048] hover:shadow-md',
    accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-[#F5C935] hover:shadow-md',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
    outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary/5',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};
