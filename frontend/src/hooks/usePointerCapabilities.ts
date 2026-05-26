import * as React from "react";

import { useMediaQuery } from "./useMediaQuery";

export function usePointerCapabilities() {
  const coarsePointer = useMediaQuery("(pointer: coarse)", false);
  const hoverNone = useMediaQuery("(hover: none)", false);
  const [hasTouch, setHasTouch] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    setHasTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return {
    coarsePointer,
    finePointer: !coarsePointer,
    hoverNone,
    canHover: !hoverNone,
    hasTouch,
    shouldUseFinePointerEffects: !coarsePointer && !hoverNone && !hasTouch,
  };
}
