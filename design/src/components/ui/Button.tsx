import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-[20px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-[#1557CC] shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-[#007048] shadow-sm hover:shadow-md',
    accent: 'bg-accent text-accent-foreground hover:bg-[#F5C935] shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
    ghost: 'text-foreground hover:bg-muted',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
