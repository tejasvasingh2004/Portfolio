"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { aiSystemById, aiSystems } from "@/data/aiSystems";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { links, profile } from "@/data/profile";
import type { View } from "@/lib/view";
import { cn } from "@/components/ui/primitives";
import {
  AI_NODE,
  AI_PLATE,
  AI_SWITCH_Z,
  CONTACT_CARD,
  EXP_CARD,
  PROJECT_CARD,
  moduleFrame,
  toWorld,
  type ModuleId,
  type V3,
} from "./layout";
import { KEY_W, nodeHeight, nodePosition, systemKeyX, workloadKeyX } from "./objects/AiLab";
import { keycapPositions } from "./objects/SkillsZone";
import { cardPosition } from "./objects/ProjectsZone";
import { expCardPose } from "./objects/ExperienceZone";
import { contactLinks, linkTileX, LINK_ROW_Z, LINK_TILE } from "./objects/ContactZone";

/**
 * All text on 3D objects is real HTML pinned to its object every frame — always crisp,
 * never blurred by texture filtering or post-processing (spec §9: 3D for space, HTML for text).
 * Labels for the open module always show; others appear once you zoom in close enough to read them.
 */

type Kind = "tile" | "card" | "below";

type ItemLabel = {
  id: string;
  text: string;
  sub?: string;
  module: ModuleId;
  /** Local module position of the label centre. */
  local: V3;
  /** Width of the surface it sits on (local units): text wraps to fit; hidden when too small to read. */
  width: number;
  kind: Kind;
  /** 3D object id, so the label reacts to hover/selection. */
  target?: string;
  current?: boolean;
};

export function itemLabelsFor(view: View, workload: string, skillFocus: string | null): ItemLabel[] {
  const out: ItemLabel[] = [];

  // AI Lab — node names, system keys, workload keys
  const sys = (view.zone === "ai" && view.item && aiSystemById(view.item)) || aiSystems[0];
  for (const n of sys.nodes) {
    const p = nodePosition(sys, n.id);
    out.push({
      id: `node:${sys.id}:${n.id}`,
      text: n.label,
      module: "ai",
      local: [p[0], AI_PLATE.h + nodeHeight(n.kind) + 0.01, p[2] + 0.23],
      width: AI_NODE.w,
      kind: "tile",
      target: `node:${sys.id}:${n.id}`,
      current: view.zone === "ai" && view.node === n.id,
    });
  }
  aiSystems.forEach((x, i) =>
    out.push({
      id: `system:${x.id}`,
      text: x.title,
      module: "ai",
      local: [systemKeyX(i), AI_PLATE.h + 0.17, AI_SWITCH_Z],
      width: KEY_W,
      kind: "tile",
      target: `system:${x.id}`,
      current: x.id === sys.id,
    }),
  );
  (sys.states ?? []).forEach((st, i, all) =>
    out.push({
      id: `workload:${st.id}`,
      text: st.label,
      module: "ai",
      local: [workloadKeyX(i, all.length), AI_PLATE.h + 0.17, AI_SWITCH_Z],
      width: 0.78,
      kind: "tile",
      target: `workload:${st.id}`,
      current: st.id === workload,
    }),
  );

  // Skills — keycaps
  for (const k of keycapPositions()) {
    out.push({ id: `skill:${k.id}`, text: k.label, module: "skills", local: k.pos, width: 0.84, kind: "tile", target: `skill:${k.id}`, current: skillFocus === k.id });
  }

  // Projects — cards (lower two-thirds of the face; the tag sits above)
  projects.forEach((p, i) => {
    const c = cardPosition(i);
    out.push({
      id: `project:${p.slug}`,
      text: p.title,
      sub: `${p.category} · ${p.subtitle}`,
      module: "projects",
      local: [c[0], c[1] + PROJECT_CARD.h + 0.01, c[2] + PROJECT_CARD.d * 0.12],
      width: PROJECT_CARD.w * 0.86,
      kind: "card",
      target: `project:${p.slug}`,
      current: view.zone === "projects" && view.item === p.slug,
    });
  });

  // Experience — cards (dealt into a timeline when the module is open)
  experience.forEach((r, i) => {
    const pose = expCardPose(i, view.zone === "experience");
    if (view.zone !== "experience" && i !== 0) return; // stacked: only the top card is visible
    out.push({
      id: `role:${r.id}`,
      text: r.org,
      sub: r.current ? `${r.title} · Present` : r.title,
      module: "experience",
      local: [pose.position[0], pose.position[1] + EXP_CARD.h + 0.01, pose.position[2] + EXP_CARD.d * 0.14],
      width: EXP_CARD.w * 0.86,
      kind: "card",
      target: `role:${r.id}`,
    });
  });

  // Contact — the card and the link tiles
  out.push({
    id: "contact:card",
    text: profile.name,
    sub: links.email,
    module: "contact",
    local: [CONTACT_CARD.w * 0.08, CONTACT_CARD.h + 0.01, -CONTACT_CARD.d * 0.24],
    width: CONTACT_CARD.w * 0.6,
    kind: "card",
    target: "zone:contact",
  });
  contactLinks.forEach((l, i) =>
    out.push({
      id: `link:${l.id}`,
      text: l.label,
      module: "contact",
      local: [linkTileX(i), 0.02, LINK_ROW_Z + LINK_TILE / 2 + 0.3],
      width: LINK_TILE + 0.2,
      kind: "below",
      target: `link:${l.id}`,
    }),
  );

  return out;
}

