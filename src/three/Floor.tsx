"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Unlit board with a faint 1-unit grid and still water caustics that dissolve into the page background,
 * so the scene has no visible edge (spec §3). It bypasses tone mapping (but keeps the
 * output colour-space conversion) so the far floor matches the CSS background exactly.
 */
export function Floor() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        toneMapped: false,
        uniforms: {
          uBg: { value: new THREE.Color("#e0eff7") },
          uBoard: { value: new THREE.Color("#d4e8f3") },
          uGrid: { value: new THREE.Color("#c3dbea") },
          // Strength of the still light-through-water ripples on the board (0 = none).
          uCaustic: { value: 0.45 },
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
          uniform vec3 uBg; uniform vec3 uBoard; uniform vec3 uGrid; uniform float uCaustic;
          varying vec2 vXZ;

          // Still water caustics: bright, net-like ripples of light (iterated trigonometric warp).
          float caustic(vec2 uv) {
            vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
            vec2 i = p;
            float c = 1.0;
            for (int n = 0; n < 4; n++) {
              float t = 1.0 - 3.5 / float(n + 1);
              i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
              c += 1.0 / length(vec2(p.x / (sin(i.x + t) / 0.005), p.y / (cos(i.y + t) / 0.005)));
            }
            c = 1.17 - pow(c / 4.0, 1.4);
            return clamp(pow(abs(c), 8.0), 0.0, 1.0);
          }

          void main() {
            // Circular falloff matched to the radial board.
            float r = length(vXZ) / 15.5;
            float board = 1.0 - smoothstep(0.55, 1.15, r);
            vec2 g = abs(fract(vXZ - 0.5) - 0.5) / fwidth(vXZ);
            float line = 1.0 - min(min(g.x, g.y), 1.0);
            vec3 col = mix(uBg, uBoard, board);
            col = mix(col, uGrid, line * board * 0.55);
            col = mix(col, vec3(1.0), caustic(vXZ / 7.0) * board * uCaustic);
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
