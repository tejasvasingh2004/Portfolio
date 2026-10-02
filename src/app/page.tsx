import { Suspense, type ReactNode } from "react";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { ProjectsIndex } from "@/sections/Projects";
import { AiOverview } from "@/sections/AI";
import { ExperienceTimeline } from "@/sections/Experience";
import { ContactView } from "@/sections/Contact";
import { SkillsView } from "@/sections/Skills";

export default function Home() {
  return (
    <>
      <Hero />
      {/* Classic single-scroll layout for the 2D fallback (no WebGL, or chosen). */}
      <div className="only-2d mx-auto max-w-[760px] space-y-6 px-5 pb-24 pt-10">
        <Block id="about" title="About">
          <About />
        </Block>
        <Block id="ai" title="AI Lab">
          <AiOverview />
        </Block>
        <Block id="projects" title="Projects">
          <ProjectsIndex />
        </Block>
        <Block id="experience" title="Experience">
          <ExperienceTimeline />
        </Block>
        <Block id="skills" title="Skills">
          <Suspense>
            <SkillsView />
          </Suspense>
        </Block>
        <Block id="contact" title="Contact">
          <ContactView />
        </Block>
      </div>
    </>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 rounded-[20px] bg-surface p-5 ring-1 ring-line sm:p-7">
      <h2 id={`${id}-h`} className="mb-5 text-[24px] font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
