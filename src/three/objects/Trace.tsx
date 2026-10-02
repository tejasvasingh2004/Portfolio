"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { COLORS } from "./Tile";
import { glowTexture } from "../faces";

const TRACE_COLOR = new THREE.Color("#f3f3f0");

/** Polyline on the board → smooth path with rounded corners (the reference's trace language). */
export function roundedPath(points: [number, number][], y: number, cornerRadius = 0.32) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const v = points.map(([x, z]) => new THREE.Vector3(x, y, z));
  if (v.length < 2) return path;
  let cursor = v[0].clone();
  for (let i = 1; i < v.length; i++) {
    const p = v[i];
    const next = v[i + 1];
    if (!next) {
      path.add(new THREE.LineCurve3(cursor, p));
      break;
    }
    const inDir = p.clone().sub(v[i - 1]);
    const outDir = next.clone().sub(p);
    const r = Math.min(cornerRadius, inDir.length() / 2, outDir.length() / 2);
    const a = p.clone().sub(inDir.normalize().multiplyScalar(r));
    const b = p.clone().add(outDir.normalize().multiplyScalar(r));
    if (a.distanceTo(cursor) > 1e-4) path.add(new THREE.LineCurve3(cursor, a));
    path.add(new THREE.QuadraticBezierCurve3(a, p, b));
    cursor = b;
  }
  return path;
}

type Props = {
  points: [number, number][];
  lit?: boolean;
  /** Increment to send a single pulse along the trace. */
  pulse?: number;
  dimmed?: boolean;
  radius?: number;
  /** End junction dots. */
  caps?: "both" | "end" | "none";
  reverse?: boolean;
  dashed?: boolean;
  /** Seconds to wait before the pulse departs (for sequenced signals). */
  delay?: number;
  /** Height of the tube above its parent's floor. */
  base?: number;
};

const capGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.09, 24);
const dotGeo = new THREE.SphereGeometry(0.06, 16, 12);
const pulseGeo = new THREE.SphereGeometry(0.085, 16, 12);
const pulseGlowGeo = new THREE.PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2);

/**
 * A raised white "light pipe". Lit, its emissive core turns orange above 1.0 so the
 * bloom pass makes it glow (reference image 2); pulses are bright HDR beads.
 */
export function Trace({
  points,
  lit = false,
  pulse = 0,
  dimmed = false,
  radius = 0.06,
  caps = "end",
  reverse = false,
  dashed = false,
  delay = 0,
  base = 0,
}: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const reduced = useView((s) => s.reducedMotion);
  const y = base + radius * 0.7;

  const { geometry, path, length } = useMemo(() => {
    const pts = reverse ? [...points].reverse() : points;
    const path = roundedPath(pts, y);
    const length = path.getLength();
    const geometry = new THREE.TubeGeometry(path, Math.max(24, Math.round(length * 14)), radius, 10, false);
    return { geometry, path, length };
  }, [points, y, radius, reverse]);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: TRACE_COLOR.clone(),
        roughness: 0.3,
        metalness: 0,
        emissive: COLORS.accent,
        emissiveIntensity: 0,
        transparent: dashed,
        opacity: dashed ? 0.75 : 1,
      }),
    [dashed],
  );
  const capMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fbfbf9", roughness: 0.4 }), []);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.iconIdle.clone(), toneMapped: false }), []);
  const pulseMat = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.accentHdr.clone().multiplyScalar(1.6), toneMapped: false }), []);
  const pulseGlowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.accent, map: glowTexture(), transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false }),
    [],
  );

  const pulseRef = useRef<THREE.Group>(null);
  const anim = useRef({ lit: 0, dim: 0, t: -1, wait: 0 });

  useEffect(() => {
    if (pulse > 0 && !reduced) {
      anim.current.t = 0;
      anim.current.wait = delay;
      invalidate();
    }
  }, [pulse, reduced, invalidate, delay]);

  useFrame((_, dt) => {
    const a = anim.current;
    const t = Math.min(dt, 0.05);
    let moving = easing.damp(a, "lit", lit ? 1 : 0, 0.25, t);
    moving = easing.damp(a, "dim", dimmed ? 1 : 0, 0.3, t) || moving;
    mat.color.copy(TRACE_COLOR).lerp(COLORS.accent, a.lit * 0.7).lerp(COLORS.bg, a.dim * 0.4);
    mat.emissiveIntensity = a.lit * 8.5 * (1 - a.dim);
    dotMat.color.copy(COLORS.iconIdle).lerp(COLORS.accentHdr, a.lit);

    const g = pulseRef.current;
    if (g) {
      if (a.t >= 0 && a.wait > 0) {
        a.wait -= t;
        g.visible = false;
        moving = true;
      } else if (a.t >= 0) {
        a.t += (t * 6) / Math.max(length, 1);
        if (a.t >= 1) {
          a.t = -1;
          g.visible = false;
        } else {
          g.visible = true;
          path.getPointAt(a.t, g.position);
          g.position.y += radius * 0.6;
          const fade = Math.min(1, a.t * 6, (1 - a.t) * 6);
          pulseGlowMat.opacity = 0.6 * fade;
          g.scale.setScalar(0.6 + 0.4 * fade);
          moving = true;
        }
      } else g.visible = false;
    }
    if (moving) invalidate();
  });

  const start = points[reverse ? points.length - 1 : 0];
  const end = points[reverse ? 0 : points.length - 1];

  return (
    <group>
      <mesh geometry={geometry} material={mat} scale={[1, 0.75, 1]} raycast={() => null} />
      {(caps === "both" ? [start, end] : caps === "end" ? [end] : []).map(([x, z], i) => (
        <group key={i} position={[x, base + 0.045, z]}>
          <mesh geometry={capGeo} material={capMat} raycast={() => null} />
          <mesh geometry={dotGeo} material={dotMat} position={[0, 0.045, 0]} scale={[1, 0.45, 1]} raycast={() => null} />
        </group>
      ))}
      <group ref={pulseRef} visible={false}>
        <mesh geometry={pulseGeo} material={pulseMat} raycast={() => null} />
        <mesh geometry={pulseGlowGeo} material={pulseGlowMat} position={[0, -y - radius * 0.6 + base + 0.006, 0]} raycast={() => null} />
      </group>
    </group>
  );
}
