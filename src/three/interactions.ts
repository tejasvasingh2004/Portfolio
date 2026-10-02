import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useView } from "@/store/viewStore";
import type { ZoneId } from "./layout";

/** id → Object3D, so DOM-side keyboard focus can anchor tooltips to 3D objects. */
export const objectRegistry = new Map<string, { object: THREE.Object3D; label: string; detail?: string; anchorY: number }>();

export type InteractiveOptions = {
  id: string;
  label: string;
  detail?: string;
  /** Internal route, external URL or mailto: link. */
  href?: string;
  onActivate?: () => void;
  /** Tooltip anchor height above the object's origin. */
  anchorY?: number;
  enabled?: boolean;
};

const tmp = new THREE.Vector3();

export function anchorOf(object: THREE.Object3D, anchorY: number) {
  object.getWorldPosition(tmp);
  return tmp.clone().setY(tmp.y + anchorY);
}

export function activate(href?: string, onActivate?: () => void) {
  if (onActivate) return onActivate();
  if (!href) return;
  if (href.startsWith("http") || href.endsWith(".pdf")) window.open(href, "_blank", "noopener,noreferrer");
  else if (href.startsWith("mailto:")) window.location.href = href;
  else useView.getState().navigate(href);
}

function setCursor(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "";
}

/** Shared hover / click behaviour for every interactive 3D object (spec §7–8). */
export function useInteractive(ref: RefObject<THREE.Object3D | null>, opts: InteractiveOptions) {
  const { id, label, detail, href, onActivate, anchorY = 0.6, enabled = true } = opts;
  const hovered = useView((s) => s.hovered === id);

  useEffect(() => {
    const object = ref.current;
    if (!object || !enabled) return;
    objectRegistry.set(id, { object, label, detail, anchorY });
    return () => {
      objectRegistry.delete(id);
      if (useView.getState().hovered === id) {
        useView.getState().setHovered(null);
        setCursor(false);
      }
    };
  }, [ref, id, label, detail, anchorY, enabled]);

  const handlers = enabled
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (!ref.current) return;
          useView.getState().setHovered(id, { id, label, detail, anchor: anchorOf(ref.current, anchorY) });
          setCursor(true);
        },
        onPointerOut: () => {
          if (useView.getState().hovered === id) useView.getState().setHovered(null);
          setCursor(false);
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.delta > 6) return; // it was a drag, not a click
          activate(href, onActivate);
        },
      }
    : {};

  return { hovered, handlers };
}

/** Focus / dim state of a zone for the current route. */
export function useZoneState(zone: ZoneId) {
  const current = useView((s) => s.view.zone);
  return {
    focused: current === zone,
    dimmed: current !== "home" && current !== zone,
  };
}
