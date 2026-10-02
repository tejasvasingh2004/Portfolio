"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { aiSystems, type AiSystem } from "@/data/aiSystems";
import { projectBySlug } from "@/data/projects";
import { useView } from "@/store/viewStore";
import { ButtonLink, Section, Tag, cn } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { SystemDiagram } from "./SystemDiagram";

export function AiOverview() {
  return (
    <>
      <p className="text-[15px] leading-relaxed text-ink-2">
        I don&apos;t just call model APIs — I design the graph around them: who plans, who checks, when to loop, and
        what changes when the user&apos;s context changes. Three systems, each one explorable node by node.
      </p>
      <ul className="space-y-3">
        {aiSystems.map((s) => (
          <li key={s.id}>
            <Link
              href={`/ai/${s.id}`}
              className="group block rounded-2xl bg-surface p-4 ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-panel)] hover:ring-line-strong"
            >
              <p className="label-mono mb-1">{s.kicker}</p>
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                {s.title}{" "}
                <span aria-hidden className="inline-block text-ink-3 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{s.summary}</p>
              <p className="mt-2 font-mono text-[11px] text-ink-3">
                {s.nodes.length} nodes · {s.edges.length} edges{s.states ? ` · ${s.states.length} adaptive states` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function WorkloadSwitch({ system }: { system: AiSystem }) {
  const workload = useView((s) => s.workload);
  const setWorkload = useView((s) => s.setWorkload);
  if (!system.states) return null;
  return (
    <div>
      <p id="workload-label" className="label-mono mb-2">
        Simulated EEG workload
      </p>
      <div role="radiogroup" aria-labelledby="workload-label" className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-line">
        {system.states.map((s) => {
          const on = s.id === workload;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setWorkload(s.id)}
              className={cn(
                "h-9 rounded-lg text-[13px] font-medium transition-[background,color,box-shadow] duration-200",
                on ? "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/0.08)] ring-1 ring-line" : "text-ink-2 hover:text-ink",
              )}
            >
              <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", on ? "bg-accent" : "bg-line-strong")} />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AiSystemView({ system }: { system: AiSystem }) {
  const node = useSearchParams().get("node");
  const selected = system.nodes.find((n) => n.id === node);
  const project = system.project ? projectBySlug(system.project) : undefined;

  return (
    <>
      <p className="text-[15px] leading-relaxed text-ink-2">{system.summary}</p>
      {system.context && <p className="text-[13px] text-ink-3">{system.context}</p>}

      <WorkloadSwitch system={system} />

      <SystemDiagram system={system} selected={selected?.id} linkNodes />

      {selected ? (
        <section aria-live="polite" aria-labelledby="node-title" className="rounded-2xl bg-surface p-4 ring-1 ring-accent/40">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-ink">
              <Icon name={selected.icon} size={16} />
            </span>
            <div>
              <h2 id="node-title" className="text-[16px] font-semibold text-ink">
                {selected.label}
              </h2>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">{selected.kind}</p>
            </div>
            <Link
              href={`/ai/${system.id}`}
              scroll={false}
              aria-label="Close node details"
              className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              ✕
            </Link>
          </div>
          <p className="text-[14px] leading-relaxed text-ink-2">{selected.role}</p>
          <dl className="mt-3 space-y-2 text-[13px]">
            {selected.inputs && <NodeRow k="In" v={selected.inputs} />}
            {selected.outputs && <NodeRow k="Out" v={selected.outputs} />}
            {selected.impl && <NodeRow k="How" v={selected.impl} />}
            {selected.why && <NodeRow k="Why" v={selected.why} />}
          </dl>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-[13px] text-ink-3">
          Select any node — in the diagram above or in the 3D graph — to see what it does and how it&apos;s built.
        </p>
      )}

      <Section title="All nodes" id="ai-nodes">
        <ul className="grid grid-cols-2 gap-1.5">
          {system.nodes.map((n) => (
            <li key={n.id}>
              <Link
                href={`/ai/${system.id}?node=${n.id}`}
                scroll={false}
                aria-current={n.id === selected?.id ? "true" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-2.5 text-[13px] ring-1 transition-colors",
                  n.id === selected?.id ? "bg-accent-soft text-accent-ink ring-accent/40" : "bg-surface-2 text-ink-2 ring-line hover:text-ink",
                )}
              >
                <Icon name={n.icon} size={14} />
                <span className="truncate">{n.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {project && (
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/projects/${project.slug}`} icon="folder">
            Project write-up
          </ButtonLink>
          {project.links.github && (
            <ButtonLink href={project.links.github} icon="github" external>
              Source
            </ButtonLink>
          )}
        </div>
      )}

      <nav aria-label="Other AI systems" className="flex flex-wrap gap-2 border-t border-line pt-5">
        {aiSystems
          .filter((s) => s.id !== system.id)
          .map((s) => (
            <Link key={s.id} href={`/ai/${s.id}`} className="rounded-lg px-1 text-[13px] text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink">
              {s.title} →
            </Link>
          ))}
        <Tag tone="neutral">{system.kicker}</Tag>
      </nav>
    </>
  );
}

function NodeRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-2">
      <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">{k}</dt>
      <dd className="leading-relaxed text-ink-2">{v}</dd>
    </div>
  );
}
