import * as THREE from "three";
import type { Zone } from "@/lib/view";

/**
 * Radial "Systems Board": the identity hub sits at the origin and every module sits on a
 * ring around it, facing outward. Orbit 360° to see them all; clicking one swings the
 * camera round to stand in front of it.
 *
 * Module contents are authored in LOCAL coordinates: origin at the module centre,
 * +z = outward (towards the viewer standing in front of it), -z = towards the hub.
 */

export type V3 = [number, number, number];
export type ZoneId = Exclude<Zone, "home">;
export type ModuleId = Exclude<ZoneId, "about">;

export const HUB_SIZE = 3.0;
/** Circular signal bus around the hub. */
export const RING_RADIUS = 2.75;

const deg = (d: number) => (d * Math.PI) / 180;

/** angle: azimuth from +z towards +x. radius: distance of the module centre from the hub. back: local z of its rear edge. */
export const modules: Record<ModuleId, { angle: number; radius: number; back: number }> = {
  ai: { angle: deg(38), radius: 8.0, back: -3.15 },
  projects: { angle: deg(-38), radius: 7.6, back: -1.75 },
  experience: { angle: deg(110), radius: 6.9, back: -1.35 },
  skills: { angle: deg(-110), radius: 8.1, back: -2.85 },
  contact: { angle: deg(180), radius: 6.6, back: -1.4 },
};

export function moduleFrame(id: ModuleId): { position: V3; rotationY: number } {
  const m = modules[id];
  return { position: [Math.sin(m.angle) * m.radius, 0, Math.cos(m.angle) * m.radius], rotationY: m.angle };
}

const _v = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
/** Local module coordinates → world. */
export function toWorld(id: ModuleId, local: V3): V3 {
  const { position, rotationY } = moduleFrame(id);
  _v.set(...local).applyAxisAngle(_up, rotationY);
  return [_v.x + position[0], _v.y + position[1], _v.z + position[2]];
}

/** Spoke from the hub ring to a module's rear edge, as [x, z] world points. */
export function spoke(id: ModuleId): [number, number][] {
  const m = modules[id];
  const a: [number, number] = [Math.sin(m.angle) * RING_RADIUS, Math.cos(m.angle) * RING_RADIUS];
  const end = toWorld(id, [0, 0, m.back - 0.05]);
  return [a, [end[0], end[2]]];
}

// ── Module internals (local units) ─────────────────────────────────────
export const PROJECT_CARD = { w: 1.5, h: 0.22, d: 1.02, gap: 0.18, z: 1.55 };
export const MONITOR = { w: 5.6, h: 3.4, depth: 0.24, tilt: -0.12, z: -0.95, y: 2.45 };
export const AI_PLATE = { w: 7.6, d: 6.3, h: 0.22 };
export const AI_CELL = 1.12;
export const AI_NODE = { w: 0.86, h: 0.3, d: 0.86 };
export const AI_GRAPH_OFFSET: V3 = [0, 0, -0.45];
export const AI_SWITCH_Z = 2.55;
export const EXP_CARD = { w: 2.2, h: 0.18, d: 1.45 };
export const CONTACT_CARD = { w: 3.2, h: 0.26, d: 2.1 };

// ── Camera ─────────────────────────────────────────────────────────────
export type CameraPose = { position: V3; target: V3 };

/** Overview: a close three-quarter view that invites dragging round to see the rest. */
export const homePose: CameraPose = { position: [0, 21, 25.5], target: [0, 0.4, 0.8] };

/** Zone poses in LOCAL module space: camera stands outside the module, looking in. */
export const localZonePoses: Record<ModuleId, CameraPose> = {
  // Fairly steep angles so tile tops (and their labels) face the viewer.
  projects: { position: [0.6, 7.6, 10.6], target: [0, 1.2, 0.1] },
  ai: { position: [0.4, 11.6, 7.4], target: [0, 0, 0.4] },
  skills: { position: [0.4, 10.4, 6.6], target: [0, 0.2, 0.5] },
  experience: { position: [0.4, 8.4, 7.2], target: [0, 0.2, 0.3] },
  contact: { position: [0.4, 8.0, 7.0], target: [0, 0.3, 0.9] },
};

export const aboutPose: CameraPose = { position: [4.2, 6.2, 8.6], target: [0, 1.2, 0] };
