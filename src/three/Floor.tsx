"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Unlit board with a faint 1-unit grid that dissolves into the page background,
 * so the scene has no visible edge (spec §3). It bypasses tone mapping (but keeps the
 * output colour-space conversion) so the far floor matches the CSS background exactly.
 */
export function Floor() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        toneMapped: false,
        uniforms: {
          uBg: { value: new THREE.Color("#f4f4f2") },
          uBoard: { value: new THREE.Color("#efefec") },
          uGrid: { value: new THREE.Color("#e3e3df") },
        },
        vertexShader: /* glsl */ `
          varying vec2 vXZ;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vXZ = world.xz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uBg; uniform vec3 uBoard; uniform vec3 uGrid;
          varying vec2 vXZ;
          void main() {
            // Circular falloff matched to the radial board.
            float r = length(vXZ) / 15.5;
            float board = 1.0 - smoothstep(0.55, 1.15, r);
            vec2 g = abs(fract(vXZ - 0.5) - 0.5) / fwidth(vXZ);
            float line = 1.0 - min(min(g.x, g.y), 1.0);
            vec3 col = mix(uBg, uBoard, board);
            col = mix(col, uGrid, line * board * 0.55);
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material} raycast={() => null}>
      <planeGeometry args={[140, 140]} />
    </mesh>
  );
}
