import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import { aiSystemById } from "@/data/aiSystems";
import { skillById } from "@/data/skills";
import { Bullets, ButtonLink, Section, SkillChips, Tag } from "@/components/ui/primitives";
import { SystemDiagram } from "./SystemDiagram";

export function ProjectsIndex() {
  return (
    <ul className="space-y-3">
      {projects.map((p, i) => (
        <li key={p.slug}>
          <Link
            href={`/projects/${p.slug}`}
            className="group block rounded-2xl bg-surface p-4 ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-panel)] hover:ring-line-strong"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <Tag>{p.category}</Tag>
              <span className="font-mono text-[11px] text-ink-3">
                {String(i + 1).padStart(2, "0")} · {p.year}
              </span>
            </div>
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
              {p.title}
              <span className="ml-2 inline-block text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-3">{p.subtitle}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{p.tagline}</p>
            <p className="mt-3 font-mono text-[11px] text-ink-3">
              {p.stack.slice(0, 5).map((s) => skillById[s]?.label).join(" · ")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ProjectDetail({ project: p }: { project: Project }) {
  const system = p.aiSystem ? aiSystemById(p.aiSystem) : undefined;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{p.category}</Tag>
        <Tag tone="neutral">{p.year}</Tag>
      </div>

      <p className="text-[16px] leading-relaxed text-ink">{p.tagline}</p>

      {(p.links.github || p.links.live) && (
        <div className="flex flex-wrap gap-2">
          {p.links.github && (
            <ButtonLink href={p.links.github} icon="github" variant="primary" external>
              Source on GitHub
            </ButtonLink>
          )}
          {p.links.live && (
            <ButtonLink href={p.links.live} external>
              Live demo
            </ButtonLink>
          )}
        </div>
      )}

      <dl className="grid grid-cols-3 gap-2">
        {p.facts.map((f) => (
          <div key={f.label} className="rounded-xl bg-surface-2 px-3 py-2.5 ring-1 ring-line">
            <dd className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{f.value}</dd>
            <dt className="text-[12px] leading-tight text-ink-3">{f.label}</dt>
          </div>
        ))}
      </dl>

      <Section title="Problem" id="p-problem">
        <p className="text-[15px] leading-relaxed text-ink-2">{p.problem}</p>
      </Section>

      <Section title="Solution" id="p-solution">
        <p className="text-[15px] leading-relaxed text-ink-2">{p.solution}</p>
      </Section>

      {system && (
        <Section title="Architecture" id="p-arch">
          <SystemDiagram system={system} />
          <div className="mt-3">
            <ButtonLink href={`/ai/${system.id}`} icon="network">
              Explore the graph in the AI Lab
            </ButtonLink>
          </div>
        </Section>
      )}

      <Section title="Key engineering decisions" id="p-decisions">
        <Bullets items={p.decisions} />
      </Section>

      <Section title="Features" id="p-features">
        <Bullets items={p.features} />
      </Section>

      {p.challenges && (
        <Section title="Hardest problem" id="p-challenges">
          <Bullets items={p.challenges} />
        </Section>
      )}

      <Section title="Tech stack" id="p-stack">
        <SkillChips ids={p.stack} />
      </Section>

      {p.role && (
        <Section title="My role" id="p-role">
          <p className="text-[15px] leading-relaxed text-ink-2">{p.role}</p>
        </Section>
      )}

      {p.note && <p className="text-[13px] leading-relaxed text-ink-3">{p.note}</p>}
    </>
  );
}
