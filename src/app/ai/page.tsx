import type { Metadata } from "next";
import { Panel } from "@/components/panels/Panel";
import { AiOverview } from "@/sections/AI";
import { aiSystems } from "@/data/aiSystems";

export const metadata: Metadata = {
  title: "AI Lab",
  description:
    "Multi-agent systems I've designed: NeuroFlow (EEG-adaptive LangGraph agents), Traycer-mini (agentic code generation) and HTR Bench (VLM research).",
  alternates: { canonical: "/ai" },
};

export default function AiPage() {
  return (
    <Panel kicker={`AI Lab · ${aiSystems.length} systems`} title="Systems I build around AI" back={{ href: "/", label: "Workspace" }}>
      <AiOverview />
    </Panel>
  );
}
