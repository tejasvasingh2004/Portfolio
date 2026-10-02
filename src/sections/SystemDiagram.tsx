"use client";

import Link from "next/link";
import type { AiSystem } from "@/data/aiSystems";
import { useView } from "@/store/viewStore";
import { activeEdges, gridExtent, routeEdge } from "@/lib/graph";

const CW = 78; // cell width (px in viewBox)
const CH = 60; // cell height
const NW = 66; // node width
const NH = 30; // node height
const PAD = 8;

/** 2D, data-driven rendering of an AI system graph. Used in panels and the 2D fallback. */
export function SystemDiagram({
  system,
  selected,
  linkNodes = false,
}: {
  system: AiSystem;
  selected?: string;
  linkNodes?: boolean;
}) {
  const workload = useView((s) => s.workload);
  const state = system.states?.find((s) => s.id === workload) ?? system.states?.find((s) => s.id === system.defaultState);
  const active = activeEdges(system, state?.id);
  const hot = new Set<string>();
  system.edges.forEach((e) => {
    if (active.has(e.id)) hot.add(e.from).add(e.to);
  });

  const { cols, rows } = gridExtent(system);
  const ox = PAD + NW / 2;
  const oy = PAD + NH / 2;
  const W = (cols - 1) * CW + NW + PAD * 2;
  const H = (rows - 1) * CH + NH + PAD * 2 + 16;
  const hw = NW / 2 / CW;
  const hh = NH / 2 / CH;
  const toPx = ([x, y]: [number, number]) => `${ox + x * CW} ${oy + y * CH}`;

  return (
    <figure className="rounded-xl bg-surface-2 p-2 ring-1 ring-line">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="group" aria-label={`${system.title} architecture diagram`}>
        <defs>
          {(["idle", "hot"] as const).map((k) => (
            <marker key={k} id={`arrow-${k}-${system.id}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 8 4 0 8z" fill={k === "hot" ? "var(--accent)" : "var(--line-strong)"} />
            </marker>
          ))}
        </defs>

        {system.edges.map((e) => {
          const pts = routeEdge(system, e, hw, hh);
          const isHot = active.has(e.id);
          return (
            <path
              key={e.id}
              d={"M" + pts.map(toPx).join(" L ")}
              fill="none"
              stroke={isHot ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={isHot ? 1.6 : 1.1}
              strokeLinejoin="round"
              strokeDasharray={e.loop ? "3 3" : undefined}
              markerEnd={`url(#arrow-${isHot ? "hot" : "idle"}-${system.id})`}
              style={{ transition: "stroke 300ms" }}
            />
          );
        })}

        {system.nodes.map((n) => {
          const x = ox + n.at[0] * CW;
          const y = oy + n.at[1] * CH;
          const isSel = selected === n.id;
          const isHot = hot.has(n.id);
          const box = (
            <g>
              <rect
                x={x - NW / 2}
                y={y - NH / 2}
                width={NW}
                height={NH}
                rx={7}
                fill={isSel ? "var(--accent-soft)" : n.kind === "model" ? "#f1f1ee" : "#fff"}
                stroke={isSel ? "var(--accent)" : isHot ? "#f3c3a3" : "var(--line)"}
                strokeWidth={isSel ? 1.5 : 1}
                style={{ transition: "stroke 300ms, fill 300ms" }}
              />
              <text
                x={x}
                y={y + 3.2}
                textAnchor="middle"
                fontSize={n.label.length > 13 ? 7.2 : n.label.length > 10 ? 8 : 9}
                fontFamily="var(--font-geist-sans)"
                fontWeight={500}
                fill={isSel ? "var(--accent-ink)" : "var(--ink)"}
              >
                {n.label}
              </text>
            </g>
          );
          return linkNodes ? (
            <Link key={n.id} href={`/ai/${system.id}?node=${n.id}`} aria-label={`${n.label}: ${n.role}`} scroll={false}>
              {box}
            </Link>
          ) : (
            <g key={n.id}>{box}</g>
          );
        })}
      </svg>
      {state && (
        <figcaption className="px-2 pb-1 pt-1 font-mono text-[11px] leading-relaxed text-ink-3">
          {state.label} workload — {state.detail}
        </figcaption>
      )}
    </figure>
  );
}
