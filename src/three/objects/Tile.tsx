"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { useAtlas } from "../useAtlas";
import { glowTexture } from "../faces";
import { useInteractive, type InteractiveOptions } from "../interactions";
import type { V3 } from "../layout";

export const COLORS = {
  tile: new THREE.Color("#fafaf8"),
  bg: new THREE.Color("#f4f4f2"),
  iconIdle: new THREE.Color("#9a9aa0"),
  ink: new THREE.Color("#2a2a2e"),
  muted: new THREE.Color("#8a8a90"),
  accent: new THREE.Color("#ff6a13"),
};

export type Decal = {
  key: string; // atlas key, e.g. "icon:brain" or "text:Planner"
  height: number;
  offset?: [number, number]; // x, z on the top face
  tone?: "icon" | "ink" | "muted";
  /** Turn orange when the tile is active / lit (icons default true, text false). */
  accent?: boolean;
};

export type TileProps = {
  position: V3;
  size: V3;
  radius?: number;
  color?: string;
  face?: THREE.Texture | null;
  decals?: Decal[];
  interactive?: InteractiveOptions;
  active?: boolean;
  /** On the signal path: orange icon + faint glow, no lift. */
  lit?: boolean;
  dimmed?: boolean;
  /** Extra lift target (e.g. dealt cards); animates from enterFrom on mount. */
  rise?: number;
  enterFrom?: number;
  rotationY?: number;
  smoothness?: number;
  children?: ReactNode;
};

const glowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

export function Tile({
  position,
  size,
  radius = 0.12,
  color,
  face,
  decals = [],
  interactive,
  active = false,
  lit = false,
  dimmed = false,
  rise = 0,
  enterFrom = 0,
  rotationY = 0,
  smoothness = 4,
  children,
}: TileProps) {
  const atlas = useAtlas();
  const invalidate = useThree((s) => s.invalidate);
  const reduced = useView((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const [w, h, d] = size;

  const base = useMemo(() => (color ? new THREE.Color(color) : COLORS.tile.clone()), [color]);
  const body = useMemo(
    () => new THREE.MeshStandardMaterial({ color: base, roughness: 0.55, metalness: 0 }),
    [base],
  );
  const faceMat = useMemo(
    () => (face ? new THREE.MeshStandardMaterial({ map: face, roughness: 0.6, metalness: 0 }) : null),
    [face],
  );
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: COLORS.accent,
        map: glowTexture(),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const decalParts = useMemo(
    () =>
      decals
        .map((dc) => {
          const g = atlas.geometryFor(dc.key, dc.height);
          if (!g) return null;
          const isIcon = dc.key.startsWith("icon:");
          const tone = dc.tone ?? (isIcon ? "icon" : "ink");
          const baseColor = tone === "icon" ? COLORS.iconIdle : tone === "muted" ? COLORS.muted : COLORS.ink;
          const mat = new THREE.MeshBasicMaterial({
            map: atlas.texture,
            color: baseColor.clone(),
            transparent: true,
            premultipliedAlpha: true,
            depthWrite: false,
            toneMapped: false,
          });
          return { ...dc, geometry: g.geometry, mat, baseColor, accent: dc.accent ?? isIcon };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [atlas, decals],
  );

  const { hovered, handlers } = useInteractive(group, interactive ?? { id: "", label: "", enabled: false });
  const anim = useRef({ lift: 0, scale: 1, tint: 0, glow: 0, dim: 0, rise: enterFrom, x: position[0], y: position[1], z: position[2], ry: rotationY });

  useFrame((_, dt) => {
    const a = anim.current;
    const g = group.current;
    if (!g) return;
    const t = Math.min(dt, 0.05);
    const tLift = reduced ? 0 : active ? 0.14 : hovered ? 0.08 : 0;
    const tScale = reduced ? 1 : active ? 1.04 : hovered ? 1.03 : 1;
    const tTint = active || lit ? 1 : hovered ? 0.45 : 0;
    const tGlow = active ? 0.85 : hovered ? 0.45 : lit ? 0.28 : 0;
    const tDim = dimmed ? 1 : 0;

    let moving = false;
    moving = easing.damp(a, "lift", tLift, 0.16, t) || moving;
    moving = easing.damp(a, "scale", tScale, 0.16, t) || moving;
    moving = easing.damp(a, "tint", tTint, 0.18, t) || moving;
    moving = easing.damp(a, "glow", tGlow, 0.22, t) || moving;
    moving = easing.damp(a, "dim", tDim, 0.3, t) || moving;
    moving = easing.damp(a, "rise", reduced ? 0 : rise, 0.35, t) || moving;
    const st = reduced ? 0.0001 : 0.32;
    moving = easing.damp(a, "x", position[0], st, t) || moving;
    moving = easing.damp(a, "y", position[1], st, t) || moving;
    moving = easing.damp(a, "z", position[2], st, t) || moving;
    moving = easing.damp(a, "ry", rotationY, st, t) || moving;

    g.position.set(a.x, a.y + a.lift + a.rise, a.z);
    g.rotation.y = a.ry;
    if (glow.current) {
      glow.current.position.set(a.x, 0.002, a.z);
      glow.current.rotation.y = a.ry;
    }
    g.scale.setScalar(a.scale);
    body.color.copy(base).lerp(COLORS.bg, a.dim * 0.5);
    if (faceMat) faceMat.color.setScalar(1).lerp(COLORS.bg, a.dim * 0.5);
    for (const p of decalParts) {
      p.mat.color.copy(p.baseColor);
      if (p.accent) p.mat.color.lerp(COLORS.accent, a.tint);
      p.mat.opacity = 1 - a.dim * 0.65;
    }
    glowMat.opacity = a.glow * (1 - a.dim);
    if (glow.current) glow.current.visible = glowMat.opacity > 0.01;

    if (moving) invalidate();
  });

  return (
    <>
      <mesh
        ref={glow}
        geometry={glowGeo}
        material={glowMat}
        position={[position[0], 0.002, position[2]]}
        rotation={[0, rotationY, 0]}
        scale={[w * 1.9, 1, d * 1.9]}
        visible={false}
        raycast={() => null}
      />
      <group ref={group} position={position} rotation={[0, rotationY, 0]}>
        <RoundedBox
          args={[w, h, d]}
          radius={Math.min(radius, h / 2 - 0.001)}
          smoothness={smoothness}
          position={[0, h / 2, 0]}
          material={body}
          {...handlers}
        />
        {faceMat && (
          <mesh position={[0, h + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={faceMat} raycast={() => null}>
            <planeGeometry args={[w - radius * 2, d - radius * 2]} />
          </mesh>
        )}
        {decalParts.map((p) => (
          <mesh
            key={p.key + (p.offset?.join(",") ?? "")}
            geometry={p.geometry}
            material={p.mat}
            position={[p.offset?.[0] ?? 0, h + 0.003, p.offset?.[1] ?? 0]}
            raycast={() => null}
            renderOrder={2}
          />
        ))}
        {children}
      </group>
    </>
  );
}
