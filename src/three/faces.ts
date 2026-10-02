import * as THREE from "three";
import type { Project } from "@/data/projects";
import type { Role } from "@/data/experience";
import { skillById } from "@/data/skills";
import { fontFamily, monoFamily } from "./atlas";

/** Canvas-drawn surfaces (card faces, monitor screen). Drawn in the site's own type and colours. */

export const C = {
  face: "#fafaf8",
  ink: "#121214",
  ink2: "#4a4a52",
  ink3: "#85858c",
  line: "#e6e6e2",
  surface2: "#f1f1ee",
  accent: "#ff6a13",
  accentSoft: "#ffede1",
};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

export function toTexture(c: HTMLCanvasElement, existing?: THREE.CanvasTexture) {
  if (existing) {
    existing.image = c;
    existing.needsUpdate = true;
    return existing;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16; // clamped to the GPU maximum; keeps text sharp at grazing angles
  return t;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else line = test;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxW && last.length) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

const sans = (weight: number, px: number) => `${weight} ${px}px ${fontFamily()}`;
const mono = (weight: number, px: number) => `${weight} ${px}px ${monoFamily()}`;

// ── Project card ───────────────────────────────────────────────────────
// Drawn at 2× with few, large, bold elements so it stays legible at oblique angles.
export function projectCardFace(p: Project) {
  const W = 620;
  const H = 420;
  const { c, ctx } = canvas(W * 2, H * 2);
  ctx.scale(2, 2);
  ctx.fillStyle = C.face;
  ctx.fillRect(0, 0, W, H);
  // Title, subtitle and category are crisp HTML labels (see ItemLabels); the face stays quiet.
  ctx.beginPath();
  ctx.arc(54, 54, 11, 0, Math.PI * 2);
  ctx.fillStyle = p.featured ? C.accent : C.line;
  ctx.fill();
  return c;
}

// ── Experience card ────────────────────────────────────────────────────
export async function experienceCardFace(r: Role) {
  const W = 620;
  const H = 404;
  const { c, ctx } = canvas(W * 2, H * 2);
  ctx.scale(2, 2);
  ctx.fillStyle = C.face;
  ctx.fillRect(0, 0, W, H);

  rr(ctx, 40, 38, 104, 104, 24);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.stroke();
  let drew = false;
  if (r.logo) {
    try {
      const img = await loadImg(r.logo);
      ctx.drawImage(img, 52, 50, 80, 80);
      drew = true;
    } catch {
      /* fall back to monogram */
    }
  }
  if (!drew) {
    ctx.font = mono(700, 34);
    ctx.fillStyle = C.ink2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(r.orgShort, 92, 91);
    ctx.textAlign = "left";
  }

  // "Present" marker: a single orange dot (dates live in the HTML label/panel).
  if (r.current) {
    ctx.beginPath();
    ctx.arc(W - 52, 64, 11, 0, Math.PI * 2);
    ctx.fillStyle = C.accent;
    ctx.fill();
  }

  // Organisation and role are crisp HTML labels pinned to the card (see ItemLabels).
  return c;
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

// ── Contact card ───────────────────────────────────────────────────────
export async function contactCardFace(photo: string) {
  const W = 680;
  const H = 440;
  const { c, ctx } = canvas(W * 2, H * 2);
  ctx.scale(2, 2);
  ctx.fillStyle = C.face;
  ctx.fillRect(0, 0, W, H);

  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = photo;
    });
    ctx.save();
    ctx.beginPath();
    ctx.arc(104, 112, 60, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 44, 52, 120, 120);
    ctx.restore();
  } catch {
    ctx.beginPath();
    ctx.arc(104, 112, 60, 0, Math.PI * 2);
    ctx.fillStyle = C.surface2;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(104, 112, 60, 0, Math.PI * 2);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Name and email are crisp HTML labels pinned to the card (see ItemLabels).

  // step dots → orange check (reference image language)
  const y = 288;
  const xs = [76, 196, 316];
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(xs[0], y);
  ctx.lineTo(470, y);
  ctx.stroke();
  xs.forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = C.ink3;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(470, y, 34, 0, Math.PI * 2);
  ctx.fillStyle = C.accent;
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(455, y + 1);
  ctx.lineTo(466, y + 12);
  ctx.lineTo(487, y - 10);
  ctx.stroke();

  return c;
}

