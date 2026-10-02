"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clusters, skills, skillById, type SkillId } from "@/data/skills";
import { skillUsage, usageCount } from "@/lib/usage";
import { useView } from "@/store/viewStore";
import { cn } from "@/components/ui/primitives";

export function SkillsView() {
  const params = useSearchParams();
  const raw = params.get("skill");
  const selected = raw && raw in skillById ? (raw as SkillId) : null;
  const setSkillFocus = useView((s) => s.setSkillFocus);

  // Mirror the selection into the 3D scene (lights keycap → project traces).
  useEffect(() => {
    setSkillFocus(selected);
    return () => setSkillFocus(null);
  }, [selected, setSkillFocus]);

  const usage = selected ? skillUsage(selected) : null;

  return (
    <>
      <p className="text-[15px] leading-relaxed text-ink-2">
        No progress bars — every skill links to the work that used it. Pick one to see where.
      </p>

      {selected && usage && (
        <section aria-live="polite" className="rounded-2xl bg-surface p-4 ring-1 ring-accent/40">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-ink">Where I used {skillById[selected].label}</h2>
            <Link href="/skills" scroll={false} aria-label="Clear skill selection" className="grid h-7 w-7 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink">
              ✕
            </Link>
          </div>
          {usage.projects.length + usage.roles.length === 0 ? (
            <p className="mt-2 text-[14px] text-ink-3">Part of my toolkit — not yet tied to a featured project here.</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {usage.projects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-[14px] text-ink ring-1 ring-line hover:ring-line-strong">
                    {p.title} <span className="font-mono text-[11px] text-ink-3">project →</span>
                  </Link>
                </li>
              ))}
              {usage.roles.map((r) => (
                <li key={r.id}>
                  <Link href={`/experience#${r.id}`} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-[14px] text-ink ring-1 ring-line hover:ring-line-strong">
                    {r.org} <span className="font-mono text-[11px] text-ink-3">role →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {clusters.map((c) => (
        <section key={c.id} aria-labelledby={`cl-${c.id}`} className="border-t border-line pt-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id={`cl-${c.id}`} className="text-[15px] font-semibold text-ink">
              {c.label}
            </h2>
            <span className="text-[12px] text-ink-3">{c.blurb}</span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {skills
              .filter((s) => s.cluster === c.id)
              .map((s) => {
                const n = usageCount(s.id);
                const on = s.id === selected;
                return (
                  <li key={s.id}>
                    <Link
                      href={on ? "/skills" : `/skills?skill=${s.id}`}
                      scroll={false}
                      aria-pressed={on}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] ring-1 transition-colors",
                        on ? "bg-accent-soft text-accent-ink ring-accent/50" : "bg-surface-2 text-ink-2 ring-line hover:text-ink hover:ring-line-strong",
                      )}
                    >
                      {s.label}
                      {n > 0 && <span className={cn("font-mono text-[10px]", on ? "text-accent-ink" : "text-ink-3")}>{n}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </>
  );
}
