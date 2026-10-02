"use client";

import { useMemo, useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("ts:mode", cb);
  return () => window.removeEventListener("ts:mode", cb);
};

/** Current render mode ("3d" | "2d"), set before paint by the boot script. */
export function useMode(): "3d" | "2d" | null {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.mode === "2d" ? "2d" : "3d"),
    () => null,
  );
}

const mqSubscribe = (query: string) => (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useMediaQuery(query: string): boolean {
  const sub = useMemo(() => mqSubscribe(query), [query]);
  return useSyncExternalStore(
    sub,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
