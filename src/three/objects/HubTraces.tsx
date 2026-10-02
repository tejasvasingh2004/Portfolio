"use client";

import { useEffect, useState } from "react";
import { useView } from "@/store/viewStore";
import { Trace } from "./Trace";
import { hubTraces, type ZoneId } from "../layout";

const zones = Object.keys(hubTraces) as Exclude<ZoneId, "about">[];

/** Signal traces from the Identity Hub to every module, plus the idle "heartbeat". */
export function HubTraces() {
  const view = useView((s) => s.view);
  const hovered = useView((s) => s.hovered);
  const reduced = useView((s) => s.reducedMotion);
  const [pulses, setPulses] = useState<Record<string, number>>({});

  const hoveredZone = zones.find((z) => hovered?.startsWith(`zone:${z}`) || (z === "projects" && hovered?.startsWith("project:")));

  // Hovering a module sends one pulse from the hub to it.
  useEffect(() => {
    if (!hoveredZone) return;
    const id = requestAnimationFrame(() => setPulses((p) => ({ ...p, [hoveredZone]: (p[hoveredZone] ?? 0) + 1 })));
    return () => cancelAnimationFrame(id);
  }, [hoveredZone]);

  // Heartbeat: a faint pulse to a random module every ~6 s while idle on the overview.
  useEffect(() => {
    if (reduced || view.zone !== "home") return;
    let beats = 0;
    const timer = window.setInterval(() => {
      if (document.hidden || beats++ > 10) return; // rest after ~1 minute without navigation
      const z = zones[Math.floor(Math.random() * zones.length)];
      setPulses((p) => ({ ...p, [z]: (p[z] ?? 0) + 1 }));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reduced, view.zone]);

  return (
    <group>
      {zones.map((z) => (
        <Trace
          key={z}
          points={hubTraces[z]}
          lit={view.zone === z || hoveredZone === z}
          dimmed={view.zone !== "home" && view.zone !== z && view.zone !== "about"}
          pulse={pulses[z] ?? 0}
          caps="both"
        />
      ))}
    </group>
  );
}
