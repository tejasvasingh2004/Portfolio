import { profile, education, links } from "@/data/profile";
import { ButtonLink, Section } from "@/components/ui/primitives";

export function About() {
  return (
    <>
      <div className="flex items-center gap-4">
        <picture>
          <source srcSet="/assets/profile/tejasva.avif" type="image/avif" />
          <img
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            width={88}
            height={88}
            className="h-[88px] w-[88px] rounded-2xl object-cover ring-1 ring-line"
          />
        </picture>
        <dl className="space-y-1 text-[14px]">
          <div className="flex gap-2">
            <dt className="sr-only">Location</dt>
            <dd className="text-ink-2">{profile.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Status</dt>
            <dd className="inline-flex items-center gap-2 text-ink">
              <span aria-hidden className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" />
              {profile.status}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        {profile.longBio.map((p) => (
          <p key={p.slice(0, 24)} className="text-[15px] leading-relaxed text-ink-2">
            {p}
          </p>
        ))}
      </div>

      <Section title="Education" id="about-edu">
        <div className="rounded-xl bg-surface-2 p-4 ring-1 ring-line">
          <p className="font-medium text-ink">{education.institution}</p>
          <p className="mt-0.5 text-[14px] text-ink-2">
            {education.degree} · {education.period}
          </p>
          <p className="mt-0.5 text-[14px] text-ink-2">
            {education.location} · CGPA {education.cgpa}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
            Coursework: {education.coursework.join(" · ")}
          </p>
        </div>
      </Section>

      <Section title="Elsewhere" id="about-links">
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={profile.resume} icon="file-down" variant="primary" download>
            Résumé
          </ButtonLink>
          <ButtonLink href={links.github} icon="github" external>
            GitHub
          </ButtonLink>
          <ButtonLink href={links.linkedin} icon="linkedin" external>
            LinkedIn
          </ButtonLink>
          <ButtonLink href={links.leetcode} icon="leetcode" external>
            LeetCode
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
