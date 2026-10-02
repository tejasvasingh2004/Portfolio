"use client";

import { useEffect, useState } from "react";
import { useView } from "@/store/viewStore";
import { projects } from "@/data/projects";
import { aiSystems } from "@/data/aiSystems";

const LINES = [
  "loading 3D engine",
  `building workspace (${projects.length} projects · ${aiSystems.length} AI systems)`,
  "compiling shaders",
];

const SESSION_KEY = "ts-portfolio:booted";

/**
 * Short boot log driven by real loading stages (spec §21). Appears only if loading
 * takes longer than 400 ms, at most once per session, and never blocks the page.
 */
export function BootLog() {
  const stage = useView((s) => s.bootStage);
  const ready = useView((s) => s.sceneReady);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  }, [ready]);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-5 left-5 z-20 hidden font-mono text-[11px] leading-[18px] text-ink-3 transition-opacity duration-500 sm:block"
      style={{ opacity: ready ? 0 : 1, transitionDelay: ready ? "500ms" : "0ms" }}
    >
      {LINES.map((l, i) =>
        i <= stage ? (
          <p key={l} className="animate-[fade_200ms_ease-out]">
            <span className="text-accent">▸</span> {l.padEnd(52, ".").slice(0, 52)}{" "}
            <span className={i < stage ? "text-ink-2" : "text-ink-3"}>{i < stage ? "ok" : "…"}</span>
          </p>
        ) : null,
      )}
      {ready && <p className="text-ink-2">ready.</p>}
    </div>
  );
}