// ── Monitor screen ─────────────────────────────────────────────────────
export function monitorScreen(projects: Project[], selected?: Project) {
  const W = 1280;
  const H = 746;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#fdfdfc";
  ctx.fillRect(0, 0, W, H);

  // window chrome dots
  [C.accent, "#ffb38a", C.line].forEach((col, i) => {
    ctx.beginPath();
    ctx.arc(44 + i * 26, 40, 8, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });

  // sidebar
  rr(ctx, 28, 76, 150, H - 104, 22);
  ctx.fillStyle = C.surface2;
  ctx.fill();
  projects.forEach((p, i) => {
    const y = 120 + i * 64;
    const on = selected?.slug === p.slug;
    rr(ctx, 44, y - 22, 118, 44, 12);
    ctx.fillStyle = on ? C.accent : "#fff";
    ctx.fill();
    ctx.font = sans(600, 19);
    ctx.fillStyle = on ? "#fff" : C.ink2;
    ctx.textBaseline = "middle";
    ctx.fillText(p.title.length > 10 ? `${p.title.slice(0, 9)}…` : p.title, 58, y + 1);
  });

  const X = 214;
  ctx.textBaseline = "alphabetic";
  if (!selected) {
    ctx.font = mono(600, 20);
    ctx.fillStyle = C.ink3;
    ctx.fillText("PROJECTS · OVERVIEW", X, 120);
    ctx.font = sans(650, 56);
    ctx.fillStyle = C.ink;
    ctx.fillText(`${projects.length} projects built`, X, 186);

    // rows
    projects.forEach((p, i) => {
      const y = 236 + i * 74;
      rr(ctx, X, y, 610, 60, 16);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = sans(600, 24);
      ctx.fillStyle = C.ink;
      ctx.fillText(p.title, X + 22, y + 39);
      ctx.font = mono(500, 18);
      ctx.fillStyle = C.ink3;
      ctx.fillText(p.category.toUpperCase(), X + 250, y + 38);
      const bw = 90 + p.stack.length * 14;
      rr(ctx, X + 400, y + 26, 190, 8, 4);
      ctx.fillStyle = C.surface2;
      ctx.fill();
      rr(ctx, X + 400, y + 26, Math.min(190, bw), 8, 4);
      ctx.fillStyle = i === 0 ? C.accent : "#d9d9d4";
      ctx.fill();
    });

    // chart card
    const cx = 860;
    rr(ctx, cx, 96, 390, 300, 22);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.stroke();
    ctx.font = mono(600, 18);
    ctx.fillStyle = C.ink3;
    ctx.fillText("TECHNOLOGIES PER PROJECT", cx + 24, 134);
    const max = Math.max(...projects.map((p) => p.stack.length));
    projects.forEach((p, i) => {
      const bh = (p.stack.length / max) * 170;
      const bx = cx + 40 + i * 88;
      rr(ctx, bx, 360 - bh, 52, bh, 10);
      ctx.fillStyle = i === 0 ? C.accent : "#e4e4df";
      ctx.fill();
      ctx.font = mono(600, 18);
      ctx.fillStyle = C.ink3;
      ctx.textAlign = "center";
      ctx.fillText(String(p.stack.length), bx + 26, 352 - bh);
      ctx.fillText(p.title.slice(0, 5).toUpperCase(), bx + 26, 384);
      ctx.textAlign = "left";
    });

    // donut
    rr(ctx, cx, 420, 390, 290, 22);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    const cats = ["AI", "Systems", "Backend"];
    const counts = cats.map((k) => projects.filter((p) => p.category === k).length);
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    let a0 = -Math.PI / 2;
    counts.forEach((n, i) => {
      const a1 = a0 + (n / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + 120, 565, 80, a0 + 0.04, a1 - 0.04);
      ctx.strokeStyle = [C.accent, "#ffb38a", "#d9d9d4"][i];
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.stroke();
      a0 = a1;
    });
    ctx.lineCap = "butt";
    cats.forEach((k, i) => {
      ctx.fillStyle = [C.accent, "#ffb38a", "#d9d9d4"][i];
      ctx.beginPath();
      ctx.arc(cx + 250, 520 + i * 44, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = sans(600, 22);
      ctx.fillStyle = C.ink2;
      ctx.fillText(`${k} · ${counts[i]}`, cx + 268, 528 + i * 44);
    });
    return c;
  }

  const p = selected;
  ctx.font = mono(600, 20);
  ctx.fillStyle = "#c2410c";
  ctx.fillText(`${p.category.toUpperCase()} · ${p.year}`, X, 120);
  ctx.font = sans(650, 64);
  ctx.fillStyle = C.ink;
  ctx.fillText(p.title, X, 192);
  ctx.font = sans(500, 27);
  ctx.fillStyle = C.ink2;
  wrap(ctx, p.tagline, 1000, 2).forEach((l, i) => ctx.fillText(l, X, 244 + i * 38));

  // facts
  p.facts.forEach((f, i) => {
    const fx = X + i * 250;
    rr(ctx, fx, 330, 230, 130, 20);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = sans(650, 52);
    ctx.fillStyle = i === 0 ? C.accent : C.ink;
    ctx.fillText(f.value, fx + 24, 404);
    ctx.font = sans(500, 21);
    ctx.fillStyle = C.ink3;
    ctx.fillText(f.label, fx + 24, 440);
  });

  // stack chips
  let x = X;
  let y = 512;
  ctx.font = sans(600, 22);
  for (const s of p.stack) {
    const label = skillById[s]?.label ?? s;
    const w = ctx.measureText(label).width + 36;
    if (x + w > W - 40) {
      x = X;
      y += 58;
      if (y > H - 60) break;
    }
    rr(ctx, x, y, w, 44, 12);
    ctx.fillStyle = C.surface2;
    ctx.fill();
    ctx.fillStyle = C.ink2;
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 18, y + 23);
    ctx.textBaseline = "alphabetic";
    x += w + 10;
  }
  return c;
}

// ── Soft radial glow (used under active tiles) ─────────────────────────
let glow: THREE.Texture | null = null;
export function glowTexture() {
  if (glow) return glow;
  const { c, ctx } = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glow = new THREE.CanvasTexture(c);
  return glow;
}
