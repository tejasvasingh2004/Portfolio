import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { aiSystems } from "@/data/aiSystems";
import { experience } from "@/data/experience";
import { ButtonLink } from "@/components/ui/primitives";

/**
 * Overview intro. In 3D mode it's a compact floating card (the workspace is the hero);
 * in the 2D fallback it's the page header.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero-wrap pointer-events-none relative z-10 px-3 pt-[76px] sm:px-5 sm:pt-[88px]"
    >
      <div className="hero-card pointer-events-auto w-full max-w-[400px] animate-[rise_700ms_var(--ease-out)_both] rounded-[22px] bg-surface/85 p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_44px_-18px_rgb(0_0_0/0.22)] ring-1 ring-line backdrop-blur-xl sm:p-6">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-medium text-accent-ink">
          <span aria-hidden className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          {profile.status}
        </p>
        <h1 id="hero-title" className="text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[36px]">
          {profile.name}
        </h1>
        <p className="mt-2 text-[15px] font-medium text-ink">{profile.title}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{profile.tagline}</p>

        <dl className="mt-4 hidden grid-cols-3 divide-x sm:grid divide-line rounded-xl bg-surface-2 ring-1 ring-line">
          <Stat k="Projects" v={projects.length} />
          <Stat k="AI systems" v={aiSystems.length} />
          <Stat k="Roles" v={experience.length} />
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/ai" variant="primary" icon="network">
            Explore the AI Lab
          </ButtonLink>
          <ButtonLink href="/projects" icon="folder">
            Projects
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex flex-col-reverse px-3 py-2">
      <dt className="text-[11.5px] text-ink-3">{k}</dt>
      <dd className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{v}</dd>
    </div>
  );
}
