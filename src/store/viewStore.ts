import { create } from "zustand";
import type { Vector3 } from "three";
import type { View } from "@/lib/view";

export type Tier = "high" | "medium" | "low" | "none";

export type TooltipState = {
  id: string;
  label: string;
  detail?: string;
  anchor: Vector3;
};

type ViewStore = {
  /** Current route, mirrored from the DOM side so the canvas never needs router context. */
  view: View;
  navigate: (href: string) => void;

  /** Interactive object under the pointer or keyboard focus. */
  hovered: string | null;
  tooltip: TooltipState | null;
  tier: Tier | null;
  reducedMotion: boolean;
  sceneReady: boolean;
  /** Real loading stages: 0 engine · 1 workspace built · 2 shaders compiled. */
  bootStage: number;
  /** NeuroFlow workload state shown in the AI Lab. */
  workload: string;
  /** Skill being inspected (drives skill → project traces). */
  skillFocus: string | null;
  paletteOpen: boolean;
  /** The visitor has orbited/panned away from the route's framing. */
  cameraDirty: boolean;
  /** Increment to fly back to the current route's framing. */
  recenterTick: number;

  setView: (view: View) => void;
  setNavigate: (fn: (href: string) => void) => void;
  setHovered: (id: string | null, tooltip?: TooltipState | null) => void;
  setTier: (tier: Tier) => void;
  setReducedMotion: (v: boolean) => void;
  setSceneReady: () => void;
  setBootStage: (n: number) => void;
  setWorkload: (w: string) => void;
  setSkillFocus: (id: string | null) => void;
  setPaletteOpen: (v: boolean) => void;
  setCameraDirty: (v: boolean) => void;
  recenter: () => void;
};

export const useView = create<ViewStore>((set) => ({
  view: { zone: "home" },
  navigate: () => {},
  hovered: null,
  tooltip: null,
  tier: null,
  reducedMotion: false,
  sceneReady: false,
  bootStage: 0,
  workload: "MEDIUM",
  skillFocus: null,
  paletteOpen: false,
  cameraDirty: false,
  recenterTick: 0,

  setView: (view) => set({ view }),
  setNavigate: (navigate) => set({ navigate }),
  setHovered: (id, tooltip = null) => set({ hovered: id, tooltip: id ? tooltip : null }),
  setTier: (tier) => set({ tier }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setSceneReady: () => set({ sceneReady: true, bootStage: 3 }),
  setBootStage: (bootStage) => set((s) => ({ bootStage: Math.max(s.bootStage, bootStage) })),
  setWorkload: (workload) => set({ workload }),
  setSkillFocus: (skillFocus) => set({ skillFocus }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setCameraDirty: (cameraDirty) => set((s) => (s.cameraDirty === cameraDirty ? s : { cameraDirty })),
  recenter: () => set((s) => ({ recenterTick: s.recenterTick + 1 })),
}));
