"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useMemo, useState } from "react";
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
import { Decor } from "./objects/Decor";
import { useAtlas } from "./useAtlas";
import { tooltipElement } from "./Tooltip";
import { ZoneLabelTracker } from "./ZoneLabels";
import { ItemLabelTracker } from "./ItemLabels";

type Quality = "high" | "medium" | "low";

export const BG = "#f4f4f2";

function Lighting({ quality }: { quality: Quality }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 16, 5]} intensity={1.35} color="#fffaf4" />
      {/* Studio light from every side, so the board reads well from any orbit angle. */}
      <Environment resolution={quality === "high" ? 256 : 128} frames={1} environmentIntensity={1.1}>
        <Lightformer form="rect" intensity={2.6} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[18, 18, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[12, 3, 0]} rotation-y={-Math.PI / 2} scale={[3, 14, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-12, 3, 0]} rotation-y={Math.PI / 2} scale={[3, 14, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#ffe2cc" position={[0, 2, 12]} scale={[18, 3, 1]} />
        <Lightformer form="rect" intensity={0.7} position={[0, 2, -12]} rotation-y={Math.PI} scale={[18, 3, 1]} />
      </Environment>
    </>
  );
}

/** Post-processing tuned for a white product render: soft AO in the crevices, bloom only on HDR orange. */
function Effects({ quality, aoOn }: { quality: Quality; aoOn: boolean }) {
  const effects = useMemo(() => {
    // Debug: ?fx=ao,bloom limits the stack (for tuning); default is everything the tier allows.
    const fx = new URLSearchParams(window.location.search).get("fx");
    const want = (k: string) => !fx || fx.split(",").includes(k);
    const list = [];
    if (aoOn && want("ao")) {
      list.push(
        <N8AO
          key="ao"
          halfRes
          quality={quality === "high" ? "medium" : "performance"}
          aoRadius={1.2}
          distanceFalloff={0.8}
          intensity={2.4}
          color="#3a3028"
        />,
      );
    }
    // Threshold sits above lit white surfaces, so only the HDR orange accents bloom.
    if (want("bloom")) list.push(<Bloom key="bloom" mipmapBlur luminanceThreshold={2.4} luminanceSmoothing={0.05} intensity={0.75} radius={0.65} />);
    // No tilt-shift / depth-of-field: they blur text, and legibility wins.
    list.push(<ToneMapping key="tm" mode={ToneMappingMode.NEUTRAL} />);
    list.push(<SMAA key="smaa" />);
    return list;
  }, [quality, aoOn]);
  if (quality === "low") return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
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
    gl.compileAsync(scene, camera).then(finish, finish);
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
  const v = useMemo(() => new THREE.Vector3(), []);
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

/** Re-render when hover/route state changes so DOM overlays are positioned immediately. */
function OverlayInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  const tip = useView((s) => s.tooltip);
  const view = useView((s) => s.view);
  const workload = useView((s) => s.workload);
  const skillFocus = useView((s) => s.skillFocus);
  const ready = useView((s) => s.sceneReady);
  useEffect(() => {
    // Next frame, once the DOM labels for the new state exist.
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [tip, view, workload, skillFocus, ready, invalidate]);
  return null;
}

export default function Scene({ tier, panelOpen }: { tier: Exclude<Tier, "none">; panelOpen: boolean }) {
  const quality: Quality = tier;
  const [dprMax, setDprMax] = useState(quality === "high" ? 2 : 1.5);
  const [aoOn, setAoOn] = useState(quality !== "low");
  const smoothness = quality === "low" ? 2 : 4;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, quality === "low" ? 1 : dprMax]}
      camera={{ fov: 30, near: 0.5, far: 260, position: [0, 24, 34] }}
      gl={{ antialias: quality === "low", alpha: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        scene.background = new THREE.Color(BG);
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => {
          // Degrade gracefully: drop resolution first, then ambient occlusion.
          if (dprMax > 1) setDprMax(1);
          else setAoOn(false);
        }}
      />
      <Lighting quality={quality} />
      <Floor />
      <Suspense fallback={null}>
        <Built />
        <Hub quality={quality} />
        <HubTraces />
        <ProjectsZone smoothness={smoothness} />
        <AiLab smoothness={smoothness} />
        <SkillsZone smoothness={smoothness} />
        <ExperienceZone smoothness={smoothness} />
        <ContactZone smoothness={smoothness} />
        <Decor />
        <ContactShadows
          position={[0, 0.004, 0]}
          scale={40}
          resolution={quality === "high" ? 1024 : 512}
          blur={2.6}
          opacity={0.38}
          far={5}
          color="#2a2420"
          frames={quality === "low" ? 1 : Infinity}
        />
        <Ready />
      </Suspense>
      <CameraRig panelOpen={panelOpen} />
      <TooltipTracker />
      <ZoneLabelTracker />
      <ItemLabelTracker />
      <OverlayInvalidator />
      <Effects quality={quality} aoOn={aoOn} />
    </Canvas>
  );
}
