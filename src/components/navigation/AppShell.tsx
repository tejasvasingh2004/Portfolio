"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useView } from "@/store/viewStore";
import { detectTier } from "@/lib/deviceTier";
import { parentHref, parseView, zoneMeta, zoneOrder, type View } from "@/lib/view";
import { projects } from "@/data/projects";
import { aiSystemById, aiSystems } from "@/data/aiSystems";

/** Screen-reader announcement for the current view. */
function describeView(view: View): string {
  if (view.zone === "home") return "Workspace overview";
  const zone = zoneMeta[view.zone].label;
  let detail = "";
  if (view.zone === "projects" && view.item) detail = projects.find((p) => p.slug === view.item)?.title ?? "";
  if (view.zone === "ai" && view.item) {
    const s = aiSystemById(view.item);
    detail = s ? `${s.title}${view.node ? `, ${s.nodes.find((n) => n.id === view.node)?.label ?? ""} node` : ""}` : "";
  }
  return detail ? `${zone}: ${detail}` : `${zone} view`;
}

function isTyping(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  return !!t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

/** Global behaviour: device tier, motion preference, keyboard shortcuts, view announcements. */
export function AppShell() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = parseView(pathname, params.get("node"));
  const { setTier, setReducedMotion, setPaletteOpen } = useView.getState();

  // Device tier + motion preference (once).
  useEffect(() => {
    const tier = detectTier();
    setTier(tier);
    if (tier === "none") document.documentElement.dataset.mode = "2d";
    setReducedMotion(document.documentElement.dataset.motion === "reduced");

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("ts-portfolio:motion");
      } catch {}
      if (stored) return; // explicit choice wins over the system setting
      document.documentElement.dataset.motion = mq.matches ? "reduced" : "full";
      setReducedMotion(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setTier, setReducedMotion]);

  const announcement = describeView(view);

  // Mirror the route into the store so the 3D scene can react without router context.
  useEffect(() => {
    useView.getState().setView({ zone: view.zone, item: view.item, node: view.node });
  }, [view.zone, view.item, view.node]);
  useEffect(() => {
    useView.getState().setNavigate((href) => router.push(href, { scroll: false }));
  }, [router]);

  // Keyboard shortcuts (spec §5).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useView.getState().paletteOpen);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || useView.getState().paletteOpen) return;

      const current = parseView(window.location.pathname, new URLSearchParams(window.location.search).get("node"));

      if (e.key === "Escape") {
        if (current.zone !== "home") router.push(parentHref(current), { scroll: false });
        return;
      }
      if (e.key === "h" || e.key === "H") return router.push("/");

      const zone = zoneOrder.find((z) => zoneMeta[z].key === e.key);
      if (zone) return router.push(zoneMeta[zone].href);

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const cycle = (list: string[], cur: string | undefined) => {
          const i = cur ? list.indexOf(cur) : -1;
          return list[(i + dir + list.length) % list.length];
        };
        if (current.zone === "projects") {
          router.push(`/projects/${cycle(projects.map((p) => p.slug), current.item)}`);
        } else if (current.zone === "ai") {
          const sys = current.item ? aiSystemById(current.item) : undefined;
          if (sys && current.node) {
            router.push(`/ai/${sys.id}?node=${cycle(sys.nodes.map((n) => n.id), current.node)}`, { scroll: false });
          } else {
            router.push(`/ai/${cycle(aiSystems.map((s) => s.id), current.item)}`);
          }
        } else return;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, setPaletteOpen]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
