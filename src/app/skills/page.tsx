import type { Metadata } from "next";
import { Suspense } from "react";
import { Panel } from "@/components/panels/Panel";
import { SkillsView } from "@/sections/Skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "Languages, backend, data, AI/ML and tooling — each linked to the projects and roles that used it.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <Panel kicker="Skills" title="What I build with" back={{ href: "/", label: "Workspace" }}>
      <Suspense>
        <SkillsView />
      </Suspense>
    </Panel>
  );
}
