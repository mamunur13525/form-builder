import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 *
 * Used for layout decisions that cannot be expressed with CSS alone — e.g.
 * rendering panels inside a resizable group on desktop but inside a drawer on
 * mobile, where both variants must not be mounted at the same time.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Tailwind's `lg` breakpoint — the point where the 3-panel builder fits. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
