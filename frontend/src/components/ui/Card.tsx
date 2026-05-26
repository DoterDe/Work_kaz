import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const cardVariants = cva(
  "card-surface rounded-2xl border text-card-foreground shadow-sm transition-[border-color,box-shadow,transform] duration-200",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        elevated: "border-border/80 bg-card shadow-md",
        subtle: "border-border/70 bg-muted/40",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        true: "card-hoverable",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof cardVariants>, "hover"> {
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover = false, onClick, onKeyDown, tabIndex, role, ...props }, ref) => {
    const isInteractive = Boolean(onClick);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!isInteractive || event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, hover }),
          isInteractive && "interactive cursor-pointer",
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role={role ?? (isInteractive ? "button" : undefined)}
        tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export { Card, cardVariants };
export type { CardProps };
