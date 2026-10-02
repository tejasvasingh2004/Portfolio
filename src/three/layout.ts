import type { Zone } from "@/lib/view";

/** World layout of the Systems Board. Positions only — no content lives here. */

export type V3 = [number, number, number];
export type ZoneId = Exclude<Zone, "home">;

export const BOARD = { width: 26, depth: 19 };

/** Hub sits at the origin; its base slab is HUB_SIZE wide. */
export const HUB_SIZE = 3.0;

export const zonePos: Record<ZoneId, V3> = {
  about: [0, 0, 0],
  projects: [-6.4, 0, -4.4],
  ai: [7.0, 0, -3.9],
  skills: [-8.8, 0, 3.2],
  experience: [-1.9, 0, 6.8],
  contact: [5.6, 0, 5.9],
};

// ── Projects ───────────────────────────────────────────────────────────
export const PROJECT_CARD = { w: 1.55, h: 0.16, d: 1.05, gap: 0.2, z: 1.9 };
export const MONITOR = { w: 6.4, h: 3.9, depth: 0.2, tilt: -0.16, z: -0.85, y: 2.75 };

// ── AI Lab ─────────────────────────────────────────────────────────────
export const AI_PLATE = { w: 8.8, d: 7.4, h: 0.18 };
export const AI_CELL = 1.3;
export const AI_NODE = { w: 0.98, h: 0.26, d: 0.98 };
/** Graph area centre relative to the plate (the front strip holds the switches). */
export const AI_GRAPH_OFFSET: V3 = [0, 0, -0.55];
export const AI_SWITCH_Z = 3.0;

// ── Skills ─────────────────────────────────────────────────────────────
export const KEY = { w: 0.6, h: 0.2, d: 0.6, pitch: 0.7 };

// ── Experience ─────────────────────────────────────────────────────────
export const EXP_CARD = { w: 2.3, h: 0.14, d: 1.5 };

// ── Contact ────────────────────────────────────────────────────────────
export const CONTACT_CARD = { w: 3.4, h: 0.22, d: 2.2 };

/**
 * Trace routes from the hub to each zone, as [x, z] waypoints on the board.
 * Corners are rounded when the tube is built.
 */
export const hubTraces: Record<Exclude<ZoneId, "about">, [number, number][]> = {
  projects: [
    [-1.5, -0.55],
    [-3.2, -0.55],
    [-3.2, -1.43],
    [-6.4, -1.43],
  ],
  ai: [
    [1.5, -0.55],
    [2.5, -0.55],
    [2.5, -3.9],
    [2.6, -3.9],
  ],
  skills: [
    [-1.5, 0.55],
    [-3.7, 0.55],
    [-3.7, 3.2],
    [-4.62, 3.2],
  ],
  experience: [
    [-0.45, 1.5],
    [-0.45, 3.6],
    [-1.9, 3.6],
    [-1.9, 5.85],
  ],
  contact: [
    [0.45, 1.5],
    [0.45, 3.6],
    [5.6, 3.6],
    [5.6, 4.7],
  ],
};

/** Camera framing per zone: position offset from the zone centre and look-at offset. */
export type CameraPose = { position: V3; target: V3; azimuthRange?: number; polarRange?: number };

export const homePose: CameraPose = { position: [21.5, 27.5, 31.5], target: [0.6, 0, 0.4], azimuthRange: 0.6, polarRange: 0.32 };

export const zonePoses: Record<ZoneId, CameraPose> = {
  about: { position: [5.4, 7.8, 11.2], target: [0, 1.0, 0] },
  projects: { position: [-3.6, 8.6, 10.6], target: [-6.4, 1.7, -3.3] },
  ai: { position: [8.6, 11.8, 6.4], target: [7.0, 0, -3.6] },
  skills: { position: [-5.6, 10.4, 12.6], target: [-8.6, 0.2, 3.2] },
  experience: { position: [0.1, 10.8, 17.4], target: [-1.9, 0.3, 6.8] },
  contact: { position: [8.8, 9.4, 15.8], target: [5.6, 0.4, 6.6] },
};
