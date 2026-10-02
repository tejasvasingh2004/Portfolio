"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { clusters, skills, type ClusterId } from "@/data/skills";
import { useView } from "@/store/viewStore";
import { usageCount } from "@/lib/usage";
import { Tile, COLORS } from "./Tile";
import { useInteractive, useZoneState } from "../interactions";
import { ModuleFrame } from "./ModuleFrame";
import type { V3 } from "../layout";
import { useAtlas } from "../useAtlas";

const S: V3 = [0, 0, 0]; // module-local origin
const KEY = { w: 0.84, h: 0.18, d: 0.48, px: 0.92, pz: 0.56 };
const PLATE_PAD = 0.16;
const LABEL_STRIP = 0.42;
const GAP = 0.3;

/** Column layout: the right column (nearest the hub) leads with AI. */
const COLUMNS: ClusterId[][] = [
  ["languages", "data", "frontend"],
  ["ai", "backend", "tools"],
];

type PlateLayout = { id: ClusterId; x: number; z: number; w: number; d: number; cols: number };

function computeLayout() {
  const plates: PlateLayout[] = [];
  const dims = (id: ClusterId) => {
    const count = skills.filter((s) => s.cluster === id).length;
    const cols = count > 6 ? 4 : 3;
    const rows = Math.ceil(count / cols);
    return { cols, w: cols * KEY.px + PLATE_PAD * 2 - (KEY.px - KEY.w), d: rows * KEY.pz + LABEL_STRIP + PLATE_PAD - (KEY.pz - KEY.d) };
  };
  const colW = COLUMNS.map((col) => Math.max(...col.map((id) => dims(id).w)));
  const colD = COLUMNS.map((col) => col.reduce((sum, id) => sum + dims(id).d, 0) + GAP * (col.length - 1));
  const totalW = colW[0] + colW[1] + GAP;
  const totalD = Math.max(...colD);
  COLUMNS.forEach((col, ci) => {
    const left = S[0] - totalW / 2 + (ci === 0 ? 0 : colW[0] + GAP);
    let z = S[2] - totalD / 2;
    col.forEach((id) => {
      const d = dims(id);
      plates.push({ id, x: left + d.w / 2 + (ci === 0 ? colW[0] - d.w : 0), z: z + d.d / 2, w: d.w, d: d.d, cols: d.cols });
      z += d.d + GAP;
    });
  });
  return { plates, bounds: { minX: S[0] - totalW / 2, maxX: S[0] + totalW / 2, minZ: S[2] - totalD / 2, maxZ: S[2] + totalD / 2 } };
}

export const skillsLayout = computeLayout();

export function SkillsZone({ smoothness }: { smoothness: number }) {
  useAtlas();
  const { focused, dimmed } = useZoneState("skills");
  const hovered = useView((s) => s.hovered);
  const skillFocus = useView((s) => s.skillFocus);
  const invalidate = useThree((s) => s.invalidate);

  const zoneRef = useRef<THREE.Group>(null);
  const zone = useInteractive(zoneRef, {
    id: "zone:skills",
    label: "Skills",
    detail: `${skills.length} technologies in ${clusters.length} clusters`,
    href: "/skills",
    anchorY: 0.8,
    enabled: !focused,
  });

  const plateMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f6f6f3", roughness: 0.6 }), []);
  const anim = useRef({ dim: 0 });
  useFrame((_, dt) => {
    if (easing.damp(anim.current, "dim", dimmed ? 1 : 0, 0.3, Math.min(dt, 0.05))) invalidate();
    plateMat.color.set("#f6f6f3").lerp(COLORS.bg, anim.current.dim * 0.5);
  });

  return (
    <ModuleFrame id="skills">
      <group ref={zoneRef} {...zone.handlers}>
        {skillsLayout.plates.map((p) => (
          <RoundedBox
            key={p.id}
            args={[p.w, 0.12, p.d]}
            radius={0.06}
            smoothness={smoothness}
            position={[p.x, 0.06, p.z]}
            material={plateMat}
          />
        ))}
      </group>

      {skillsLayout.plates.map((p) => {
        const label = clusters.find((c) => c.id === p.id)!.label.toUpperCase();
        const items = skills.filter((s) => s.cluster === p.id);
        const x0 = p.x - p.w / 2 + PLATE_PAD + KEY.w / 2;
        const z0 = p.z - p.d / 2 + LABEL_STRIP + KEY.d / 2;
        return (
          <group key={p.id}>
            <ClusterLabel text={label} x={p.x - p.w / 2 + PLATE_PAD} z={p.z - p.d / 2 + LABEL_STRIP / 2 + 0.02} dimmed={dimmed} />
            {items.map((s, i) => {
              const col = i % p.cols;
              const row = Math.floor(i / p.cols);
              const isOn = hovered === `skill:${s.id}` || skillFocus === s.id;
              const used = usageCount(s.id);
              return (
                <Tile
                  key={s.id}
                  position={[x0 + col * KEY.px, 0.12, z0 + row * KEY.pz]}
                  size={[KEY.w, KEY.h, KEY.d]}
                  radius={0.07}
                  smoothness={smoothness}
                  dimmed={dimmed}
                  active={focused && skillFocus === s.id}
                  lit={isOn && !focused}
                  decals={[{ key: `text:${s.label}`, height: 0.135, tone: "ink" }]}
                  interactive={{
                    id: `skill:${s.id}`,
                    label: s.label,
                    detail: used ? `Used in ${used} ${used === 1 ? "project/role" : "projects/roles"} — click to see where` : "Part of my toolkit",
                    href: skillFocus === s.id ? "/skills" : `/skills?skill=${s.id}`,
                    anchorY: 0.35,
                    enabled: focused,
                  }}
                />
              );
            })}
          </group>
        );
      })}
    </ModuleFrame>
  );
}

function ClusterLabel({ text, x, z, dimmed }: { text: string; x: number; z: number; dimmed: boolean }) {
  const atlas = useAtlas();
  const g = atlas.geometryFor(`text:${text}`, 0.17);
  if (!g) return null;
  return (
    <mesh geometry={g.geometry} position={[x + g.width / 2, 0.123, z]} raycast={() => null}>
      <meshBasicMaterial
        map={atlas.texture}
        color={COLORS.muted}
        transparent
        premultipliedAlpha
        depthWrite={false}
        toneMapped={false}
        opacity={dimmed ? 0.4 : 1}
      />
    </mesh>
  );
}
