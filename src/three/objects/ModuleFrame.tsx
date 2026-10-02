"use client";

import type { ReactNode } from "react";
import { moduleFrame, type ModuleId } from "../layout";

/** Places a module on the ring, rotated to face outward. Children use local coordinates. */
export function ModuleFrame({ id, children }: { id: ModuleId; children: ReactNode }) {
  const f = moduleFrame(id);
  return (
    <group position={f.position} rotation-y={f.rotationY}>
      {children}
    </group>
  );
}
