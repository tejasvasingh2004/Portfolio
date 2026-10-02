import { Panel } from "@/components/panels/Panel";
import { ButtonLink } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Panel kicker="404" title="Nothing wired here" back={{ href: "/", label: "Workspace" }}>
      <p className="text-[15px] leading-relaxed text-ink-2">That route isn&apos;t connected to anything in the workspace.</p>
      <ButtonLink href="/" variant="primary">
        Back to the workspace
      </ButtonLink>
    </Panel>
  );
}
