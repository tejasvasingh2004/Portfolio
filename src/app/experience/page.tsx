import type { Metadata } from "next";
import { Panel } from "@/components/panels/Panel";
import { ExperienceTimeline } from "@/sections/Experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Research at NIT Bhopal on VLMs for handwritten text recognition; backend and AI automation internships at IndhanPay and E-NOTEBOOK.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <Panel kicker="Experience" title="Where I've worked" back={{ href: "/", label: "Workspace" }}>
      <ExperienceTimeline />
    </Panel>
  );
}
