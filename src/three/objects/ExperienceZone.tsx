"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { experience } from "@/data/experience";
import { useView } from "@/store/viewStore";
import { Tile } from "./Tile";
import { Trace } from "./Trace";
import { experienceCardFace, toTexture } from "../faces";
import { useInteractive, useZoneState } from "../interactions";
import { EXP_CARD, zonePos, type V3 } from "../layout";
import { useAtlas } from "../useAtlas";

const E = zonePos.experience;
const n = experience.length;

/** Stacked (home) or dealt into a left→right timeline (zone focused). Index 0 = newest. */
export function expCardPose(i: number, dealt: boolean): { position: V3; rotationY: number } {
  if (dealt) {
    const slot = n - 1 - i; // oldest on the left
    return { position: [E[0] + (slot - (n - 1) / 2) * (EXP_CARD.w + 0.32), 0, E[2]], rotationY: 0 };
  }
  const layer = n - 1 - i; // newest on top
  return { position: [E[0] + i * 0.05, layer * (EXP_CARD.h + 0.03), E[2] - i * 0.04], rotationY: (i - 1) * 0.05 };
}

export function ExperienceZone({ smoothness }: { smoothness: number }) {
  useAtlas();
  const { focused, dimmed } = useZoneState("experience");
  const hovered = useView((s) => s.hovered);
  const invalidate = useThree((s) => s.invalidate);
  const [faces, setFaces] = useState<THREE.Texture[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(experience.map((r) => experienceCardFace(r))).then((canvases) => {
      if (!alive) return;
      setFaces(canvases.map((c) => toTexture(c)));
      invalidate();
    });
    return () => {
      alive = false;
    };
  }, [invalidate]);

  // Zone-level hit target (the whole stack) while not focused.
  const stackRef = useRef<THREE.Group>(null);
  const zone = useInteractive(stackRef, {
    id: "zone:experience",
    label: "Experience",
    detail: `${n} roles — research, backend, AI automation`,
    href: "/experience",
    anchorY: 0.9,
    enabled: !focused,
  });
  const splay = zone.hovered && !focused;

  const hit = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), []);

  return (
    <group>
      {!focused && (
        <group ref={stackRef} {...zone.handlers}>
          <mesh position={[E[0], 0.35, E[2]]} material={hit}>
            <boxGeometry args={[EXP_CARD.w + 0.3, 0.7, EXP_CARD.d + 0.3]} />
          </mesh>
        </group>
      )}

      {focused && (
        <Trace
          points={[
            [E[0] - (n - 1) / 2 * (EXP_CARD.w + 0.32), E[2] - EXP_CARD.d / 2 - 0.45],
            [E[0] + (n - 1) / 2 * (EXP_CARD.w + 0.32), E[2] - EXP_CARD.d / 2 - 0.45],
          ]}
          lit
          caps="both"
        />
      )}

      {experience.map((r, i) => {
        const pose = expCardPose(i, focused);
        const splayOffset: V3 = splay ? [0, (n - 1 - i) * 0.06, (i - 1) * 0.12] : [0, 0, 0];
        return (
          <Tile
            key={r.id}
            position={[pose.position[0] + splayOffset[0], pose.position[1] + splayOffset[1], pose.position[2] + splayOffset[2]]}
            rotationY={pose.rotationY}
            size={[EXP_CARD.w, EXP_CARD.h, EXP_CARD.d]}
            radius={0.06}
            face={faces?.[i] ?? null}
            smoothness={smoothness}
            dimmed={dimmed}
            lit={r.current && !dimmed}
            active={focused && hovered === `role:${r.id}`}
            interactive={{
              id: `role:${r.id}`,
              label: r.org,
              detail: `${r.title} · ${r.period}`,
              href: `/experience#${r.id}`,
              anchorY: 0.45,
              enabled: focused,
            }}
          />
        );
      })}
    </group>
  );
}
