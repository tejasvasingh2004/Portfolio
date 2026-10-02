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
import { aboutPose, homePose, localZonePoses, toWorld, type CameraPose, type ModuleId, type V3 } from "./layout";
import { cardPosition, MONITOR_LOCAL } from "./objects/ProjectsZone";
import { nodePosition } from "./objects/AiLab";

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Local pose → world pose for a module. */
function worldPose(id: ModuleId, local: CameraPose): CameraPose {
  return { position: toWorld(id, local.position), target: toWorld(id, local.target) };
}

/** Camera pose for a route (spec §6). Modules face outward, so the camera stands outside, looking in. */
function poseFor(view: View): CameraPose {
  if (view.zone === "home") return homePose;
  if (view.zone === "about") return aboutPose;
  if (view.zone === "projects" && view.item) {
    const i = projects.findIndex((p) => p.slug === view.item);
    if (i >= 0) {
      const card = cardPosition(i);
      const target: V3 = [card[0] * 0.35, 1.25, (MONITOR_LOCAL[2] + card[2]) / 2];
      return worldPose("projects", { position: add(target, [card[0] * 0.25, 6.0, 10.2]), target });
    }
  }
  if (view.zone === "ai" && view.item && view.node) {
    const s = aiSystemById(view.item);
    if (s?.nodes.some((n) => n.id === view.node)) {
      const p = nodePosition(s, view.node);
      const target: V3 = [p[0], 0.3, p[2]];
      return worldPose("ai", { position: add(target, [0.4, 7.6, 8.0]), target });
    }
  }
  return worldPose(view.zone, localZonePoses[view.zone]);
}

/** Narrow viewports (or a side panel eating width) pull the camera back so framing holds. */
function fitScale(aspect: number, home: boolean) {
  const ideal = home ? 1.45 : 1.35;
  return THREE.MathUtils.clamp(ideal / aspect, 1, home ? 2.6 : 2.2);
}

/** Pan bounds: the target can roam over the board but never off into empty space. */
const BOUNDARY = new THREE.Box3(new THREE.Vector3(-13, 0, -13), new THREE.Vector3(13, 4, 13));

export function CameraRig({ panelOpen }: { panelOpen: boolean }) {
  const controls = useRef<CameraControlsImpl>(null);
  const view = useView((s) => s.view);
  const reduced = useView((s) => s.reducedMotion);
  const recenter = useView((s) => s.recenterTick);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const domElement = useThree((s) => s.gl.domElement);
  const first = useRef(true);
  const offset = useRef({ x: 0, y: 0 });
  const lastInput = useRef(0);

  const phone = size.width < 640;
  const panelW = phone ? 0 : size.width < 1024 ? 380 : 440;

  // Bounds + user-input tracking (idle auto-rotate, "recenter" affordance).
  useEffect(() => {
    const c = controls.current;
    c?.setBoundary(BOUNDARY);
    const mark = () => {
      lastInput.current = performance.now();
    };
    const onStart = () => {
      mark();
      useView.getState().setCameraDirty(true);
    };
    domElement.addEventListener("pointerdown", mark);
    domElement.addEventListener("wheel", mark, { passive: true });
    c?.addEventListener("controlstart", onStart);
    return () => {
      domElement.removeEventListener("pointerdown", mark);
      domElement.removeEventListener("wheel", mark);
      c?.removeEventListener("controlstart", onStart);
    };
  }, [domElement]);

  // Fly to the pose for the current route (and on "recenter").
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const pose = poseFor(view);
    const home = view.zone === "home";
    const effW = panelOpen && !phone ? size.width - panelW - 32 : size.width;
    const effH = panelOpen && phone ? size.height * 0.55 : size.height;
    const k = fitScale(effW / effH, home);

    const t = new THREE.Vector3(...pose.target);
    const rel = new THREE.Vector3(...pose.position).sub(t).multiplyScalar(k);
    const dist = rel.length();
    let theta = Math.atan2(rel.x, rel.z);
    const phi = Math.acos(THREE.MathUtils.clamp(rel.y / dist, -1, 1));

    useView.getState().setCameraDirty(false);
    lastInput.current = performance.now();

    if (first.current) {
      first.current = false;
      // One-time "settle": swing in from a quarter-turn away to show the board is 360°.
      const start = new THREE.Vector3().setFromSphericalCoords(dist * 1.25, phi * 0.85, theta - 0.9).add(t);
      c.setLookAt(start.x, start.y, start.z, t.x, t.y, t.z, false);
      if (reduced) {
        const p = rel.clone().add(t);
        c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, false);
        return;
      }
      c.smoothTime = 1.0;
    } else {
      c.smoothTime = 0.55;
    }

    // Take the short way round: pick the equivalent azimuth nearest the current one.
    c.normalizeRotations();
    const cur = c.azimuthAngle;
    while (theta - cur > Math.PI) theta -= Math.PI * 2;
    while (theta - cur < -Math.PI) theta += Math.PI * 2;

    const animate = !reduced;
    void c.moveTo(t.x, t.y, t.z, animate);
    void c.rotateTo(theta, phi, animate);
    void c.dollyTo(dist, animate);
    invalidate();
  }, [view, reduced, panelOpen, phone, panelW, size.width, size.height, recenter, invalidate]);

  useFrame((_, dt) => {
    const c = controls.current;
    const delta = Math.min(dt, 0.05);

    // Idle auto-rotate on the overview: a slow turntable after 7 s without input.
    if (c && !reduced && view.zone === "home" && !useView.getState().hovered) {
      if (performance.now() - lastInput.current > 7000) {
        void c.rotate(0.07 * delta, 0, false);
        invalidate();
      }
    }

    // Panel-aware framing: shift the projection so the focus sits in the visible area.
    const o = offset.current;
    // Overview on wide screens: nudge the board right so it clears the hero card.
    const heroShift = !panelOpen && size.width >= 1024 ? -Math.min(210, size.width * 0.13) : 0;
    const tx = panelOpen && !phone ? (panelW + 16) / 2 : heroShift;
    const ty = phone ? (panelOpen ? size.height * 0.2 : -size.height * 0.1) : 0;
    const st = reduced ? 0.0001 : 0.35;
    let moving = easing.damp(o, "x", tx, st, delta);
    moving = easing.damp(o, "y", ty, st, delta) || moving;
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
      smoothTime={0.55}
      draggingSmoothTime={0.12}
      dollySpeed={0.5}
      truckSpeed={1.2}
      azimuthRotateSpeed={0.7}
      polarRotateSpeed={0.6}
      minPolarAngle={0.22}
      maxPolarAngle={1.32}
      minDistance={4.5}
      maxDistance={46}
      dollyToCursor
      boundaryEnclosesCamera={false}
      mouseButtons={{
        left: CameraControlsImpl.ACTION.ROTATE,
        middle: CameraControlsImpl.ACTION.DOLLY,
        right: CameraControlsImpl.ACTION.TRUCK,
        wheel: CameraControlsImpl.ACTION.DOLLY,
      }}
      touches={{
        one: CameraControlsImpl.ACTION.TOUCH_ROTATE,
        two: CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK,
        three: CameraControlsImpl.ACTION.TOUCH_TRUCK,
      }}
    />
  );
}
