"use client";

import Link from "next/link";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { projects } from "@/data/projects";
import { aiSystems } from "@/data/aiSystems";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import { MONITOR, toWorld, type V3, type ZoneId } from "./layout";
import { objectRegistry, anchorOf } from "./interactions";

type Label = { zone: ZoneId; label: string; meta: string; icon: IconName; href: string; anchor: V3 };

export const zoneLabels: Label[] = [
  { zone: "about", label: "About", meta: "Who I am", icon: "user", href: "/about", anchor: [0, 3.2, 0] },
  { zone: "projects", label: "Projects", meta: `${projects.length} built`, icon: "folder", href: "/projects", anchor: toWorld("projects", [0, MONITOR.y + MONITOR.h / 2 + 0.45, MONITOR.z]) },
  { zone: "ai", label: "AI Lab", meta: `${aiSystems.length} agent systems`, icon: "network", href: "/ai", anchor: toWorld("ai", [0, 1.1, -0.4]) },
  { zone: "experience", label: "Experience", meta: `${experience.length} roles`, icon: "briefcase", href: "/experience", anchor: toWorld("experience", [0, 1.1, 0]) },
  { zone: "skills", label: "Skills", meta: `${skills.length} technologies`, icon: "keyboard", href: "/skills", anchor: toWorld("skills", [0, 1.0, 0]) },
  { zone: "contact", label: "Contact", meta: "Let's talk", icon: "mail", href: "/contact", anchor: toWorld("contact", [0, 1.1, 0]) },
];

/** DOM elements for the labels, positioned every frame by <ZoneLabelTracker/>. */
export const labelElements = new Map<ZoneId, HTMLElement>();

/** Floating module labels (overview only). Real links, so they also work for keyboard and touch. */
export function ZoneLabels() {
  const zone = useView((s) => s.view.zone);
  const hovered = useView((s) => s.hovered);
  if (zone !== "home") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {zoneLabels.map((l) => {
        const on = hovered === `zone:${l.zone}`;
        return (
          <Link
            key={l.zone}
            href={l.href}
            tabIndex={-1}
            ref={(el) => {
              if (el) labelElements.set(l.zone, el);
              else labelElements.delete(l.zone);
            }}
            onPointerEnter={() => {
              const reg = objectRegistry.get(`zone:${l.zone}`);
              if (reg) useView.getState().setHovered(`zone:${l.zone}`, { id: `zone:${l.zone}`, label: reg.label, detail: reg.detail, anchor: anchorOf(reg.object, reg.anchorY) });
            }}
            onPointerLeave={() => useView.getState().setHovered(null)}
            className="pointer-events-auto absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full bg-surface/90 py-1 pl-1 pr-3 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_8px_24px_-8px_rgb(0_0_0/0.18)] ring-1 ring-line backdrop-blur-md transition-[opacity,box-shadow] duration-200 will-change-transform hover:ring-line-strong"
            style={{ opacity: 0 }}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${on ? "bg-accent text-white" : "bg-surface-2 text-ink-2 ring-1 ring-line"}`}
            >
              <Icon name={l.icon} size={13} />
            </span>
            <span className="text-[12.5px] font-semibold text-ink">{l.label}</span>
            <span className="hidden text-[11.5px] text-ink-3 sm:inline">{l.meta}</span>
          </Link>
        );
      })}
    </div>
  );
}

/** Projects each label's anchor to screen space; fades labels that are far or behind the camera. */
export function ZoneLabelTracker() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (labelElements.size === 0) return;
    camera.getWorldPosition(camPos);
    for (const l of zoneLabels) {
      const el = labelElements.get(l.zone);
      if (!el) continue;
      v.set(...l.anchor);
      const dist = v.distanceTo(camPos);
      v.project(camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      // Nearer modules read stronger; the far side of the ring recedes.
      const fade = THREE.MathUtils.clamp(1.9 - dist / 22, 0.35, 1);
      el.style.opacity = visible ? String(fade) : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -100%)`;
      el.style.zIndex = String(1000 - Math.round(dist * 10));
    }
  });
  return null;
}
