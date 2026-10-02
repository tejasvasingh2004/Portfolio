import { use } from "react";
import { buildAtlas, type Atlas } from "./atlas";
import type { IconName } from "@/lib/icons";
import { aiSystems } from "@/data/aiSystems";
import { clusters, skills } from "@/data/skills";

const ICONS: IconName[] = [
  "activity", "brain", "briefcase", "check-check", "check", "cpu", "database", "eye", "file-code", "file-down",
  "filter", "folder", "gauge", "git-branch", "keyboard", "layers", "layout", "list-checks", "mail", "message",
  "network", "scan-text", "send", "shield-check", "sparkles", "terminal", "user", "utensils", "waves",
  "github", "linkedin", "leetcode",
];

/** Every short label that appears on a 3D surface — derived from content data. */
function labels(): string[] {
  return [
    ...skills.map((s) => s.label),
    ...clusters.map((c) => c.label.toUpperCase()),
    ...aiSystems.flatMap((s) => [s.title, ...s.nodes.map((n) => n.label), ...(s.states ?? []).map((st) => st.label.toUpperCase())]),
    "WORKLOAD",
  ];
}

let promise: Promise<Atlas> | null = null;

/** Suspends until the shared atlas is ready (built once per page load). */
export function useAtlas(): Atlas {
  if (!promise) promise = buildAtlas(ICONS, labels());
  return use(promise);
}
