import type { Metadata } from "next";
import { Panel } from "@/components/panels/Panel";
import { ExperienceTimeline } from "@/sections/Experience";
import { OpenSourceList } from "@/sections/OpenSource";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Open-source fixes merged into Headlamp (Kubernetes SIGs) and more; research at NIT Bhopal on multilingual vision-language models; backend internships at IndhanPay and E-NOTEBOOK.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <Panel kicker="Experience" title="Where I've worked" back={{ href: "/", label: "Workspace" }}>
      <ExperienceTimeline />
      <OpenSourceList />
    </Panel>
  );
}
