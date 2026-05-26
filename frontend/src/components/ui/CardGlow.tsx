import * as React from "react";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Card, type CardProps } from "./Card";
import { cn } from "./utils";

interface CardGlowProps extends CardProps {
  glowColor?: string;
  glowSize?: number;
}

const CardGlow = React.forwardRef<HTMLDivElement, CardGlowProps>(
  ({ className, glowColor = "rgba(59, 130, 246, 0.18)", glowSize = 360, onPointerMove, onPointerLeave, style, children, ...props }, ref) => {
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(localRef, ref);
    const frameRef = React.useRef<number | null>(null);
    const nextPointRef = React.useRef({ x: 50, y: 50 });
    const reducedMotion = useReducedMotion();

    const flushPoint = React.useCallback(() => {
      frameRef.current = null;
      const node = localRef.current;
      if (!node) return;
      node.style.setProperty("--card-glow-x", `${nextPointRef.current.x}px`);
      node.style.setProperty("--card-glow-y", `${nextPointRef.current.y}px`);
    }, []);

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (event.defaultPrevented || reducedMotion || event.pointerType === "touch") return;

        const node = localRef.current;
        if (!node) return;

        const rect = node.getBoundingClientRect();
        nextPointRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        if (frameRef.current === null) {
          frameRef.current = window.requestAnimationFrame(flushPoint);
        }
      },
      [flushPoint, onPointerMove, reducedMotion],
    );

    const handlePointerLeave = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        localRef.current?.style.removeProperty("--card-glow-active");
      },
      [onPointerLeave],
    );

    React.useEffect(() => {
      return () => {
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
        }
      };
    }, []);

    return (
      <Card
        ref={composedRef}
        className={cn("group/card-glow relative overflow-hidden", className)}
        style={
          {
            "--card-glow-color": glowColor,
            "--card-glow-size": `${glowSize}px`,
            ...style,
          } as React.CSSProperties
        }
        onPointerMove={handlePointerMove}
        onPointerEnter={() => localRef.current?.style.setProperty("--card-glow-active", "1")}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card-glow:opacity-100"
          style={{
            background:
              "radial-gradient(var(--card-glow-size) circle at var(--card-glow-x, 50%) var(--card-glow-y, 50%), var(--card-glow-color), transparent 58%)",
          }}
        />
        <div className="relative">{children}</div>
      </Card>
    );
  },
);
CardGlow.displayName = "CardGlow";

export { CardGlow };
export type { CardGlowProps };
