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
import { monitorScreen, projectCardFace, toTexture } from "../faces";
import { useInteractive, useZoneState } from "../interactions";
import { MONITOR, PROJECT_CARD, zonePos, type V3 } from "../layout";
import { useAtlas } from "../useAtlas";

const P = zonePos.projects;

export function cardPosition(i: number): V3 {
  const n = projects.length;
  const span = n * PROJECT_CARD.w + (n - 1) * PROJECT_CARD.gap;
  const x = -span / 2 + PROJECT_CARD.w / 2 + i * (PROJECT_CARD.w + PROJECT_CARD.gap);
  return [P[0] + x, 0.08, P[2] + PROJECT_CARD.z];
}

export const MONITOR_CENTER: V3 = [P[0], MONITOR.y, P[2] + MONITOR.z];
const BUS_Z = P[2] + PROJECT_CARD.z + PROJECT_CARD.d / 2 + 0.55;

export function ProjectsZone({ smoothness }: { smoothness: number }) {
  useAtlas(); // ensures fonts are ready before faces are drawn
  const view = useView((s) => s.view);
  const hovered = useView((s) => s.hovered);
  const { focused, dimmed } = useZoneState("projects");
  const selected = focused ? projects.find((p) => p.slug === view.item) : undefined;

  const faces = useMemo(() => projects.map((p, i) => toTexture(projectCardFace(p, i))), []);
  const screen = useMemo(() => toTexture(monitorScreen(projects)), []);
  const invalidate = useThree((s) => s.invalidate);
  const hoveredCard = projects.find((p) => hovered === `project:${p.slug}`);

  // Monitor shows the selected (or hovered, while browsing) project.
  const shown = selected ?? (focused ? hoveredCard : undefined);
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
    anchorY: 2.4,
    enabled: !focused,
  });

  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.tile.clone(), roughness: 0.45 }), []);
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }), [screen]);
  const anim = useRef({ glow: 0, dim: 0 });
  useFrame((_, dt) => {
    const a = anim.current;
    const t = Math.min(dt, 0.05);
    let moving = easing.damp(a, "dim", dimmed ? 1 : 0, 0.3, t);
    moving = easing.damp(a, "glow", zone.hovered ? 1 : 0, 0.2, t) || moving;
    frame.color.copy(COLORS.tile).lerp(COLORS.bg, a.dim * 0.5);
    screenMat.color.setScalar(1 - a.dim * 0.35).lerp(COLORS.accent, a.glow * 0.04);
    if (moving) invalidate();
  });

  const busXs = projects.map((_, i) => cardPosition(i)[0]);

  return (
    <group>
      {/* Monitor */}
      <group ref={monitorRef} {...zone.handlers}>
        <RoundedBox args={[2.2, 0.12, 1.3]} radius={0.05} smoothness={smoothness} position={[P[0], 0.06, P[2] + MONITOR.z - 0.15]} material={frame} />
        <RoundedBox args={[0.5, 1.9, 0.22]} radius={0.08} smoothness={smoothness} position={[P[0], 1.0, P[2] + MONITOR.z - 0.35]} material={frame} />
        <group position={MONITOR_CENTER} rotation={[MONITOR.tilt, 0, 0]}>
          <RoundedBox args={[MONITOR.w, MONITOR.h, MONITOR.depth]} radius={0.16} smoothness={smoothness} material={frame} />
          <mesh position={[0, 0, MONITOR.depth / 2 + 0.002]} material={screenMat}>
            <planeGeometry args={[MONITOR.w - 0.36, MONITOR.h - 0.36]} />
          </mesh>
        </group>
      </group>

      {/* Card bus: stubs from each card into a shared line, then to the hub */}
      {projects.map((p, i) => {
        const [x, , z] = cardPosition(i);
        const lit = selected?.slug === p.slug || hovered === `project:${p.slug}`;
        return <Trace key={p.slug} points={[[x, z + PROJECT_CARD.d / 2 + 0.02], [x, BUS_Z]]} lit={lit} dimmed={dimmed} caps="none" />;
      })}
      <Trace points={[[busXs[0], BUS_Z], [busXs[busXs.length - 1], BUS_Z]]} lit={!!selected || zone.hovered} dimmed={dimmed} caps="none" />

      {/* Project cards */}
      {projects.map((p, i) => (
        <Tile
          key={p.slug}
          position={cardPosition(i)}
          size={[PROJECT_CARD.w, PROJECT_CARD.h, PROJECT_CARD.d]}
          radius={0.06}
          face={faces[i]}
          smoothness={smoothness}
          dimmed={dimmed}
          active={selected?.slug === p.slug}
          interactive={{
            id: `project:${p.slug}`,
            label: p.title,
            detail: p.subtitle,
            href: `/projects/${p.slug}`,
            anchorY: 0.5,
          }}
        />
      ))}
    </group>
  );
}
