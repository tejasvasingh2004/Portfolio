"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { zoneMeta, zoneOrder, parseView } from "@/lib/view";
import { profile } from "@/data/profile";
import { useView } from "@/store/viewStore";
import { cn } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { setMode, setMotion } from "@/lib/prefs";

export function TopBar() {
  const pathname = usePathname();
  const view = parseView(pathname);
  const setPaletteOpen = useView((s) => s.setPaletteOpen);
  const reduced = useView((s) => s.reducedMotion);
  const tier = useView((s) => s.tier);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--topbar-h)] px-3 sm:px-5">
      <div className="mt-2 flex h-12 items-center gap-2 rounded-2xl bg-surface/80 px-2 ring-1 ring-line backdrop-blur-md sm:mt-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl px-1.5 py-1" aria-label={`${profile.name} — home`}>
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-ink font-mono text-[12px] font-semibold tracking-tight text-white">
            {profile.monogram}
            <span className="sr-only"> monogram</span>
          </span>
          <span className="hidden text-[14px] font-medium tracking-[-0.01em] text-ink md:inline">{profile.name}</span>
        </Link>

        <nav aria-label="Primary" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {zoneOrder.map((z) => {
              const on = view.zone === z;
              return (
                <li key={z}>
                  <Link
                    href={zoneMeta[z].href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-8 items-center rounded-lg px-3 text-[13px] transition-colors",
                      on ? "bg-surface-2 text-ink ring-1 ring-line" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {on && <span aria-hidden className="mr-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
                    {zoneMeta[z].label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] text-ink-2 ring-1 ring-line hover:text-ink hover:ring-line-strong"
            aria-label="Open command menu"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <span className="lg:hidden">Menu</span>
            <span className="hidden lg:inline">Jump to…</span>
            <kbd className="hidden rounded bg-surface-2 px-1.5 font-mono text-[10.5px] text-ink-3 ring-1 ring-line sm:inline">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => setMotion(!reduced)}
            aria-pressed={reduced}
            title={reduced ? "Motion reduced" : "Reduce motion"}
            className="hidden h-8 w-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink sm:grid"
          >
            <Icon name="waves" size={16} />
            <span className="sr-only">Reduce motion</span>
          </button>
          {tier !== "none" && (
            <button
              type="button"
              onClick={() => setMode(document.documentElement.dataset.mode === "2d" ? "3d" : "2d")}
              className="hidden h-8 items-center rounded-lg px-2 font-mono text-[11px] text-ink-2 hover:bg-surface-2 hover:text-ink sm:inline-flex"
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
            className="hidden h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[13px] font-medium text-white hover:bg-[#2a2a2e] sm:inline-flex"
          >
            <Icon name="file-down" size={14} />
            Résumé
          </a>
        </div>
      </div>
    </header>
  );
}
