import * as THREE from "three";
import { iconSvg, type IconName } from "@/lib/icons";

/**
 * One runtime texture atlas for every icon and short label drawn on 3D tiles.
 * Glyphs are white on transparent; materials tint them (grey idle → orange active).
 * A single GPU upload serves the whole scene (cloned textures share the image source).
 */

const SIZE = 2048;
const ROW = 112;
const PAD = 8;

export type AtlasCell = { u: number; v: number; w: number; h: number; aspect: number };

export type Atlas = {
  texture: THREE.CanvasTexture;
  cells: Map<string, AtlasCell>;
  /** A flat plane (lying on XZ) whose UVs show one cell; `height` is its depth in world units. */
  geometryFor: (key: string, height: number) => { geometry: THREE.PlaneGeometry; width: number } | null;
};

export const fontFamily = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim() || "sans-serif";
export const monoFamily = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function buildAtlas(icons: IconName[], labels: string[]): Promise<Atlas> {
  const family = fontFamily();
  try {
    // Every weight the atlas and canvas faces use, or the canvas silently falls back to another font.
    const mono = monoFamily();
    await Promise.all(
      [`500 60px ${family}`, `600 60px ${family}`, `700 60px ${family}`, `600 30px ${mono}`, `700 30px ${mono}`].map((f) => document.fonts.load(f)),
    );
  } catch {
    /* fall back to whatever is available */
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const cells = new Map<string, AtlasCell>();
  let x = 0;
  let y = 0;

  const place = (w: number) => {
    if (x + w > SIZE) {
      x = 0;
      y += ROW;
    }
    const at = { x, y };
    x += w;
    return at;
  };
  const register = (key: string, px: number, py: number, w: number, h: number) => {
    cells.set(key, { u: px / SIZE, v: 1 - (py + h) / SIZE, w: w / SIZE, h: h / SIZE, aspect: w / h });
  };

  // Icons: 112×112 cells.
  const imgs = await Promise.all(
    icons.map((name) => loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg(name, "#fff", 96, 1.6))}`)),
  );
  icons.forEach((name, i) => {
    const at = place(ROW);
    ctx.drawImage(imgs[i], at.x + PAD, at.y + PAD, ROW - PAD * 2, ROW - PAD * 2);
    register(`icon:${name}`, at.x, at.y, ROW, ROW);
  });

  // Labels: single line, measured width.
  ctx.font = `600 60px ${family}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  for (const text of labels) {
    if (cells.has(`text:${text}`)) continue;
    const w = Math.min(SIZE, Math.ceil(ctx.measureText(text).width) + PAD * 4);
    const at = place(w);
    ctx.fillText(text, at.x + PAD * 2, at.y + ROW / 2 + 3);
    register(`text:${text}`, at.x, at.y, w, ROW);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.premultiplyAlpha = true;
  texture.needsUpdate = true;

  // UVs are baked per decal geometry, so every decal shares this one texture.
  const cache = new Map<string, THREE.PlaneGeometry>();
  const geometryFor = (key: string, height: number) => {
    const cell = cells.get(key);
    if (!cell) return null;
    const id = `${key}@${height}`;
    let geo = cache.get(id);
    if (!geo) {
      geo = new THREE.PlaneGeometry(height * cell.aspect, height);
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, cell.u + uv.getX(i) * cell.w, cell.v + uv.getY(i) * cell.h);
      }
      geo.rotateX(-Math.PI / 2); // lie flat on a tile's top face
      cache.set(id, geo);
    }
    return { geometry: geo, width: height * cell.aspect };
  };

  return { texture, cells, geometryFor };
}
