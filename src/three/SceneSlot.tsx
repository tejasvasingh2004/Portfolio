"use client";

import dynamic from "next/dynamic";
import { useView } from "@/store/viewStore";
import { useMediaQuery, useMode } from "@/hooks/useMode";
import { Tooltip } from "./Tooltip";
import { ObjectProxyNav } from "./ObjectProxyNav";
import { BootLog } from "./BootLog";

// The 3D chunk (three + r3f + scene) loads only on the client, after the HTML paints.
const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => null });

/** Fixed full-viewport stage behind the HTML. Renders nothing in 2D mode. */
export function SceneSlot() {
  const mode = useMode();
  const tier = useView((s) => s.tier);
  const zone = useView((s) => s.view.zone);
  const ready = useView((s) => s.sceneReady);
  const phone = useMediaQuery("(max-width: 639px)");

  const show3d = mode === "3d" && tier !== null && tier !== "none";

  return (
    <div className="only-3d fixed inset-0 z-0" aria-hidden={!show3d}>
      {/* Soft studio backdrop — visible instantly, and behind the canvas as it fades in. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 55% 60%, #f1f1ee 0%, #f4f4f2 60%)" }}
      />
      {show3d && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: ready ? 1 : 0 }}
            role="img"
            aria-label="Interactive 3D workspace: an identity hub wired to modules for projects, AI systems, experience, skills and contact. Everything here is also available through the navigation and panels."
          >
            <Scene tier={tier} panelOpen={zone !== "home"} phone={phone} />
          </div>
          <Tooltip />
          <BootLog />
          <ObjectProxyNav />
        </>
      )}
    </div>
  );
}
