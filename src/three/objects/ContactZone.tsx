"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type * as THREE from "three";
import { links, profile } from "@/data/profile";
import type { IconName } from "@/lib/icons";
import { Tile } from "./Tile";
import { Trace } from "./Trace";
import { contactCardFace, toTexture } from "../faces";
import { useZoneState } from "../interactions";
import { CONTACT_CARD, zonePos } from "../layout";
import { useAtlas } from "../useAtlas";

const K = zonePos.contact;

export const contactLinks: { id: string; icon: IconName; label: string; detail: string; href: string }[] = [
  { id: "mail", icon: "mail", label: "Email", detail: links.email, href: `mailto:${links.email}` },
  { id: "github", icon: "github", label: "GitHub", detail: "github.com/tejasvasingh2004", href: links.github },
  { id: "linkedin", icon: "linkedin", label: "LinkedIn", detail: "Tejasva Singh Chouhan", href: links.linkedin },
  { id: "leetcode", icon: "leetcode", label: "LeetCode", detail: "tejasvasingh44", href: links.leetcode },
  { id: "resume", icon: "file-down", label: "Résumé", detail: "Download PDF", href: profile.resume },
];

const TILE = 0.74;
const TILE_GAP = 0.18;
const ROW_Z = K[2] + CONTACT_CARD.d / 2 + 0.95;

export function linkTileX(i: number) {
  const span = contactLinks.length * TILE + (contactLinks.length - 1) * TILE_GAP;
  return K[0] - span / 2 + TILE / 2 + i * (TILE + TILE_GAP);
}

export function ContactZone({ smoothness }: { smoothness: number }) {
  useAtlas();
  const { focused, dimmed } = useZoneState("contact");
  const invalidate = useThree((s) => s.invalidate);
  const [face, setFace] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    contactCardFace(profile.photo, profile.name, profile.status, links.email).then((c) => {
      if (!alive) return;
      setFace(toTexture(c));
      invalidate();
    });
    return () => {
      alive = false;
    };
  }, [invalidate]);

  return (
    <group>
      <Trace
        points={[
          [linkTileX(0), ROW_Z - TILE / 2 - 0.3],
          [linkTileX(contactLinks.length - 1), ROW_Z - TILE / 2 - 0.3],
        ]}
        lit={focused}
        dimmed={dimmed}
        caps="none"
      />
      <Tile
        position={[K[0], 0, K[2]]}
        size={[CONTACT_CARD.w, CONTACT_CARD.h, CONTACT_CARD.d]}
        radius={0.08}
        face={face}
        smoothness={smoothness}
        dimmed={dimmed}
        active={focused}
        interactive={{
          id: "zone:contact",
          label: "Contact",
          detail: "Let's build something — email, GitHub, LinkedIn",
          href: "/contact",
          anchorY: 0.6,
          enabled: !focused,
        }}
      />
      {contactLinks.map((l, i) => (
        <Tile
          key={l.id}
          position={[linkTileX(i), 0, ROW_Z]}
          size={[TILE, 0.22, TILE]}
          radius={0.1}
          smoothness={smoothness}
          dimmed={dimmed}
          decals={[{ key: `icon:${l.icon}`, height: 0.4 }]}
          interactive={{ id: `link:${l.id}`, label: l.label, detail: l.detail, href: l.href, anchorY: 0.5 }}
        />
      ))}
    </group>
  );
}
