import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

const buttonVariants = cva(
  [
    "btn-interactive interactive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
    "aria-disabled:pointer-events-none aria-disabled:opacity-55",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "border border-primary/20 bg-primary text-primary-foreground shadow-sm shadow-black/10 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
        secondary:
          "border border-secondary/20 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:shadow-md active:scale-[0.98]",
        accent:
          "border border-accent/20 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-md active:scale-[0.98]",
        destructive:
          "border border-destructive/20 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-border bg-background/40 text-foreground shadow-sm hover:border-primary/35 hover:bg-primary/10 hover:text-primary active:scale-[0.98]",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-xs",
        md: "h-11 px-5",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={!asChild ? isDisabled : undefined}
        aria-disabled={asChild && isDisabled ? true : props["aria-disabled"]}
        aria-busy={loading || undefined}
        type={!asChild ? type ?? "button" : undefined}
        data-loading={loading ? "true" : undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : leftIcon}
        <span className="contents">{loading && loadingText ? loadingText : children}</span>
        {!loading ? rightIcon : null}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
