"use client";

import { ZoneLabels } from "./ZoneLabels";
import { ItemLabels } from "./ItemLabels";
import { ObjectProxyNav } from "./ObjectProxyNav";

/**
 * DOM overlays that depend on scene layout (and therefore on three.js).
 * Loaded lazily together with the scene so three.js stays out of the initial bundle.
 */
export default function Overlays() {
  return (
    <>
      <ZoneLabels />
      <ItemLabels />
      <ObjectProxyNav />
    </>
  );
}
