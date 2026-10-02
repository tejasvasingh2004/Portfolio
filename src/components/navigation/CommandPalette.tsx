"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useView } from "@/store/viewStore";
import { zoneMeta, zoneOrder } from "@/lib/view";
import { projects } from "@/data/projects";
import { aiSystems } from "@/data/aiSystems";
import { skills } from "@/data/skills";
import { links, profile } from "@/data/profile";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import { getMode, setMode, setMotion } from "@/lib/prefs";

const zoneIcons: Record<string, IconName> = {
  about: "user",
  projects: "folder",
  ai: "network",
  experience: "briefcase",
  skills: "keyboard",
  contact: "mail",
};

export function CommandPalette() {
  const open = useView((s) => s.paletteOpen);
  const setOpen = useView((s) => s.setPaletteOpen);
  const reduced = useView((s) => s.reducedMotion);
  const router = useRouter();

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const ext = (href: string) => {
    setOpen(false);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[60] bg-[rgb(18_18_20/0.12)] backdrop-blur-[2px] animate-[fade_200ms_ease-out]"
      contentClassName="fixed left-1/2 top-[12vh] z-[61] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-float)] ring-1 ring-line animate-[rise_260ms_var(--ease-out)]"
    >
      <div className="flex items-center gap-2 border-b border-line px-4">
        <span className="text-ink-3" aria-hidden>
          ⌘
        </span>
        <Command.Input
          autoFocus
          placeholder="Jump to a project, system, skill or link…"
          className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="rounded bg-surface-2 px-1.5 font-mono text-[10.5px] text-ink-3 ring-1 ring-line">esc</kbd>
      </div>
      <Command.List className="scroll-quiet max-h-[min(420px,60vh)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:label-mono [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3">
        <Command.Empty className="px-3 py-6 text-center text-[14px] text-ink-3">Nothing matches that.</Command.Empty>

        <Command.Group heading="Workspace">
          <Item icon="layout" onSelect={() => go("/")} hint="H">
            Overview
          </Item>
          {zoneOrder.map((z) => (
            <Item key={z} icon={zoneIcons[z]} onSelect={() => go(zoneMeta[z].href)} hint={zoneMeta[z].key}>
              {zoneMeta[z].label}
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="Projects">
          {projects.map((p) => (
            <Item key={p.slug} icon="folder" onSelect={() => go(`/projects/${p.slug}`)} keywords={[p.subtitle, p.category]}>
              {p.title} <span className="text-ink-3">— {p.subtitle}</span>
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="AI systems">
          {aiSystems.map((s) => (
            <Item key={s.id} icon="network" onSelect={() => go(`/ai/${s.id}`)} keywords={[s.kicker]}>
              {s.title} <span className="text-ink-3">— {s.kicker}</span>
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="Contact">
          <Item icon="mail" onSelect={() => { setOpen(false); window.location.href = `mailto:${links.email}`; }} keywords={["email", "mail"]}>
            Email {links.email}
          </Item>
          <Item icon="github" onSelect={() => ext(links.github)}>GitHub</Item>
          <Item icon="linkedin" onSelect={() => ext(links.linkedin)}>LinkedIn</Item>
          <Item icon="leetcode" onSelect={() => ext(links.leetcode)}>LeetCode</Item>
          <Item icon="file-down" onSelect={() => ext(profile.resume)} keywords={["cv", "resume"]}>
            Résumé (PDF)
          </Item>
        </Command.Group>

        <Command.Group heading="Skills">
          {skills.map((s) => (
            <Item key={s.id} icon="keyboard" onSelect={() => go(`/skills?skill=${s.id}`)}>
              {s.label}
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="Preferences">
          <Item icon="layers" onSelect={() => { setMode(getMode() === "2d" ? "3d" : "2d"); setOpen(false); }}>
            Switch 2D / 3D view
          </Item>
          <Item icon="waves" onSelect={() => { setMotion(!reduced); setOpen(false); }}>
            {reduced ? "Allow motion" : "Reduce motion"}
          </Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({
  children,
  icon,
  onSelect,
  hint,
  keywords,
}: {
  children: React.ReactNode;
  icon: IconName;
  onSelect: () => void;
  hint?: string;
  keywords?: string[];
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-[14px] text-ink-2 data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
    >
      <Icon name={icon} size={16} className="shrink-0 text-ink-3" />
      <span className="flex-1 truncate">{children}</span>
      {hint && <kbd className="rounded bg-surface-2 px-1.5 font-mono text-[10.5px] text-ink-3 ring-1 ring-line">{hint}</kbd>}
    </Command.Item>
  );
}
