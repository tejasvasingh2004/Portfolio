import { contributions, mergedCount, prUrl } from "@/data/openSource";
import { Section, Tag } from "@/components/ui/primitives";

export function OpenSourceList() {
  return (
    <Section title={`Open source · ${mergedCount} merged`} id="open-source">
      <ul className="space-y-2">
        {contributions.map((c) => (
          <li key={c.id}>
            <a
              href={prUrl(c)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl bg-surface p-4 ring-1 ring-line transition-[box-shadow] duration-200 hover:ring-line-strong"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[15px] font-semibold text-ink">{c.project}</span>
                <span className="font-mono text-[11px] text-ink-3">#{c.pr}</span>
                <span className="ml-auto">
                  <Tag tone={c.status === "merged" ? "accent" : "neutral"}>{c.status === "merged" ? "Merged" : "In review"}</Tag>
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-ink-3">
                {c.about} · {c.lang} · {c.date}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{c.summary}</p>
              <p className="mt-2 truncate font-mono text-[11.5px] text-ink-3 group-hover:text-ink-2">
                {c.repo} <span aria-hidden>↗</span>
              </p>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
