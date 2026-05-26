import * as React from "react";

import { shouldDisableFinePointerEffects } from "../../lib/motion";

function CustomCursor() {
  const [enabled, setEnabled] = React.useState(false);
  const dotRef = React.useRef<HTMLDivElement | null>(null);
  const followerRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const pointerRef = React.useRef({ x: 0, y: 0 });
  const followerRefValue = React.useRef({ x: 0, y: 0 });
  const hoverRef = React.useRef(false);

  React.useEffect(() => {
    if (shouldDisableFinePointerEffects()) {
      return;
    }

    setEnabled(true);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    document.documentElement.classList.add("has-custom-cursor");

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      hoverRef.current =
        target instanceof Element &&
        Boolean(target.closest(".interactive, a, button, input, textarea, select, [role='button']"));
    };

    const handlePointerOut = () => {
      hoverRef.current = false;
    };

    const animate = () => {
      const target = pointerRef.current;
      const current = followerRefValue.current;
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;

      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${hoverRef.current ? 0.75 : 1})`;
      follower.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${hoverRef.current ? 1.45 : 1})`;
      follower.style.opacity = hoverRef.current ? "0.42" : "0.28";

      frameRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <div
        ref={followerRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-cursor h-12 w-12 rounded-full border border-white/30 bg-primary/20 mix-blend-screen blur-[1px] transition-opacity duration-200"
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-cursor h-2.5 w-2.5 rounded-full bg-white shadow-glow"
      />
    </>
  );
}

export { CustomCursor };