export const itemLabelElements = new Map<string, HTMLElement>();

export function ItemLabels() {
  const view = useView((s) => s.view);
  const workload = useView((s) => s.workload);
  const skillFocus = useView((s) => s.skillFocus);
  const hovered = useView((s) => s.hovered);
  const labels = itemLabelsFor(view, workload, skillFocus);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {labels.map((l) => {
        const hot = l.current || hovered === l.target;
        return (
          <span
            key={l.id}
            ref={(el) => {
              if (el) itemLabelElements.set(l.id, el);
              else itemLabelElements.delete(l.id);
            }}
            className={cn(
              "absolute left-0 top-0 block select-none leading-[1.15] will-change-transform",
              "[text-shadow:0_0_6px_rgb(250_250_248/0.95),0_0_2px_rgb(250_250_248/1)]",
              l.kind === "card" ? "text-left" : "text-center",
              l.kind === "below" && "rounded-lg bg-surface/95 px-2 py-0.5 shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-line",
            )}
            style={{ opacity: 0, transition: "opacity 180ms ease-out" }}
          >
            <span className={cn("block font-semibold tracking-[-0.01em] transition-colors", hot ? "text-accent-ink" : "text-ink")}>{l.text}</span>
            {l.sub && <span className="mt-[0.25em] line-clamp-2 block text-[0.74em] font-medium leading-snug text-ink-2">{l.sub}</span>}
          </span>
        );
      })}
    </div>
  );
}

const MIN_PX: Record<Kind, number> = { tile: 46, card: 110, below: 40 };

/** Positions labels each frame; sizes text to the surface on screen; hides labels too small to read or seen from behind. */
export function ItemLabelTracker() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const cam = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (itemLabelElements.size === 0) return;
    const { view, workload, skillFocus } = useView.getState();
    camera.getWorldPosition(cam);
    const sx = (p: THREE.Vector3) => (p.x * 0.5 + 0.5) * size.width;
    const sy = (p: THREE.Vector3) => (-p.y * 0.5 + 0.5) * size.height;

    for (const l of itemLabelsFor(view, workload, skillFocus)) {
      const el = itemLabelElements.get(l.id);
      if (!el) continue;

      // Printed on front-facing tops: hide when looking at the module from behind.
      const f = moduleFrame(l.module);
      const facing = (cam.x - f.position[0]) * Math.sin(f.rotationY) + (cam.z - f.position[2]) * Math.cos(f.rotationY);

      v.set(...toWorld(l.module, l.local)).project(camera);
      a.set(...toWorld(l.module, [l.local[0] - l.width / 2, l.local[1], l.local[2]])).project(camera);
      b.set(...toWorld(l.module, [l.local[0] + l.width / 2, l.local[1], l.local[2]])).project(camera);
      const x = sx(v);
      const y = sy(v);
      const px = Math.hypot(sx(b) - sx(a), sy(b) - sy(a));

      // The open module reads at a smaller size; others only once you've zoomed in.
      const open = view.zone === l.module;
      const min = MIN_PX[l.kind] * (open ? 1 : 1.7);
      const visible = v.z < 1 && facing > 0 && px > min && x > -80 && x < size.width + 80 && y > -80 && y < size.height + 80;
      el.style.opacity = visible ? "1" : "0";
      if (!visible) continue;

      const font = l.kind === "card" ? THREE.MathUtils.clamp(px / 9.5, 12, 18) : THREE.MathUtils.clamp(px / 7.2, 10.5, 14);
      el.style.fontSize = `${font.toFixed(1)}px`;
      el.style.width = l.kind === "card" ? `${Math.round(px)}px` : "";
      el.style.maxWidth = l.kind === "card" ? "" : `${Math.round(px * 0.94)}px`;
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%)`;
    }
  });
  return null;
}
