"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/** Geist, self-hosted (SIL Open Font License: public/fonts/Geist-OFL.txt). */
const FONT_TITLE = "/fonts/Geist-SemiBold.ttf";
const FONT_SUB = "/fonts/Geist-Medium.ttf";

/** Text printed on a tile's top face. It moves, lifts, dims and is hidden with the tile, like ink on the block. */
export type TileLabel = {
  text: string;
  /** Smaller line(s) under the title (cards). */
  sub?: string;
  /** Width of the text block on the face, in tile units; text wraps to fit. */
  width: number;
  /** Title font size, in tile units. */
  size: number;
  /** Centre of the text block on the top face: [x, z] from the tile centre (+z is towards the viewer). */
  at?: [number, number];
  align?: "center" | "left";
};

/** Animation state the tile drives: tint 0..1 (hover / active → green), dim 0..1. */
export type LabelTone = { tint: number; dim: number };

const INK = new THREE.Color("#1f2a22");
const INK_SUB = new THREE.Color("#4e5c53");
const ACCENT_INK = new THREE.Color("#3f6212");
const GAP = 0.35; // space between title and sub, in title font sizes
const EM_ADVANCE = 0.6; // generous average glyph width of Geist SemiBold, in ems

type TroikaText = THREE.Mesh & {
  color: THREE.Color;
  fillOpacity: number;
  textRenderInfo: { blockBounds: [number, number, number, number] } | null;
};

const height = (t: TroikaText | null) => {
  const b = t?.textRenderInfo?.blockBounds;
  return b ? b[3] - b[1] : 0;
};

export function TileText({ label, top, tone }: { label: TileLabel; top: number; tone: RefObject<LabelTone> }) {
  return (
    <Suspense fallback={null}>
      <PrintedText label={label} top={top} tone={tone} />
    </Suspense>
  );
}

function PrintedText({ label, top, tone }: { label: TileLabel; top: number; tone: RefObject<LabelTone> }) {
  const invalidate = useThree((s) => s.invalidate);
  const title = useRef<TroikaText>(null);
  const sub = useRef<TroikaText>(null);
  const titleColor = useMemo(() => new THREE.Color(), []);
  const subColor = useMemo(() => INK_SUB.clone(), []);
  const { text, sub: subText, width, size: maxSize, at = [0, 0], align = "center" } = label;
  const x = align === "left" ? -width / 2 : 0;
  // Titles wrap only between words: shrink the font until the longest word fits.
  const longestWord = Math.max(...text.split(/\s+/).map((w) => w.length));
  const size = Math.min(maxSize, width / (longestWord * EM_ADVANCE));
  const gap = size * GAP;

  // Centre title + sub as one block once both are laid out (their heights depend on wrapping).
  const layout = useCallback(() => {
    if (!title.current) return;
    const ht = height(title.current);
    const hs = subText ? height(sub.current) : 0;
    const total = ht + (subText ? gap + hs : 0);
    title.current.position.y = total / 2;
    if (sub.current) sub.current.position.y = total / 2 - ht - gap;
    invalidate();
  }, [gap, invalidate, subText]);

  useFrame(() => {
    const t = tone.current;
    if (!t) return;
    const opacity = 1 - t.dim * 0.65;
    if (title.current) {
      title.current.color = titleColor.copy(INK).lerp(ACCENT_INK, t.tint);
      title.current.fillOpacity = opacity;
    }
    if (sub.current) {
      sub.current.color = subColor;
      sub.current.fillOpacity = opacity;
    }
  });

  const common = { anchorX: align, textAlign: align, maxWidth: width, raycast: () => null };
  return (
    // Lie flat on the face, reading towards the viewer standing in front of the module.
    <group position={[at[0], top + 0.004, at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
      <Text
        ref={title}
        font={FONT_TITLE}
        fontSize={size}
        lineHeight={1.12}
        letterSpacing={-0.01}
        anchorY="top"
        position={[x, 0, 0]}
        color={INK}
        onSync={layout}
        {...common}
      >
        {text}
      </Text>
      {subText && (
        <Text
          ref={sub}
          font={FONT_SUB}
          fontSize={maxSize * 0.72}
          lineHeight={1.28}
          anchorY="top"
          position={[x, 0, 0]}
          color={INK_SUB}
          onSync={layout}
          overflowWrap="break-word"
          {...common}
        >
          {subText}
        </Text>
      )}
    </group>
  );
}
