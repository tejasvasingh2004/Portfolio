"use client";

import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import CameraControlsImpl from "camera-controls";
import { easing } from "maath";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useView } from "@/store/viewStore";
import { aiSystemById } from "@/data/aiSystems";
import { projects } from "@/data/projects";
import type { View } from "@/lib/view";
import { homePose, zonePoses, zonePos, type CameraPose, type V3 } from "./layout";
import { cardPosition, MONITOR_CENTER } from "./objects/ProjectsZone";
import { nodePosition } from "./objects/AiLab";

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Camera pose for a route (spec §6). */
function poseFor(view: View): CameraPose {
  if (view.zone === "home") return homePose;
  if (view.zone === "projects" && view.item) {
    const i = projects.findIndex((p) => p.slug === view.item);
    if (i >= 0) {
      const card = cardPosition(i);
      const target: V3 = [MONITOR_CENTER[0] * 0.7 + card[0] * 0.3, 1.35, zonePos.projects[2] - 0.4];
      return { position: add(target, [1.6, 6.2, 12.8]), target, azimuthRange: 0.3, polarRange: 0.18 };
    }
  }
  if (view.zone === "ai" && view.item && view.node) {
    const s = aiSystemById(view.item);
    if (s?.nodes.some((n) => n.id === view.node)) {
      const p = nodePosition(s, view.node);
      const target: V3 = [p[0], 0.3, p[2]];
      return { position: add(target, [1.6, 7.8, 8.2]), target, azimuthRange: 0.3, polarRange: 0.2 };
    }
  }
  return zonePoses[view.zone];
}

/** Narrow viewports (or a side panel eating width) pull the camera back so framing holds. */
function fitScale(aspect: number, home: boolean) {
  const ideal = home ? 1.55 : 1.25;
  return THREE.MathUtils.clamp(ideal / aspect, 1, home ? 1.9 : 1.7);
}

export function CameraRig({ panelOpen }: { panelOpen: boolean }) {
  const controls = useRef<CameraControlsImpl>(null);
  const view = useView((s) => s.view);
  const reduced = useView((s) => s.reducedMotion);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const first = useRef(true);
  const offset = useRef({ x: 0, y: 0 });

  const phone = size.width < 640;
  const panelW = phone ? 0 : size.width < 1024 ? 380 : 440;

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const pose = poseFor(view);
    const home = view.zone === "home";
    const effW = panelOpen && !phone ? size.width - panelW - 32 : size.width;
    const effH = panelOpen && phone ? size.height * 0.58 : size.height;
    const k = fitScale(effW / effH, home);

    const t = new THREE.Vector3(...pose.target);
    const p = new THREE.Vector3(...pose.position).sub(t).multiplyScalar(k).add(t);
    const rel = p.clone().sub(t);
    const dist = rel.length();
    const az = Math.atan2(rel.x, rel.z);
    const polar = Math.acos(rel.y / dist);
    const azR = pose.azimuthRange ?? 0.4;
    const poR = pose.polarRange ?? 0.25;

    // Limits first (they clamp the destination, not the current position).
    c.minAzimuthAngle = az - azR;
    c.maxAzimuthAngle = az + azR;
    c.minPolarAngle = Math.max(0.12, polar - poR);
    c.maxPolarAngle = Math.min(1.42, polar + poR);
    c.minDistance = dist * 0.55;
    c.maxDistance = dist * 1.35;

    if (first.current) {
      first.current = false;
      // One-time "settle": start higher and further out, then descend into place.
      const start = rel.clone().multiplyScalar(1.22).add(new THREE.Vector3(0, 3, 0)).add(t);
      c.setLookAt(start.x, start.y, start.z, t.x, t.y, t.z, false);
      if (reduced) c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, false);
      else {
        c.smoothTime = 0.9;
        c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, true).then(() => {
          if (controls.current) controls.current.smoothTime = 0.42;
        });
      }
      return;
    }
    c.smoothTime = 0.42;
    c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, !reduced);
  }, [view, reduced, panelOpen, phone, panelW, size.width, size.height]);

  // Panel-aware framing: shift the projection so the focus sits in the visible area.
  useFrame((_, dt) => {
    const o = offset.current;
    // Home on wide screens: nudge the board right so it clears the hero text.
    const heroShift = !panelOpen && size.width >= 1024 ? -Math.min(230, size.width * 0.14) : 0;
    const tx = panelOpen && !phone ? (panelW + 16) / 2 : heroShift;
    const ty = panelOpen && phone ? size.height * 0.2 : 0;
    const st = reduced ? 0.0001 : 0.35;
    let moving = easing.damp(o, "x", tx, st, Math.min(dt, 0.05));
    moving = easing.damp(o, "y", ty, st, Math.min(dt, 0.05)) || moving;
    if (Math.abs(o.x) < 0.5 && Math.abs(o.y) < 0.5) {
      if (camera.view?.enabled) camera.clearViewOffset();
    } else {
      camera.setViewOffset(size.width, size.height, o.x, o.y, size.width, size.height);
    }
    if (moving) invalidate();
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.42}
      draggingSmoothTime={0.14}
      dollySpeed={0.45}
      azimuthRotateSpeed={0.55}
      polarRotateSpeed={0.55}
      mouseButtons={{
        left: CameraControlsImpl.ACTION.ROTATE,
        middle: CameraControlsImpl.ACTION.NONE,
        right: CameraControlsImpl.ACTION.NONE,
        wheel: CameraControlsImpl.ACTION.DOLLY,
      }}
      touches={{
        one: phone ? CameraControlsImpl.ACTION.NONE : CameraControlsImpl.ACTION.TOUCH_ROTATE,
        two: phone ? CameraControlsImpl.ACTION.NONE : CameraControlsImpl.ACTION.TOUCH_DOLLY,
        three: CameraControlsImpl.ACTION.NONE,
      }}
    />
  );
}
