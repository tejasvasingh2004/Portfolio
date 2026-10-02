"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { aiSystems, aiSystemById, type AiSystem } from "@/data/aiSystems";
import { useView } from "@/store/viewStore";
import { activeEdges, gridExtent, routeEdge } from "@/lib/graph";
import { Tile, COLORS } from "./Tile";
import { Trace } from "./Trace";
import { useInteractive, useZoneState } from "../interactions";
import { AI_CELL, AI_GRAPH_OFFSET, AI_NODE, AI_PLATE, AI_SWITCH_Z, toWorld as moduleToWorld, type V3 } from "../layout";
import { ModuleFrame } from "./ModuleFrame";
import { useAtlas } from "../useAtlas";

/** Module-local origin; the ModuleFrame places the lab on the ring. */
const A: V3 = [0, 0, 0];

/** World position of a node of the given system. */
export function nodePosition(system: AiSystem, id: string): V3 {
  const { cols, rows } = gridExtent(system);
  const n = system.nodes.find((x) => x.id === id)!;
  return [
    A[0] + AI_GRAPH_OFFSET[0] + (n.at[0] - (cols - 1) / 2) * AI_CELL,
    AI_PLATE.h,
    A[2] + AI_GRAPH_OFFSET[2] + (n.at[1] - (rows - 1) / 2) * AI_CELL,
  ];
}

/** World position of a node (for camera targeting). */
export const nodeWorld = (system: AiSystem, id: string): V3 => moduleToWorld("ai", nodePosition(system, id));

/** BFS depth of each node along the active edges — used to sequence pulses. */
function depths(system: AiSystem, active: Set<string>) {
  const edges = system.edges.filter((e) => active.has(e.id) && !e.loop);
  const incoming = new Map<string, number>();
  edges.forEach((e) => incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1));
  const depth = new Map<string, number>();
  const queue = system.nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id);
  queue.forEach((id) => depth.set(id, 0));
  while (queue.length) {
    const id = queue.shift()!;
    for (const e of edges.filter((x) => x.from === id)) {
      const d = (depth.get(id) ?? 0) + 1;
      if ((depth.get(e.to) ?? -1) < d) {
        depth.set(e.to, d);
        queue.push(e.to);
      }
    }
  }
  return depth;
}

