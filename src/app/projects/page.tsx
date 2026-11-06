import type { Metadata } from "next";
import { Panel } from "@/components/panels/Panel";
import { ProjectsIndex } from "@/sections/Projects";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: `Things I've built: ${projects.map((p) => p.title).join(", ")}.`,
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <Panel
      kicker={`Projects · ${projects.length}`}
      title="Things I've built"
      subtitle="From a database engine's B+ Tree to a production AI agent runtime."
      back={{ href: "/", label: "Workspace" }}
    >
      <ProjectsIndex />
    </Panel>
  );
}
