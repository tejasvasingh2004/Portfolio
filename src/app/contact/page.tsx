import type { Metadata } from "next";
import { Panel } from "@/components/panels/Panel";
import { ContactView } from "@/sections/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, GitHub, LinkedIn and LeetCode for Tejasva Singh Chouhan.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Panel kicker="Contact" title="Let's build something" back={{ href: "/", label: "Workspace" }}>
      <ContactView />
    </Panel>
  );
}
