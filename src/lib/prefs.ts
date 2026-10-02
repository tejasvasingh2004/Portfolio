import { useView } from "@/store/viewStore";

const MODE_KEY = "ts-portfolio:mode";
const MOTION_KEY = "ts-portfolio:motion";

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, blocked) — preference just won't persist */
  }
}

export function setMode(mode: "2d" | "3d") {
  document.documentElement.dataset.mode = mode;
  store(MODE_KEY, mode);
  // Re-render subscribers that depend on the mode (scene mount, panel layout).
  window.dispatchEvent(new Event("ts:mode"));
}

export function getMode(): "2d" | "3d" {
  return document.documentElement.dataset.mode === "2d" ? "2d" : "3d";
}

export function setMotion(reduced: boolean) {
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  store(MOTION_KEY, reduced ? "reduced" : "full");
  useView.getState().setReducedMotion(reduced);
}

/**
 * Runs inline in <head> before first paint: picks 2D when WebGL is unavailable
 * or the visitor chose it, and applies the stored motion preference.
 */
export const bootScript = `(function(){try{
var d=document.documentElement,m=null,r=null;
try{m=localStorage.getItem("${MODE_KEY}");r=localStorage.getItem("${MOTION_KEY}");}catch(e){}
var gl=false;try{var c=document.createElement("canvas");gl=!!(c.getContext("webgl2")||c.getContext("webgl"));}catch(e){}
d.dataset.webgl=gl?"1":"0";
d.dataset.mode=(!gl||m==="2d")?"2d":"3d";
var sys=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
d.dataset.motion=(r==="reduced"||(r===null&&sys))?"reduced":"full";
}catch(e){}})();`;
