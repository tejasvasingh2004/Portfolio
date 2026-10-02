"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "./Tile";

/**
 * Quiet, monochrome props in the reference's lifestyle language (white plant, glowing lamp,
 * glass block). Purely decorative: not interactive, not focusable.
 */

const at = (angleDeg: number, radius: number): [number, number, number] => {
  const a = (angleDeg * Math.PI) / 180;
  return [Math.sin(a) * radius, 0, Math.cos(a) * radius];
};

function Plant({ position, scale = 1, seed = 0 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const pot = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fbfbf9", roughness: 0.6 }), []);
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4f4f1", roughness: 0.45, side: THREE.DoubleSide }), []);
  const leaves = useMemo(() => {
    const out: { rot: [number, number, number]; pos: [number, number, number]; s: [number, number, number] }[] = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const yaw = (i / n) * Math.PI * 2 + seed;
      const tilt = 0.35 + ((i * 37 + seed * 11) % 7) * 0.07;
      const len = 0.55 + ((i * 53) % 5) * 0.08;
      out.push({
        rot: [tilt, yaw, 0],
        pos: [Math.sin(yaw) * 0.12, 0.95 + len * 0.45, Math.cos(yaw) * 0.12],
        s: [0.16, len, 0.035],
      });
    }
    return out;
  }, [seed]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.36, 0]} material={pot} castShadow>
        <cylinderGeometry args={[0.44, 0.34, 0.72, 40]} />
      </mesh>
      <mesh position={[0, 0.73, 0]} material={pot}>
        <torusGeometry args={[0.42, 0.035, 10, 40]} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} rotation={l.rot} position={[0, 0.72, 0]}>
          <mesh position={[0, l.s[1] * 0.5, 0]} scale={l.s} material={leaf}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fbfbf9", roughness: 0.5 }), []);
  const bulb = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.accentHdr.clone().multiplyScalar(0.8), toneMapped: false }), []);
  return (
    <group position={position}>
      <RoundedBox args={[1.1, 0.12, 1.1]} radius={0.05} smoothness={3} position={[0, 0.06, 0]} material={body} />
      <mesh position={[0, 0.45, 0]} material={body}>
        <cylinderGeometry args={[0.035, 0.035, 0.7, 12]} />
      </mesh>
      <mesh position={[0, 0.95, 0]} material={bulb}>
        <sphereGeometry args={[0.24, 32, 20]} />
      </mesh>
      <pointLight color="#ff8a3d" intensity={2.2} distance={4} decay={2} position={[0, 0.95, 0]} />
    </group>
  );
}

function GlassBlock({ position }: { position: [number, number, number] }) {
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.25, depthWrite: false }),
    [],
  );
  const edge = useMemo(() => new THREE.LineBasicMaterial({ color: "#d9d9d4" }), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.8, 0.8, 0.8)), []);
  const core = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.accentHdr.clone().multiplyScalar(0.6), toneMapped: false }), []);
  return (
    <group position={[position[0], 0.4, position[2]]} rotation-y={0.5}>
      <mesh material={glass}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
      </mesh>
      <lineSegments geometry={edges} material={edge} />
      <mesh material={core} position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.06, 24]} />
      </mesh>
    </group>
  );
}

export function Decor() {
  return (
    <group>
      <Plant position={at(76, 11.2)} scale={1.25} seed={0.4} />
      <Plant position={at(-148, 11)} scale={1.05} seed={1.7} />
      <Lamp position={at(-74, 11.6)} />
      <GlassBlock position={at(146, 10.6)} />
    </group>
  );
}
