import type { Metadata } from "next";
import { Panel } from "@/components/panels/Panel";
import { About } from "@/sections/About";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "About",
  description: profile.shortBio,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Panel kicker="About" title={profile.name} subtitle={profile.title} back={{ href: "/", label: "Workspace" }}>
      <About />
    </Panel>
  );
}
