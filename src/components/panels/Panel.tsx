"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/components/ui/primitives";

type PagerLink = { href: string; label: string };

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  back: { href: string; label: string };
  pager?: { prev?: PagerLink; next?: PagerLink; position?: string };
  children: ReactNode;
};

/**
 * Content surface for every non-home route.
 * Desktop/tablet: right side panel. Phone: draggable bottom sheet. 2D mode: a normal page.
 */
export function Panel({ kicker, title, subtitle, back, pager, children }: Props) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [sheet, setSheet] = useState<"peek" | "full">("peek");
  const drag = useRef<{ y: number; start: number; moved: boolean } | null>(null);

  // Move focus to the heading so screen readers announce the new view.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [title]);

  // ── Phone bottom-sheet dragging ──
  const onPointerDown = (e: PointerEvent) => {
    if (window.innerWidth >= 640) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    const el = panelRef.current;
    if (!el) return;
    const offset = el.getBoundingClientRect().top;
    drag.current = { y: e.clientY, start: offset, moved: false };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    const el = panelRef.current;
    if (!drag.current || !el) return;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    if (!drag.current.moved) return;
    el.dataset.dragging = "true";
    const h = el.offsetHeight;
    const baseTop = window.innerHeight - h;
    const top = Math.max(baseTop, drag.current.start + dy);
    el.style.setProperty("--sheet-offset", `${((top - baseTop) / h) * 100}%`);
  };
  const onPointerUp = (e: PointerEvent) => {
    const el = panelRef.current;
    if (!drag.current || !el) return;
    const dy = e.clientY - drag.current.y;
    const moved = drag.current.moved;
    drag.current = null;
    el.dataset.dragging = "false";
    el.style.removeProperty("--sheet-offset");
    if (!moved) {
      setSheet((s) => (s === "peek" ? "full" : "peek"));
      return;
    }
    if (dy < -40) setSheet("full");
    else if (dy > 60) {
      if (sheet === "full") setSheet("peek");
      else router.push(back.href);
    }
  };

  return (
    <article
      ref={panelRef}
      className="panel"
      data-sheet={sheet}
      aria-labelledby="panel-title"
    >
      {/* Sticky header — also the sheet's drag handle on phones */}
      <header
        className="relative shrink-0 touch-none select-none border-b border-line bg-surface/95 px-5 pb-3 pt-3 sm:touch-auto sm:select-auto"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div aria-hidden className="mx-auto mb-2 h-1 w-10 rounded-full bg-line-strong sm:hidden" />
        <div className="flex items-center justify-between gap-3">
          <Link
            href={back.href}
            className="-ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <span aria-hidden>←</span> {back.label}
          </Link>
          <div className="flex items-center gap-1">
            {pager && (
              <>
                {pager.prev ? (
                  <Link href={pager.prev.href} aria-label={`Previous: ${pager.prev.label}`} className="grid h-8 w-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink">
                    ‹
                  </Link>
                ) : (
                  <span className="grid h-8 w-8 place-items-center text-line-strong" aria-hidden>‹</span>
                )}
                {pager.position && <span className="px-1 font-mono text-[11px] text-ink-3">{pager.position}</span>}
                {pager.next ? (
                  <Link href={pager.next.href} aria-label={`Next: ${pager.next.label}`} className="grid h-8 w-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink">
                    ›
                  </Link>
                ) : (
                  <span className="grid h-8 w-8 place-items-center text-line-strong" aria-hidden>›</span>
                )}
              </>
            )}
            <Link
              href="/"
              aria-label="Close panel and return to the workspace"
              className="only-3d grid h-8 w-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              ✕
            </Link>
          </div>
        </div>
      </header>

      <div className={cn("scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-10 pt-5")}>
        <div key={title} className="stagger space-y-6">
          <div>
            <p className="label-mono mb-2 !text-accent-ink">{kicker}</p>
            <h1
              id="panel-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink outline-none"
            >
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </article>
  );
}
