"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { useView, type Tier } from "@/store/viewStore";
import { CameraRig } from "./CameraRig";
import { Floor } from "./Floor";
import { Hub } from "./objects/Hub";
import { HubTraces } from "./objects/HubTraces";
import { ProjectsZone } from "./objects/ProjectsZone";
import { AiLab } from "./objects/AiLab";
import { SkillsZone } from "./objects/SkillsZone";
import { ExperienceZone } from "./objects/ExperienceZone";
import { ContactZone } from "./objects/ContactZone";
import { MobileScene } from "./mobile/MobileScene";
import { useAtlas } from "./useAtlas";
import { tooltipElement } from "./Tooltip";

type Quality = "high" | "medium" | "low";

function Lighting({ quality }: { quality: Quality }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[7, 14, 9]} intensity={1.25} color="#fffaf4" />
      <Environment resolution={quality === "high" ? 256 : 128} frames={1} environmentIntensity={0.9}>
        {/* Soft studio: big overhead key, a thin rim strip, warm low fill. */}
        <Lightformer form="rect" intensity={2.4} position={[-4, 8, 4]} rotation-x={Math.PI / 2} scale={[14, 10, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[10, 3, 0]} rotation-y={-Math.PI / 2} scale={[2, 12, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#ffe2cc" position={[0, 1, 12]} scale={[16, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-10, 4, -6]} rotation-y={Math.PI / 2} scale={[10, 6, 1]} />
      </Environment>
    </>
  );
}

/** Pre-compiles shaders, then reports the scene as ready (removes the boot log). */
function Ready() {
  const { gl, scene, camera, invalidate } = useThree();
  useAtlas();
  useEffect(() => {
    useView.getState().setBootStage(2);
    let cancelled = false;
    const finish = () => {
      if (!cancelled) {
        useView.getState().setSceneReady();
        invalidate();
      }
    };
    // compileAsync lets the browser compile programs without blocking the main thread.
    if ("compileAsync" in gl) gl.compileAsync(scene, camera).then(finish, finish);
    else {
      (gl as THREE.WebGLRenderer).compile(scene, camera);
      finish();
    }
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera, invalidate]);
  return null;
}

/** Marks the workspace as built once the atlas (and fonts) are ready. */
function Built() {
  useAtlas();
  useEffect(() => useView.getState().setBootStage(1), []);
  return null;
}

/** Keeps the DOM tooltip glued to its 3D anchor while the camera moves. */
function TooltipTracker() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = new THREE.Vector3();
  useFrame(() => {
    const el = tooltipElement.current;
    const tip = useView.getState().tooltip;
    if (!el || !tip) return;
    v.copy(tip.anchor).project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, calc(-100% - 10px))`;
  });
  return null;
}

/** Re-render once when the tooltip target changes so the tracker positions it immediately. */
function TooltipInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  const tip = useView((s) => s.tooltip);
  useEffect(() => {
    invalidate();
  }, [tip, invalidate]);
  return null;
}

export default function Scene({ tier, panelOpen, phone }: { tier: Exclude<Tier, "none">; panelOpen: boolean; phone: boolean }) {
  const quality: Quality = tier;
  const [dprMax, setDprMax] = useState(quality === "high" ? 2 : 1.5);
  const smoothness = quality === "low" ? 2 : 4;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, quality === "low" ? 1 : dprMax]}
      camera={{ fov: 28, near: 0.5, far: 220, position: [16, 22, 26] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDprMax(1)} flipflops={2} />
      <Lighting quality={quality} />
      <Floor />
      <Suspense fallback={null}>
        <Built />
        {phone ? (
          <MobileScene smoothness={smoothness} />
        ) : (
          <>
            <Hub quality={quality} />
            <HubTraces />
            <ProjectsZone smoothness={smoothness} />
            <AiLab smoothness={smoothness} />
            <SkillsZone smoothness={smoothness} />
            <ExperienceZone smoothness={smoothness} />
            <ContactZone smoothness={smoothness} />
          </>
        )}
        <ContactShadows
          position={[0, 0.004, 0]}
          scale={phone ? 18 : 34}
          resolution={quality === "high" ? 1024 : 512}
          blur={2.4}
          opacity={0.42}
          far={4.5}
          color="#2a2420"
          frames={quality === "low" ? 1 : Infinity}
        />
        <Ready />
      </Suspense>
      {!phone && <CameraRig panelOpen={panelOpen} />}
      <TooltipTracker />
      <TooltipInvalidator />
    </Canvas>
  );
}
