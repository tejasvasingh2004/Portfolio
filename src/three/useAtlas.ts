import { use } from "react";
import { buildAtlas, type Atlas } from "./atlas";
import type { IconName } from "@/lib/icons";

const ICONS: IconName[] = [
  "activity", "brain", "briefcase", "check-check", "check", "cpu", "database", "eye", "file-code", "file-down",
  "filter", "folder", "gauge", "git-branch", "keyboard", "layers", "layout", "list-checks", "mail", "message",
  "network", "scan-text", "send", "shield-check", "sparkles", "terminal", "user", "utensils", "waves",
  "users", "wrench", "radio",
  "github", "linkedin", "leetcode",
];

let promise: Promise<Atlas> | null = null;

/**
 * Suspends until the shared icon atlas is ready (built once per page load).
 * Text on 3D surfaces is SDF text (see TileText), so the atlas holds icons only.
 */
export function useAtlas(): Atlas {
  if (!promise) promise = buildAtlas(ICONS, []);
  return use(promise);
}
