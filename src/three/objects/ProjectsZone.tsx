"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { useView } from "@/store/viewStore";
import { Tile, COLORS } from "./Tile";
import { Trace } from "./Trace";
import { ModuleFrame } from "./ModuleFrame";
import { monitorScreen, projectCardFace, toTexture } from "../faces";
import { useInteractive, useZoneState } from "../interactions";
import { MONITOR, PROJECT_CARD, modules, type V3 } from "../layout";
import { useAtlas } from "../useAtlas";

/** Local position of a project card (front row, facing outward). */
export function cardPosition(i: number): V3 {
  const n = projects.length;
  const span = n * PROJECT_CARD.w + (n - 1) * PROJECT_CARD.gap;
  const x = -span / 2 + PROJECT_CARD.w / 2 + i * (PROJECT_CARD.w + PROJECT_CARD.gap);
  return [x, 0.1, PROJECT_CARD.z];
}

export const MONITOR_LOCAL: V3 = [0, MONITOR.y, MONITOR.z];
const BUS_Z = PROJECT_CARD.z - PROJECT_CARD.d / 2 - 0.42;

export function ProjectsZone({ smoothness }: { smoothness: number }) {
  useAtlas(); // ensures fonts are ready before faces are drawn
  const view = useView((s) => s.view);
  const hovered = useView((s) => s.hovered);
  const skillFocus = useView((s) => s.skillFocus);
  const { focused, dimmed } = useZoneState("projects");
  const selected = focused ? projects.find((p) => p.slug === view.item) : undefined;

  const faces = useMemo(() => projects.map((p) => toTexture(projectCardFace(p))), []);
  const screen = useMemo(() => toTexture(monitorScreen(projects)), []);
  const invalidate = useThree((s) => s.invalidate);
  const hoveredCard = projects.find((p) => hovered === `project:${p.slug}`);

  // Monitor shows the selected (or hovered) project.
  const shown = selected ?? hoveredCard;
  useEffect(() => {
    toTexture(monitorScreen(projects, shown), screen);
    invalidate();
  }, [shown, screen, invalidate]);

  const monitorRef = useRef<THREE.Group>(null);
  const zone = useInteractive(monitorRef, {
    id: "zone:projects",
    label: "Projects",
    detail: `${projects.length} built — click to browse`,
    href: "/projects",
    anchorY: 2.0,
    enabled: !focused,
  });

  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.tile.clone(), roughness: 0.42 }), []);
  const bezel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ececE8", roughness: 0.5 }), []);
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }), [screen]);
  const anim = useRef({ dim: 0 });
  useFrame((_, dt) => {
    const a = anim.current;
    if (easing.damp(a, "dim", dimmed ? 1 : 0, 0.3, Math.min(dt, 0.05))) invalidate();
    frame.color.copy(COLORS.tile).lerp(COLORS.bg, a.dim * 0.5);
    screenMat.color.setScalar(1 - a.dim * 0.3);
  });

  const xs = projects.map((_, i) => cardPosition(i)[0]);
  const back = modules.projects.back;

  return (
    <ModuleFrame id="projects">
      {/* Monitor — a thick tablet-like display (reference images 1–2) */}
      <group ref={monitorRef} {...zone.handlers}>
        <RoundedBox args={[2.0, 0.14, 1.2]} radius={0.06} smoothness={smoothness} position={[0, 0.07, MONITOR.z - 0.25]} material={frame} />
        <RoundedBox args={[0.46, 1.6, 0.24]} radius={0.09} smoothness={smoothness} position={[0, 0.85, MONITOR.z - 0.42]} material={frame} />
        <group position={MONITOR_LOCAL} rotation={[MONITOR.tilt, 0, 0]}>
          <RoundedBox args={[MONITOR.w, MONITOR.h, MONITOR.depth]} radius={0.2} smoothness={smoothness} material={frame} />
          <RoundedBox
            args={[MONITOR.w - 0.22, MONITOR.h - 0.22, 0.02]}
            radius={0.12}
            smoothness={2}
            position={[0, 0, MONITOR.depth / 2]}
            material={bezel}
          />
          <mesh position={[0, 0, MONITOR.depth / 2 + 0.012]} material={screenMat}>
            <planeGeometry args={[MONITOR.w - 0.38, MONITOR.h - 0.38]} />
          </mesh>
        </group>
      </group>

      {/* Trunk under the monitor to the hub spoke, a bus, and a stub to each card */}
      <Trace points={[[0, back], [0, BUS_Z]]} lit={!!selected || zone.hovered || !!hoveredCard} dimmed={dimmed} caps="none" />
      <Trace points={[[xs[0], BUS_Z], [xs[xs.length - 1], BUS_Z]]} lit={!!selected || zone.hovered} dimmed={dimmed} caps="none" />
      {projects.map((p, i) => {
        const [x, , z] = cardPosition(i);
        const on = selected?.slug === p.slug || hovered === `project:${p.slug}`;
        return <Trace key={p.slug} points={[[x, BUS_Z], [x, z - PROJECT_CARD.d / 2 + 0.05]]} lit={on} dimmed={dimmed} caps="none" />;
      })}

      {projects.map((p, i) => {
        const related = !!skillFocus && (p.stack as readonly string[]).includes(skillFocus);
        return (
          <Tile
            key={p.slug}
            position={cardPosition(i)}
            size={[PROJECT_CARD.w, PROJECT_CARD.h, PROJECT_CARD.d]}
            radius={0.08}
            face={faces[i]}
            smoothness={smoothness}
            dimmed={dimmed && !related}
            lit={related}
            active={selected?.slug === p.slug}
            interactive={{
              id: `project:${p.slug}`,
              label: p.title,
              detail: p.subtitle,
              href: `/projects/${p.slug}`,
              anchorY: 0.5,
            }}
          />
        );
      })}
    </ModuleFrame>
  );
}
