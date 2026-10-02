import Image from "next/image";
import { experience } from "@/data/experience";
import { Bullets, SkillChips } from "@/components/ui/primitives";

export function ExperienceTimeline() {
  return (
    <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-line">
      {experience.map((r) => (
        <li key={r.id} id={r.id} className="relative scroll-mt-24 pl-12">
          <span
            aria-hidden
            className="absolute left-0 top-1 grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-surface font-mono text-[11px] font-semibold text-ink-2 ring-1 ring-line"
          >
            {r.logo ? <Image src={r.logo} alt="" width={40} height={40} className="h-full w-full object-contain p-1.5" /> : r.orgShort}
          </span>
          <article className="rounded-2xl bg-surface p-4 ring-1 ring-line">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{r.org}</h2>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                {r.current && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />}
                {r.period}
              </span>
            </div>
            <p className="mt-0.5 text-[14px] font-medium text-ink-2">{r.title}</p>
            <p className="mb-3 text-[13px] text-ink-3">{r.mode}</p>
            <Bullets items={r.points} />
            <div className="mt-4">
              <SkillChips ids={r.stack} />
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
