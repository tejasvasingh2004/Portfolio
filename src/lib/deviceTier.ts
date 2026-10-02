import type { Tier } from "@/store/viewStore";

/**
 * Local device-tier heuristic (no network calls). A runtime PerformanceMonitor
 * in the scene still degrades quality further if frame rate drops.
 */
export function detectTier(): Tier {
  if (document.documentElement.dataset.webgl === "0") return "none";

  // Manual override for testing (e.g. ?tier=low).
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "high" || forced === "medium" || forced === "low") return forced;

  let renderer = "";
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    renderer = (ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "").toLowerCase();
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* ignore */
  }

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 640;

  if (/swiftshader|llvmpipe|software|basic render/.test(renderer)) return "low";
  if (nav.connection?.saveData) return "low";
  if (coarse && (cores <= 4 || memory <= 3)) return "low";
  if (coarse || small) return "medium";
  if (/intel/.test(renderer) && !/iris|arc/.test(renderer)) return "medium";
  if (cores <= 4 && memory <= 4) return "medium";
  return "high";
}
