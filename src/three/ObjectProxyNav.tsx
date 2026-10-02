"use client";

import Link from "next/link";
import { useView } from "@/store/viewStore";
import { zoneMeta, zoneOrder } from "@/lib/view";
import { projects } from "@/data/projects";
import { aiSystemById, aiSystems } from "@/data/aiSystems";
import { anchorOf, objectRegistry } from "./interactions";

type Entry = { id: string; label: string; href: string };

/**
 * Keyboard / screen-reader mirror of the interactive 3D objects (spec §16).
 * Focusing an entry puts its 3D object into the hover state and shows its tooltip.
 */
export function ObjectProxyNav() {
  const view = useView((s) => s.view);

  let entries: Entry[] = zoneOrder.map((z) => ({ id: `zone:${z}`, label: zoneMeta[z].label, href: zoneMeta[z].href }));
  if (view.zone === "projects") {
    entries = projects.map((p) => ({ id: `project:${p.slug}`, label: p.title, href: `/projects/${p.slug}` }));
  } else if (view.zone === "ai") {
    const s = (view.item && aiSystemById(view.item)) || aiSystems[0];
    entries = [
      ...aiSystems.map((x) => ({ id: `system:${x.id}`, label: `${x.title} system`, href: `/ai/${x.id}` })),
      ...s.nodes.map((n) => ({ id: `node:${s.id}:${n.id}`, label: `${n.label} node`, href: `/ai/${s.id}?node=${n.id}` })),
    ];
  }

  const focus = (id: string) => {
    const reg = objectRegistry.get(id);
    if (!reg) return;
    useView.getState().setHovered(id, { id, label: reg.label, detail: reg.detail, anchor: anchorOf(reg.object, reg.anchorY) });
  };
  const blur = (id: string) => {
    if (useView.getState().hovered === id) useView.getState().setHovered(null);
  };

  return (
    <nav
      aria-label="Workspace objects"
      className="pointer-events-none fixed bottom-24 left-4 z-30 [&:not(:focus-within)]:sr-only"
    >
      <p className="label-mono mb-2 rounded-md bg-surface/90 px-2 py-1 ring-1 ring-line">3D workspace — Tab through, Enter to open</p>
      <ul className="flex max-w-[60vw] flex-wrap gap-1.5">
        {entries.map((e) => (
          <li key={e.id}>
            <Link
              href={e.href}
              scroll={false}
              onFocus={() => focus(e.id)}
              onBlur={() => blur(e.id)}
              className="pointer-events-auto inline-flex h-8 items-center rounded-lg bg-surface px-3 text-[13px] text-ink-2 ring-1 ring-line focus-visible:text-ink"
            >
              {e.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
