"use client";

import { useView } from "@/store/viewStore";

/** Module-level handle so the in-canvas tracker can position this element every frame. */
export const tooltipElement: { current: HTMLDivElement | null } = { current: null };

/** One DOM tooltip for the whole scene (crisp text, cheap, accessible colours). */
export function Tooltip() {
  const tip = useView((s) => s.tooltip);
  return (
    <div
      ref={(el) => {
        tooltipElement.current = el;
      }}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
      style={{ opacity: tip ? 1 : 0, transition: "opacity 140ms ease-out" }}
    >
      {tip && (
        <div className="max-w-[260px] animate-[rise_200ms_var(--ease-out)] rounded-xl bg-surface/95 px-3 py-2 shadow-[var(--shadow-panel)] ring-1 ring-line backdrop-blur">
          <p className="text-[13px] font-semibold leading-tight text-ink">{tip.label}</p>
          {tip.detail && <p className="mt-0.5 text-[12px] leading-snug text-ink-2">{tip.detail}</p>}
        </div>
      )}
    </div>
  );
}
