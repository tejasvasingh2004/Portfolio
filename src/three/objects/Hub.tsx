"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { profile } from "@/data/profile";
import { COLORS } from "./Tile";
import { glowTexture } from "../faces";
import { useInteractive, useZoneState } from "../interactions";
import { HUB_SIZE } from "../layout";

/** Identity Hub — stacked slabs, glass cube, orange figure (reference image 1). Opens About. */
export function Hub({ quality }: { quality: "high" | "medium" | "low" }) {
  const invalidate = useThree((s) => s.invalidate);
  const reduced = useView((s) => s.reducedMotion);
  const { focused, dimmed } = useZoneState("about");
  const lifter = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  const { hovered, handlers } = useInteractive(lifter, {
    id: "zone:about",
    label: "About",
    detail: `${profile.name} · ${profile.title}`,
    href: "/about",
    anchorY: 2.9,
  });

  const slab = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.tile.clone(), roughness: 0.5 }), []);
  const rim = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.accent, toneMapped: false }), []);
  const orange = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.35, emissive: COLORS.accent, emissiveIntensity: 0.25 }), []);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.22, depthWrite: false }),
    [],
  );
  const edge = useMemo(() => new THREE.LineBasicMaterial({ color: "#d9d9d4", transparent: true, opacity: 0.9 }), []);
  const cubeEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 1.5, 1.5)), []);
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.accent, map: glowTexture(), transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false }),
    [],
  );

  const anim = useRef({ lift: 0, glow: 0.3, dim: 0, bob: 0 });

  useFrame((state, dt) => {
    const a = anim.current;
    const t = Math.min(dt, 0.05);
    const active = focused;
    let moving = easing.damp(a, "lift", reduced ? 0 : active ? 0.12 : hovered ? 0.08 : 0, 0.18, t);
    moving = easing.damp(a, "glow", active ? 0.9 : hovered ? 0.65 : 0.32, 0.25, t) || moving;
    moving = easing.damp(a, "dim", dimmed ? 1 : 0, 0.3, t) || moving;
    if (lifter.current) lifter.current.position.y = a.lift;
    slab.color.copy(COLORS.tile).lerp(COLORS.bg, a.dim * 0.5);
    glowMat.opacity = a.glow * (1 - a.dim * 0.8);
    rim.color.copy(COLORS.accent).lerp(COLORS.bg, a.dim * 0.6);
    // The figure breathes only while the hub is hovered or focused — no idle motion.
    if (figure.current && !reduced && (hovered || active)) {
      a.bob += t;
      figure.current.position.y = Math.sin(a.bob * 2.2) * 0.035;
      moving = true;
    }
    if (moving) invalidate();
  });

  const S = HUB_SIZE;
  const layers: [number, number][] = [
    [S, 0.32],
    [S * 0.84, 0.28],
    [S * 0.68, 0.24],
  ];
  let y = 0;
  const seg = quality === "low" ? 2 : 4;

  return (
    <group>
      <mesh ref={glow} position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[S * 1.9, S * 1.9, 1]} material={glowMat} raycast={() => null}>
        <planeGeometry />
      </mesh>
      <group ref={lifter} {...handlers}>
        {layers.map(([size, h], i) => {
          const at = y + h / 2;
          y += h;
          return (
            <group key={i}>
              <RoundedBox args={[size, h, size]} radius={0.1} smoothness={seg} position={[0, at, 0]} material={slab} />
              {i === 0 && (
                // Orange underglow rim (reference image 2, bottom-centre slab)
                <mesh position={[0, 0.045, 0]} material={rim} raycast={() => null}>
                  <boxGeometry args={[size - 0.06, 0.035, size - 0.06]} />
                </mesh>
              )}
            </group>
          );
        })}
        {/* Glass cube with the orange figure — "me" */}
        <group position={[0, y + 0.75, 0]}>
          <mesh material={glass}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
          </mesh>
          <lineSegments geometry={cubeEdges} material={edge} raycast={() => null} />
          <group ref={figure}>
            <mesh position={[0, -0.69, 0]} material={orange}>
              <cylinderGeometry args={[0.36, 0.42, 0.08, 32]} />
            </mesh>
            <mesh position={[0, -0.32, 0]} material={orange}>
              <capsuleGeometry args={[0.2, 0.32, 8, 20]} />
            </mesh>
            <mesh position={[0, 0.16, 0]} material={orange}>
              <sphereGeometry args={[0.17, 28, 20]} />
            </mesh>
          </group>
          <pointLight color="#ff7a2a" intensity={quality === "low" ? 0 : 1.6} distance={3} decay={2} position={[0, -0.3, 0]} />
        </group>
      </group>
    </group>
  );
}
