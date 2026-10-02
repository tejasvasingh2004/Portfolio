import type { AiEdge, AiSystem } from "@/data/aiSystems";

export type Pt = [number, number];

/**
 * Orthogonal ("Manhattan") routing between two grid cells, in cell units.
 * Shared by the SVG diagram and the 3D AI Lab so both draw identical paths.
 * hw/hh = node half-extents in cell units.
 */
export function routeEdge(system: AiSystem, edge: AiEdge, hw: number, hh: number): Pt[] {
  const A = system.nodes.find((n) => n.id === edge.from)!.at;
  const B = system.nodes.find((n) => n.id === edge.to)!.at;
  const [ax, ay] = A;
  const [bx, by] = B;
  const dx = Math.sign(bx - ax) || 1;
  const dy = Math.sign(by - ay) || 1;

  if (edge.route === "over" || edge.route === "under") {
    const s = edge.route === "over" ? -1 : 1;
    const lane = edge.lane ?? ay + s * 0.5;
    return [
      [ax + 0.2, ay + s * hh],
      [ax + 0.2, lane],
      [bx - 0.2, lane],
      [bx - 0.2, by + s * hh],
    ];
  }

  if (edge.loop) {
    if (ay === by) {
      // Return arc above the row, between the two nodes.
      const y = ay - hh - 0.2;
      return [
        [ax - 0.12, ay - hh],
        [ax - 0.12, y],
        [bx + 0.12, y],
        [bx + 0.12, by - hh],
      ];
    }
    // Feedback path through the gap between rows, offset from the forward edges.
    const s = ay > by ? 1 : -1;
    const gy = by + s * 0.5;
    return [
      [ax - 0.15, ay - s * hh],
      [ax - 0.15, gy],
      [bx + 0.15, gy],
      [bx + 0.15, by + s * hh],
    ];
  }
  if (ay === by) return [[ax + dx * hw, ay], [bx - dx * hw, by]];
  if (ax === bx) return [[ax, ay + dy * hh], [bx, by - dy * hh]];

  if (edge.route === "vhv") {
    const gy = edge.lane ?? by - dy * 0.5;
    return [
      [ax, ay + dy * hh],
      [ax, gy],
      [bx, gy],
      [bx, by - dy * hh],
    ];
  }
  const xm = ax + (bx - ax) / 2;
  return [
    [ax + dx * hw, ay],
    [xm, ay],
    [xm, by],
    [bx - dx * hw, by],
  ];
}

export function gridExtent(system: AiSystem) {
  const cols = Math.max(...system.nodes.map((n) => n.at[0])) + 1;
  const rows = Math.max(...system.nodes.map((n) => n.at[1])) + 1;
  return { cols, rows };
}

/** Edges carrying the signal in the given state (all edges when the system has no states). */
export function activeEdges(system: AiSystem, stateId?: string): Set<string> {
  const state =
    system.states?.find((s) => s.id === stateId) ?? system.states?.find((s) => s.id === system.defaultState);
  return new Set(state?.active ?? system.edges.map((e) => e.id));
}
