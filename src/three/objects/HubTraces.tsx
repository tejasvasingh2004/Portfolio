"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { Trace } from "./Trace";
import { COLORS } from "./Tile";
import { modules, RING_RADIUS, spoke, type ModuleId } from "../layout";

const ids = Object.keys(modules) as ModuleId[];

/** Circular signal bus around the hub with a spoke to every module, plus an idle "heartbeat". */
export function HubTraces() {
  const view = useView((s) => s.view);
  const hovered = useView((s) => s.hovered);
  const reduced = useView((s) => s.reducedMotion);
  const invalidate = useThree((s) => s.invalidate);
  const [pulses, setPulses] = useState<Record<string, number>>({});

  const hoveredModule = ids.find(
    (z) =>
      hovered?.startsWith(`zone:${z}`) ||
      (z === "projects" && hovered?.startsWith("project:")) ||
      (z === "ai" && (hovered?.startsWith("node:") || hovered?.startsWith("system:"))) ||
      (z === "skills" && hovered?.startsWith("skill:")) ||
      (z === "experience" && hovered?.startsWith("role:")) ||
      (z === "contact" && hovered?.startsWith("link:")),
  );

  // Hovering a module sends one pulse from the hub to it.
  useEffect(() => {
    if (!hoveredModule) return;
    const id = requestAnimationFrame(() => setPulses((p) => ({ ...p, [hoveredModule]: (p[hoveredModule] ?? 0) + 1 })));
    return () => cancelAnimationFrame(id);
  }, [hoveredModule]);

  // Heartbeat: a pulse to a random module every ~5 s while idle on the overview.
  useEffect(() => {
    if (reduced || view.zone !== "home") return;
    let beats = 0;
    const timer = window.setInterval(() => {
      if (document.hidden || beats++ > 14) return;
      const z = ids[Math.floor(Math.random() * ids.length)];
      setPulses((p) => ({ ...p, [z]: (p[z] ?? 0) + 1 }));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [reduced, view.zone]);

  // The ring itself warms up whenever any module is engaged.
  const ringLit = view.zone !== "home" || !!hoveredModule;
  const ringGeo = useMemo(() => new THREE.TorusGeometry(RING_RADIUS, 0.06, 12, 160).rotateX(Math.PI / 2), []);
  const ringMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f3f3f0", roughness: 0.3, emissive: COLORS.accent, emissiveIntensity: 0 }),
    [],
  );
  const a = useRef({ lit: 0 });
  useFrame((_, dt) => {
    if (easing.damp(a.current, "lit", ringLit ? 1 : 0, 0.3, Math.min(dt, 0.05))) invalidate();
    ringMat.emissiveIntensity = a.current.lit * 3.5;
    ringMat.color.set("#f3f3f0").lerp(COLORS.accent, a.current.lit * 0.35);
  });

  return (
    <group>
      <mesh geometry={ringGeo} material={ringMat} position-y={0.045} scale={[1, 0.75, 1]} raycast={() => null} />
      {ids.map((z) => (
        <Trace
          key={z}
          points={spoke(z)}
          lit={view.zone === z || hoveredModule === z}
          dimmed={view.zone !== "home" && view.zone !== z && view.zone !== "about"}
          pulse={pulses[z] ?? 0}
          caps="both"
        />
      ))}
    </group>
  );
}
