"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/** Geist, self-hosted (SIL Open Font License: public/fonts/Geist-OFL.txt). Bold titles stay legible as small SDF text seen at an angle. */
const FONT_TITLE = "/fonts/Geist-Bold.ttf";
const FONT_SUB = "/fonts/Geist-SemiBold.ttf";

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

const INK = new THREE.Color("#182733");
const INK_SUB = new THREE.Color("#475967");
const ACCENT_INK = new THREE.Color("#0369a1");
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

/**
 * Edge-coverage gamma for glyph anti-aliasing. On the medium and high tiers the scene renders through
 * the post-processing composer into a linear-light buffer, so a glyph's soft edge blends in linear
 * light and turns pale after the final sRGB conversion: small text looks thin and washed out.
 * Raising coverage to 1 - (1 - a)^γ restores the weight of dark text on light tiles: γ ≈ 2.2 undoes
 * the sRGB encoding, and the Scene uses a little more to also offset the neutral tone-mapping pass.
 * 1 leaves troika's output unchanged (the low tier draws straight to the sRGB canvas). Set by the Scene.
 */
export const EDGE_GAMMA = { value: 1 };

type HookableMaterial = THREE.Material & { customProgramCacheKey: () => string };

/** Patch a troika text material once so its edge alpha uses EDGE_GAMMA. */
function correctEdges(mesh: TroikaText | null) {
  const m = mesh?.material as HookableMaterial | HookableMaterial[] | undefined;
  if (!m || Array.isArray(m) || m.userData.edgeGamma) return;
  m.userData.edgeGamma = true;
  // troika runs this after injecting its own shader code, so its edge-alpha line is present.
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTileEdgeGamma = EDGE_GAMMA;
    shader.fragmentShader = shader.fragmentShader
      .replace(/void main\s*\(\s*\)/, "uniform float uTileEdgeGamma;\n$&")
      .replace("gl_FragColor.a *= edgeAlpha;", "gl_FragColor.a *= 1.0 - pow(1.0 - edgeAlpha, uTileEdgeGamma);");
  };
  const key = m.customProgramCacheKey.bind(m);
  m.customProgramCacheKey = () => `${key()}|tile-edge-gamma`;
  m.needsUpdate = true;
}

export function TileText({ label, top, tone }: { label: TileLabel; top: number; tone: RefObject<LabelTone> }) {
  return (
    <Suspense fallback={null}>
      <PrintedText label={label} top={top} tone={tone} />
    </Suspense>
  );
}

const INK_MUTED = new THREE.Color("#7d919f");

/** Static one-line text printed flat on a surface (plates, the board), reading towards the viewer. */
export function SurfaceText({
  text,
  position,
  size,
  opacity = 1,
  tracking = 0,
}: {
  text: string;
  /** Left end of the line, vertically centred, in the parent's units. */
  position: [number, number, number];
  size: number;
  opacity?: number;
  /** Letter spacing in ems. */
  tracking?: number;
}) {
  return (
    <Suspense fallback={null}>
      <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          font={FONT_TITLE}
          fontSize={size}
          anchorX="left"
          anchorY="middle"
          letterSpacing={tracking}
          color={INK_MUTED}
          fillOpacity={opacity}
          raycast={() => null}
          onSync={correctEdges}
        >
          {text}
        </Text>
      </group>
    </Suspense>
  );
}

/**
 * How tall a line of flat-printed text of this font size appears on screen, in CSS pixels: the
 * perspective scale at its distance, foreshortened by how steeply the camera looks down on it.
 */
function screenHeight(at: THREE.Vector3, fontSize: number, camera: THREE.Camera, viewHeight: number) {
  const dist = at.distanceTo(camera.position);
  const fov = (camera as THREE.PerspectiveCamera).fov ?? 30;
  const pxPerUnit = viewHeight / (2 * dist * Math.tan((fov * Math.PI) / 360));
  const slant = Math.abs((at.y - camera.position.y) / dist);
  return fontSize * pxPerUnit * slant;
}

/** Detail lines fade out below this on-screen height (px), where they would only read as grey scribble. */
const DETAIL_MIN_PX = 3.6;
const DETAIL_FULL_PX = 5;

function PrintedText({ label, top, tone }: { label: TileLabel; top: number; tone: RefObject<LabelTone> }) {
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);
  const viewHeight = useThree((s) => s.size.height);
  const group = useRef<THREE.Group>(null);
  const title = useRef<TroikaText>(null);
  const sub = useRef<TroikaText>(null);
  const titleColor = useMemo(() => new THREE.Color(), []);
  const subColor = useMemo(() => INK_SUB.clone(), []);
  const where = useMemo(() => new THREE.Vector3(), []);
  const { text, sub: subText, width, size: maxSize, at = [0, 0], align = "center" } = label;
  const x = align === "left" ? -width / 2 : 0;
  // Titles wrap only between words: shrink the font until the longest word fits.
  const longestWord = Math.max(...text.split(/\s+/).map((w) => w.length));
  const size = Math.min(maxSize, width / (longestWord * EM_ADVANCE));
  const subSize = maxSize * 0.72;
  const gap = size * GAP;

  // Centre title + sub as one block once both are laid out (their heights depend on wrapping).
  const layout = useCallback(() => {
    if (!title.current) return;
    correctEdges(title.current);
    correctEdges(sub.current);
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
    if (sub.current && group.current) {
      // Titles always stay printed; the smaller detail lines appear as the camera comes close enough to read them.
      group.current.getWorldPosition(where);
      const detail = THREE.MathUtils.smoothstep(screenHeight(where, subSize, camera, viewHeight), DETAIL_MIN_PX, DETAIL_FULL_PX);
      sub.current.color = subColor;
      sub.current.fillOpacity = opacity * detail;
      sub.current.visible = detail > 0.01;
    }
  });

  const common = { anchorX: align, textAlign: align, maxWidth: width, raycast: () => null };
  return (
    // Lie flat on the face, reading towards the viewer standing in front of the module.
    <group ref={group} position={[at[0], top + 0.004, at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
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
          fontSize={subSize}
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
