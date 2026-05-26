import * as React from "react";

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}

export function useComposedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useMemo(() => composeRefs(...refs), refs);
}
