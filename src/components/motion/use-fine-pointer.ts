"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

/** Media-query hook that is false on the server and during hydration. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True for mouse/trackpad devices: gates cursor, magnetic and parallax effects. */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}
