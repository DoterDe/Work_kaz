import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const inputVariants = cva(
  [
    "w-full min-w-0 rounded-xl border bg-input-background text-foreground shadow-sm outline-none",
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "transition-[color,border-color,box-shadow,background-color] duration-200",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
  ].join(" "),
  {
    variants: {
      inputSize: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-4 text-base",
      },
      hasLeftIcon: {
        true: "pl-11",
      },
      hasRightIcon: {
        true: "pr-11",
      },
    },
    defaultVariants: {
      inputSize: "md",
    },
  },
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  success?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floatingLabel?: boolean;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      inputSize,
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      floatingLabel = false,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `input-${reactId}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const successId = success ? `${inputId}-success` : undefined;
    const describedBy = [ariaDescribedBy, errorId, successId, helperId].filter(Boolean).join(" ") || undefined;
    const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true";

    return (
      <div className={cn("grid gap-2", containerClassName)}>
        {label && !floatingLabel ? (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            data-slot="input"
            className={cn(
              inputVariants({
                inputSize,
                hasLeftIcon: Boolean(leftIcon),
                hasRightIcon: Boolean(rightIcon),
              }),
              floatingLabel && "peer pt-5",
              className,
            )}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            {...props}
          />
          {floatingLabel && label ? (
            <label
              htmlFor={inputId}
              className="pointer-events-none absolute left-4 top-1.5 text-xs text-muted-foreground transition-colors peer-focus:text-primary"
            >
              {label}
            </label>
          ) : null}
          {rightIcon ? (
            <span className="absolute right-4 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </span>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        ) : success ? (
          <p id={successId} className="text-sm text-secondary">
            {success}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
