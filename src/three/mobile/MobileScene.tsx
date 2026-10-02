"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { profile } from "@/data/profile";
import type { IconName } from "@/lib/icons";
import type { Zone } from "@/lib/view";
import { Tile, COLORS } from "../objects/Tile";
import { Trace } from "../objects/Trace";
import { glowTexture } from "../faces";
import { useInteractive } from "../interactions";

/**
 * Phone scene (spec §14): not a shrunk desktop — a "home screen" of physical keys
 * wired to the identity hub. Tap a key → it presses → the sheet rises.
 */
const KEYS: { id: string; zone: Zone | "resume"; label: string; icon: IconName; href: string }[] = [
  { id: "projects", zone: "projects", label: "Projects", icon: "folder", href: "/projects" },
  { id: "ai", zone: "ai", label: "AI Lab", icon: "network", href: "/ai" },
  { id: "experience", zone: "experience", label: "Experience", icon: "briefcase", href: "/experience" },
  { id: "skills", zone: "skills", label: "Skills", icon: "keyboard", href: "/skills" },
  { id: "contact", zone: "contact", label: "Contact", icon: "mail", href: "/contact" },
  { id: "resume", zone: "resume", label: "Résumé", icon: "file-down", href: profile.resume },
];

const PITCH_X = 1.5;
const PITCH_Z = 1.5;
const KEY = 1.24;
const HUB_Z = -2.2;

function keyPos(i: number): [number, number, number] {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return [(col - 1) * PITCH_X, 0, 0.4 + row * PITCH_Z];
}

function MobileHub() {
  const ref = useRef<THREE.Group>(null);
  const zone = useView((s) => s.view.zone);
  const { hovered, handlers } = useInteractive(ref, { id: "zone:about", label: "About", detail: profile.title, href: "/about", anchorY: 1.6 });
  const orange = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.35, emissive: COLORS.accent, emissiveIntensity: 0.25 }), []);
  const slab = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.tile.clone(), roughness: 0.5 }), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#fff", transparent: true, opacity: 0.3, roughness: 0.1, depthWrite: false }), []);
  const glow = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.accent, map: glowTexture(), transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false }),
    [],
  );
  const invalidate = useThree((s) => s.invalidate);
  const a = useRef({ lift: 0 });
  useFrame((_, dt) => {
    const target = zone === "about" ? 0.12 : hovered ? 0.06 : 0;
    if (easing.damp(a.current, "lift", target, 0.16, Math.min(dt, 0.05))) invalidate();
    if (ref.current) ref.current.position.y = a.current.lift;
  });
  return (
    <group position={[0, 0, HUB_Z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.002} scale={4.2} material={glow} raycast={() => null}>
        <planeGeometry />
      </mesh>
      <group ref={ref} {...handlers}>
        <RoundedBox args={[2.2, 0.28, 2.2]} radius={0.09} smoothness={2} position-y={0.14} material={slab} />
        <RoundedBox args={[1.8, 0.24, 1.8]} radius={0.08} smoothness={2} position-y={0.4} material={slab} />
        <group position-y={1.07}>
          <mesh material={glass}>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
          </mesh>
          <mesh position-y={-0.24} material={orange}>
            <capsuleGeometry args={[0.15, 0.24, 6, 16]} />
          </mesh>
          <mesh position-y={0.12} material={orange}>
            <sphereGeometry args={[0.13, 20, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function MobileScene({ smoothness }: { smoothness: number }) {
  const zone = useView((s) => s.view.zone);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const cam = useRef({ x: 0, y: 17.5, z: 11.5, tx: 0, tz: -0.3, off: 0, init: false });
  const reduced = useView((s) => s.reducedMotion);

  useFrame((_, dt) => {
    const c = cam.current;
    const t = Math.min(dt, 0.05);
    const i = KEYS.findIndex((k) => k.zone === zone);
    const focus = i >= 0 ? keyPos(i) : zone === "about" ? [0, 0, HUB_Z] : null;
    const tx = focus ? focus[0] * 0.5 : 0;
    const tz = focus ? focus[2] * 0.4 - 0.2 : -0.3;
    // Home: push the scene below the hero text. Panel open: lift it above the sheet.
    const off = zone === "home" ? -size.height * 0.2 : size.height * 0.2;
    const st = reduced || !c.init ? 0.0001 : 0.4;
    c.init = true;
    let moving = easing.damp(c, "tx", tx, st, t);
    moving = easing.damp(c, "tz", tz, st, t) || moving;
    moving = easing.damp(c, "off", off, st, t) || moving;
    camera.fov = 34;
    camera.position.set(c.tx, c.y, c.tz + c.z);
    camera.lookAt(c.tx, 0, c.tz);
    camera.setViewOffset(size.width, size.height, 0, c.off, size.width, size.height);
    camera.updateProjectionMatrix();
    if (moving) invalidate();
  });

  return (
    <group>
      <MobileHub />
      {KEYS.map((k, i) => {
        const [x, , z] = keyPos(i);
        return (
          <Trace
            key={`t-${k.id}`}
            points={[
              [x * 0.25, HUB_Z + 1.1],
              [x * 0.25, -0.75],
              [x, -0.75],
              [x, z - KEY / 2],
            ].filter((p, j, arr) => j === 0 || p[0] !== arr[j - 1][0] || p[1] !== arr[j - 1][1]) as [number, number][]}
            lit={zone === k.zone}
            caps="none"
            radius={0.035}
          />
        );
      })}
      {KEYS.map((k, i) => (
        <Tile
          key={k.id}
          position={keyPos(i)}
          size={[KEY, 0.3, KEY]}
          radius={0.14}
          smoothness={smoothness}
          active={zone === k.zone}
          decals={[
            { key: `icon:${k.icon}`, height: 0.5, offset: [0, -0.14] },
            { key: `text:${k.label}`, height: 0.17, offset: [0, 0.36], tone: "ink" },
          ]}
          interactive={{
            id: `key:${k.id}`,
            label: k.label,
            href: k.href,
            anchorY: 0.6,
            onActivate: () => {
              try {
                navigator.vibrate?.(8);
              } catch {}
              if (k.href.endsWith(".pdf")) window.open(k.href, "_blank", "noopener,noreferrer");
              else useView.getState().navigate(k.href);
            },
          }}
        />
      ))}
    </group>
  );
}