export function AiLab({ smoothness }: { smoothness: number }) {
  useAtlas();
  const view = useView((s) => s.view);
  const workload = useView((s) => s.workload);
  const setWorkload = useView((s) => s.setWorkload);
  const { focused, dimmed } = useZoneState("ai");
  const system = (focused && view.item && aiSystemById(view.item)) || aiSystems[0];
  const selectedNode = focused ? view.node : undefined;

  const active = useMemo(() => activeEdges(system, workload), [system, workload]);
  const hot = useMemo(() => {
    const s = new Set<string>();
    system.edges.forEach((e) => active.has(e.id) && s.add(e.from).add(e.to));
    return s;
  }, [system, active]);
  const depth = useMemo(() => depths(system, active), [system, active]);

  // A sequenced pulse fires through the graph whenever the system or workload changes
  // (Trace re-fires when this value changes).
  const pulseKey = useMemo(() => {
    const sig = `${system.id}:${workload}`;
    let h = 7;
    for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) >>> 0;
    return (h % 1_000_000) + 1;
  }, [system.id, workload]);

  const plateRef = useRef<THREE.Group>(null);
  const zone = useInteractive(plateRef, {
    id: "zone:ai",
    label: "AI Lab",
    detail: `${aiSystems.length} agent systems — click to explore`,
    href: "/ai",
    anchorY: 1.4,
    enabled: !focused,
  });

  const plateMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f6f6f3", roughness: 0.6 }), []);
  const invalidate = useThree((s) => s.invalidate);
  const anim = useRef({ dim: 0 });
  useFrame((_, dt) => {
    if (easing.damp(anim.current, "dim", dimmed ? 1 : 0, 0.3, Math.min(dt, 0.05))) invalidate();
    plateMat.color.set("#f6f6f3").lerp(COLORS.bg, anim.current.dim * 0.5);
  });

  const hw = AI_NODE.w / 2 / AI_CELL;
  const hh = AI_NODE.d / 2 / AI_CELL;
  const { cols, rows } = gridExtent(system);
  const toWorld = ([cx, cz]: [number, number]): [number, number] => [
    A[0] + AI_GRAPH_OFFSET[0] + (cx - (cols - 1) / 2) * AI_CELL,
    A[2] + AI_GRAPH_OFFSET[2] + (cz - (rows - 1) / 2) * AI_CELL,
  ];

  const switchZ = A[2] + AI_SWITCH_Z;
  const keyW = 1.25;

  return (
    <ModuleFrame id="ai">
      {/* Raised sub-board */}
      <group ref={plateRef} {...zone.handlers}>
        <RoundedBox
          args={[AI_PLATE.w, AI_PLATE.h, AI_PLATE.d]}
          radius={0.08}
          smoothness={smoothness}
          position={[A[0], AI_PLATE.h / 2, A[2]]}
          material={plateMat}
        />
      </group>

      {/* Graph edges */}
      <group position={[0, AI_PLATE.h, 0]}>
        {system.edges.map((e) => {
          const pts = routeEdge(system, e, hw, hh).map(toWorld);
          const on = active.has(e.id);
          return (
            <Trace
              key={`${system.id}:${e.id}`}
              points={pts}
              lit={on && (focused || zone.hovered || !dimmed)}
              dimmed={dimmed}
              radius={0.045}
              caps="none"
              dashed={e.loop}
              pulse={on && focused ? pulseKey : 0}
              delay={(depth.get(e.from) ?? 0) * 0.32}
            />
          );
        })}
      </group>

      {/* Graph nodes */}
      {system.nodes.map((n, i) => {
        const p = nodePosition(system, n.id);
        const h = n.kind === "input" || n.kind === "output" ? AI_NODE.h * 0.8 : AI_NODE.h;
        return (
          <Tile
            key={`${system.id}:${n.id}`}
            position={p}
            size={[AI_NODE.w, h, AI_NODE.d]}
            radius={0.09}
            color={n.kind === "model" ? "#efefec" : undefined}
            smoothness={smoothness}
            dimmed={dimmed}
            lit={hot.has(n.id) && !dimmed}
            active={selectedNode === n.id}
            enterFrom={-0.4 - i * 0.04}
            decals={[
              { key: `icon:${n.icon}`, height: 0.4, offset: [0, -0.12] },
              { key: `text:${n.label}`, height: 0.15, offset: [0, 0.27], tone: "ink" },
            ]}
            interactive={{
              id: `node:${system.id}:${n.id}`,
              label: n.label,
              detail: n.role,
              href: `/ai/${system.id}?node=${n.id}`,
              anchorY: 0.45,
              enabled: focused,
            }}
          />
        );
      })}

      {/* System switch keys (front-left of the plate) */}
      {aiSystems.map((s, i) => {
        const x = A[0] - AI_PLATE.w / 2 + 0.5 + keyW / 2 + i * (keyW + 0.12);
        return (
          <Tile
            key={s.id}
            position={[x, AI_PLATE.h, switchZ]}
            size={[keyW, 0.16, 0.62]}
            radius={0.07}
            smoothness={smoothness}
            dimmed={dimmed}
            active={focused && s.id === system.id}
            lit={!focused && s.id === system.id}
            decals={[{ key: `text:${s.title}`, height: 0.19, tone: "ink" }]}
            interactive={{
              id: `system:${s.id}`,
              label: s.title,
              detail: s.kicker,
              href: `/ai/${s.id}`,
              anchorY: 0.35,
              enabled: focused,
            }}
          />
        );
      })}

      {/* Workload switch — NeuroFlow only (front-right) */}
      {system.states && (
        <group>
          {system.states.map((st, i) => {
            const x = A[0] + AI_PLATE.w / 2 - 0.45 - 0.39 - (system.states!.length - 1 - i) * 0.88;
            return (
              <Tile
                key={st.id}
                position={[x, AI_PLATE.h, switchZ]}
                size={[0.78, 0.16, 0.62]}
                radius={0.07}
                smoothness={smoothness}
                dimmed={dimmed}
                active={workload === st.id && focused}
                lit={workload === st.id && !focused}
                decals={[{ key: `text:${st.label.toUpperCase()}`, height: 0.15, tone: "ink" }]}
                interactive={{
                  id: `workload:${st.id}`,
                  label: `${st.label} workload`,
                  detail: st.detail,
                  onActivate: () => setWorkload(st.id),
                  anchorY: 0.35,
                  enabled: focused,
                }}
              />
            );
          })}
        </group>
      )}
    </ModuleFrame>
  );
}
