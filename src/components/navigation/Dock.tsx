"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { parseView, zoneMeta, zoneOrder, type Zone } from "@/lib/view";
import { useView } from "@/store/viewStore";
import { useMediaQuery, useMode } from "@/hooks/useMode";
import { cn } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";

const icons: Record<Zone, IconName> = {
  home: "layout",
  about: "user",
  projects: "folder",
  ai: "network",
  experience: "briefcase",
  skills: "keyboard",
  contact: "mail",
};

const items: { zone: Zone; label: string; href: string }[] = [
  { zone: "home", label: "Overview", href: "/" },
  ...zoneOrder.map((z) => ({ zone: z as Zone, label: zoneMeta[z].label, href: zoneMeta[z].href })),
];

const HINT_KEY = "ts-portfolio:orbit-hint";

/** OS-style dock: primary navigation, plus "recenter" after the visitor has dragged the view away. */
export function Dock() {
  const view = parseView(usePathname());
  const dirty = useView((s) => s.cameraDirty);
  const recenter = useView((s) => s.recenter);
  const ready = useView((s) => s.sceneReady);
  const mode = useMode();
  const phone = useMediaQuery("(max-width: 639px)");
  const panelOpen = view.zone !== "home";
  const [hint, setHint] = useState(false);

  // Show the orbit hint until the first drag (once per browser).
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(HINT_KEY) === "1";
    } catch {}
    if (seen || !ready) return;
    const t = window.setTimeout(() => setHint(true), 1200);
    return () => window.clearTimeout(t);
  }, [ready]);
  useEffect(() => {
    if (!dirty || !hint) return;
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {}
    const t = window.setTimeout(() => setHint(false), 300);
    return () => window.clearTimeout(t);
  }, [dirty, hint]);

  // On phones the bottom sheet replaces the dock while a panel is open.
  if (phone && panelOpen && mode === "3d") return null;

  return (
    <div
      className="pointer-events-none fixed bottom-3 z-50 flex flex-col items-center gap-2 transition-[left,right] duration-500 ease-[var(--ease-out)] sm:bottom-5"
      style={{
        left: 12,
        right: panelOpen && !phone && mode === "3d" ? "calc(var(--panel-w) + 44px)" : 12,
      }}
    >
      {hint && mode === "3d" && view.zone === "home" && (
        <p className="pointer-events-none flex animate-[rise_400ms_var(--ease-out)] items-center gap-2 rounded-full bg-ink/90 px-3.5 py-1.5 text-[12px] text-white shadow-[var(--shadow-float)] backdrop-blur">
          <Icon name="rotate-3d" size={14} />
          {phone ? "Drag to rotate 360° · Pinch to zoom" : "Drag to rotate 360° · Right-drag to pan · Scroll to zoom"}
        </p>
      )}

      <nav
        aria-label="Primary"
        className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl bg-surface/85 p-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_16px_40px_-14px_rgb(0_0_0/0.25)] ring-1 ring-line backdrop-blur-xl [scrollbar-width:none]"
      >
        {items.map((it) => {
          const on = view.zone === it.zone;
          return (
            <Link
              key={it.zone}
              href={it.href}
              aria-current={on ? "page" : undefined}
              aria-label={it.label}
              className={cn(
                "group relative flex h-11 shrink-0 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium transition-[background,color,box-shadow] duration-200 lg:px-3",
                on
                  ? "bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06),0_4px_12px_-4px_rgb(0_0_0/0.15)] ring-1 ring-line"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                  on ? "bg-accent text-white shadow-[0_4px_12px_-2px_rgb(255_106_19/0.55)]" : "bg-surface-2 text-ink-2 ring-1 ring-line group-hover:text-ink",
                )}
              >
                <Icon name={icons[it.zone]} size={15} />
              </span>
              <span className="hidden md:inline">{it.label}</span>
            </Link>
          );
        })}
        {mode === "3d" && dirty && (
          <>
            <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />
            <button
              type="button"
              onClick={recenter}
              className="flex h-11 shrink-0 animate-[rise_300ms_var(--ease-out)] items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium text-accent-ink hover:bg-accent-soft"
              title="Return the camera to this view's framing"
            >
              <Icon name="locate" size={16} />
              <span className="hidden md:inline">Recenter</span>
              <span className="sr-only md:hidden">Recenter view</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
