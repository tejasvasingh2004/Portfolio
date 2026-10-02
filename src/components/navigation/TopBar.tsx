"use client";

import Link from "next/link";
import { profile } from "@/data/profile";
import { useView } from "@/store/viewStore";
import { Icon } from "@/components/ui/Icon";
import { setMode, setMotion } from "@/lib/prefs";

const pill =
  "pointer-events-auto flex h-12 items-center gap-1 rounded-2xl bg-surface/85 px-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_30px_-12px_rgb(0_0_0/0.18)] ring-1 ring-line backdrop-blur-xl";

/** Two floating pills — identity on the left, actions on the right (navigation lives in the Dock). */
export function TopBar() {
  const setPaletteOpen = useView((s) => s.setPaletteOpen);
  const reduced = useView((s) => s.reducedMotion);
  const tier = useView((s) => s.tier);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className={pill}>
        <Link href="/" className="flex items-center gap-2.5 rounded-xl py-1 pl-0.5 pr-2.5" aria-label={`${profile.name} — home`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-mono text-[12px] font-semibold tracking-tight text-white shadow-[inset_0_-2px_0_rgb(255_255_255/0.08)]">
            {profile.monogram}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[13.5px] font-semibold tracking-[-0.01em] text-ink">{profile.name}</span>
            <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_2px_var(--accent-soft)]" />
              {profile.title}
            </span>
          </span>
        </Link>
      </div>

      <div className={pill}>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-[13px] text-ink-2 hover:bg-surface-2 hover:text-ink"
          aria-label="Search and jump (command menu)"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Icon name="search" size={15} />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden rounded-md bg-surface-2 px-1.5 font-mono text-[10.5px] text-ink-3 ring-1 ring-line md:inline">⌘K</kbd>
        </button>
        <span aria-hidden className="mx-0.5 hidden h-5 w-px bg-line sm:block" />
        <button
          type="button"
          onClick={() => setMotion(!reduced)}
          aria-pressed={reduced}
          title={reduced ? "Motion reduced — click to allow motion" : "Reduce motion"}
          className="hidden h-9 w-9 place-items-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink sm:grid"
        >
          <Icon name="waves" size={16} />
          <span className="sr-only">Reduce motion</span>
        </button>
        {tier !== "none" && (
          <button
            type="button"
            onClick={() => setMode(document.documentElement.dataset.mode === "2d" ? "3d" : "2d")}
            className="hidden h-9 items-center rounded-xl px-2 font-mono text-[11px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink sm:inline-flex"
            title="Switch between the 3D workspace and a classic 2D layout"
          >
            <span className="only-3d">2D</span>
            <span className="only-2d">3D</span>
            <span className="sr-only"> view</span>
          </button>
        )}
        <a
          href={profile.resume}
          download
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3 text-[13px] font-medium text-white hover:bg-[#2a2a2e]"
        >
          <Icon name="file-down" size={14} />
          <span className="hidden sm:inline">Résumé</span>
          <span className="sr-only sm:hidden">Résumé</span>
        </a>
      </div>
    </header>
  );
}
