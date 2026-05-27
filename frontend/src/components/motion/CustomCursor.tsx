import * as React from "react";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import { shouldDisableFinePointerEffects } from "../../lib/motion";

function CustomCursor() {
  const { theme } = useAppPreferences();
  const isLight = theme === "light";

  const [enabled, setEnabled] = React.useState(false);

  const dotRef = React.useRef<HTMLDivElement | null>(null);
  const followerRef = React.useRef<HTMLDivElement | null>(null);
  const trail1Ref = React.useRef<HTMLDivElement | null>(null);
  const trail2Ref = React.useRef<HTMLDivElement | null>(null);
  const rippleRef = React.useRef<HTMLDivElement | null>(null);

  const frameRef = React.useRef<number | null>(null);

  const pointer = React.useRef({ x: 0, y: 0 });
  const lastPointer = React.useRef({ x: 0, y: 0 });

  const follower = React.useRef({ x: 0, y: 0 });
  const trail1 = React.useRef({ x: 0, y: 0 });
  const trail2 = React.useRef({ x: 0, y: 0 });

  const velocity = React.useRef(0);
  const hoverRef = React.useRef(false);

  React.useEffect(() => {
    if (shouldDisableFinePointerEffects()) return;
    setEnabled(true);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current!;
    const follower = followerRef.current!;
    const t1 = trail1Ref.current!;
    const t2 = trail2Ref.current!;
    const ripple = rippleRef.current!;

    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;

      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;

      velocity.current = Math.min(30, Math.sqrt(dx * dx + dy * dy));

      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const over = (e: PointerEvent) => {
      const target = e.target;
      hoverRef.current =
        target instanceof Element &&
        Boolean(
          target.closest(
            ".interactive, a, button, input, textarea, select, [role='button']"
          )
        );
    };

    const click = (e: MouseEvent) => {
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;

      ripple.classList.remove("animate");
      void ripple.offsetWidth; // reset animation
      ripple.classList.add("animate");
    };

    const animate = () => {
      const p = pointer.current;

      // 🔥 speed stretch effect
      const stretch = Math.min(1.6, 1 + velocity.current / 25);

      // easing
      const ease = hoverRef.current ? 0.25 : 0.14;

      follower.current.x += (p.x - follower.current.x) * ease;
      follower.current.y += (p.y - follower.current.y) * ease;

      trail1.current.x += (follower.current.x - trail1.current.x) * 0.16;
      trail1.current.y += (follower.current.y - trail1.current.y) * 0.16;

      trail2.current.x += (trail1.current.x - trail2.current.x) * 0.12;
      trail2.current.y += (trail1.current.y - trail2.current.y) * 0.12;

      // dot (core)
      dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)
        translate(-50%, -50%)
        scale(${hoverRef.current ? 0.65 : 1})
        rotate(${velocity.current * 2}deg)`;

      // follower (elastic + stretch)
      follower.style.transform = `translate3d(${follower.current.x}px, ${follower.current.y}px, 0)
        translate(-50%, -50%)
        scale(${hoverRef.current ? 1.5 : 1})
        scaleX(${stretch})
        scaleY(${1 / stretch})`;

      // trails
      t1.style.transform = `translate3d(${trail1.current.x}px, ${trail1.current.y}px, 0)
        translate(-50%, -50%)
        scale(1.2)`;

      t2.style.transform = `translate3d(${trail2.current.x}px, ${trail2.current.y}px, 0)
        translate(-50%, -50%)
        scale(1)`;

      follower.style.opacity = hoverRef.current ? "0.45" : "0.25";
      t1.style.opacity = hoverRef.current ? "0.25" : "0.15";
      t2.style.opacity = hoverRef.current ? "0.12" : "0.08";

      velocity.current *= 0.92;

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("click", click);

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("click", click);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* RIPPLE */}
      <div
        ref={rippleRef}
        style={{ zIndex: 999999999 }}
        className="pointer-events-none fixed left-0 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 opacity-0"
      />

      {/* TRAIL 2 */}
      <div
        ref={trail2Ref}
        style={{ zIndex: 999999999 }}
        className="pointer-events-none fixed left-0 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px] bg-white/5"
      />

      {/* TRAIL 1 */}
      <div
        ref={trail1Ref}
        style={{ zIndex: 999999999 }}
        className="pointer-events-none fixed left-0 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[1px] bg-white/10"
      />

      {/* FOLLOWER */}
      <div
        ref={followerRef}
        style={{ zIndex: 999999999 }}
        className="pointer-events-none fixed left-0 top-0 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10"
      />

      {/* DOT */}
      <div
        ref={dotRef}
        style={{ zIndex: 999999999 }}
        className={`pointer-events-none fixed left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isLight ? "bg-black" : "bg-white"
        }`}
      />

      {/* CSS animation for ripple */}
      <style>{`
        .animate {
          animation: ripple 600ms ease-out;
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export { CustomCursor };