import * as React from "react";
import { gsap } from "gsap";

import { usePointerCapabilities } from "../../hooks/usePointerCapabilities";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { clamp } from "../../lib/motion";
import { cn } from "../ui/utils";

interface MagneticProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number;
  max?: number;
  disabled?: boolean;
  innerClassName?: string;
}

const Magnetic = React.forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, className, innerClassName, strength = 0.18, max = 14, disabled = false, ...props }, ref) => {
    const outerRef = React.useRef<HTMLDivElement | null>(null);
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion();
    const { shouldUseFinePointerEffects } = usePointerCapabilities();
    const isDisabled = disabled || reducedMotion || !shouldUseFinePointerEffects;

    React.useImperativeHandle(ref, () => outerRef.current as HTMLDivElement);

    React.useEffect(() => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner || isDisabled) return;

      const context = gsap.context(() => {
        const xTo = gsap.quickTo(inner, "x", { duration: 0.35, ease: "power3.out" });
        const yTo = gsap.quickTo(inner, "y", { duration: 0.35, ease: "power3.out" });

        const handlePointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;

          const rect = outer.getBoundingClientRect();
          const deltaX = event.clientX - (rect.left + rect.width / 2);
          const deltaY = event.clientY - (rect.top + rect.height / 2);

          xTo(clamp(deltaX * strength, -max, max));
          yTo(clamp(deltaY * strength, -max, max));
        };

        const handlePointerLeave = () => {
          gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.65,
            ease: "elastic.out(1, 0.45)",
          });
        };

        outer.addEventListener("pointermove", handlePointerMove);
        outer.addEventListener("pointerleave", handlePointerLeave);

        return () => {
          outer.removeEventListener("pointermove", handlePointerMove);
          outer.removeEventListener("pointerleave", handlePointerLeave);
        };
      }, outer);

      return () => context.revert();
    }, [isDisabled, max, strength]);

    return (
      <div ref={outerRef} className={cn("interactive inline-block", className)} {...props}>
        <div ref={innerRef} className={cn("will-change-transform", innerClassName)}>
          {children}
        </div>
      </div>
    );
  },
);
Magnetic.displayName = "Magnetic";

export { Magnetic };
export type { MagneticProps };
