export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function shouldDisableFinePointerEffects() {
  if (typeof window === "undefined") return true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hoverNone = window.matchMedia("(hover: none)").matches;
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return reduceMotion || coarsePointer || hoverNone || hasTouch;
}
