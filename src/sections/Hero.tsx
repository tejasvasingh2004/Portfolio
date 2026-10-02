import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { aiSystems } from "@/data/aiSystems";
import { experience } from "@/data/experience";
import { ButtonLink } from "@/components/ui/primitives";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="pointer-events-none relative z-10 px-5 pt-[calc(var(--topbar-h)+20px)] sm:px-8 sm:pt-[calc(var(--topbar-h)+40px)] lg:px-12"
    >
      <div className="pointer-events-auto max-w-[520px] [&>*]:animate-[rise_640ms_var(--ease-out)_both]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1 text-[12px] text-ink-2 ring-1 ring-line backdrop-blur">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" />
          {profile.status}
        </p>
        <h1 id="hero-title" className="text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] text-ink [animation-delay:60ms] sm:text-[56px]">
          {profile.name}
        </h1>
        <p className="mt-3 text-[17px] font-medium text-ink [animation-delay:120ms] sm:text-[19px]">{profile.title}</p>
        <p className="mt-2 max-w-[440px] text-[15px] leading-relaxed text-ink-2 [animation-delay:160ms] sm:text-[16px]">
          {profile.tagline}
        </p>
        <div className="mt-6 flex flex-wrap gap-2 [animation-delay:220ms]">
          <ButtonLink href="/ai" variant="primary" icon="network">
            Explore the AI Lab
          </ButtonLink>
          <ButtonLink href="/projects" icon="folder">
            Projects
          </ButtonLink>
          <ButtonLink href={profile.resume} icon="file-down" variant="ghost" download>
            Résumé
          </ButtonLink>
        </div>
        <p className="only-3d mt-6 hidden font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 [animation-delay:300ms] lg:block">
          Drag to orbit · Scroll to zoom · Click any module · <kbd className="font-mono">⌘K</kbd> to jump
        </p>
        <dl className="only-2d mt-8 grid max-w-[420px] grid-cols-3 gap-2">
          <Stat k="Projects" v={projects.length} />
          <Stat k="AI systems" v={aiSystems.length} />
          <Stat k="Roles" v={experience.length} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: number }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2.5 ring-1 ring-line">
      <dd className="text-[22px] font-semibold tracking-[-0.02em]">{v}</dd>
      <dt className="text-[12px] text-ink-3">{k}</dt>
    </div>
  );
}
