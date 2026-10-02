import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Panel } from "@/components/panels/Panel";
import { ProjectDetail } from "@/sections/Projects";
import { projects, projectBySlug } from "@/data/projects";
import { profile } from "@/data/profile";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.title} — ${p.subtitle}`,
    description: p.tagline,
    alternates: { canonical: `/projects/${p.slug}` },
    // Overriding openGraph drops the inherited file-based image, so restate it.
    openGraph: { title: p.title, description: p.tagline, images: ["/opengraph-image.png"] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const prev = projects[i - 1];
  const next = projects[i + 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: p.title,
    description: p.tagline,
    codeRepository: p.links.github,
    author: { "@type": "Person", name: profile.name },
  };

  return (
    <Panel
      kicker={p.subtitle}
      title={p.title}
      back={{ href: "/projects", label: "Projects" }}
      pager={{
        prev: prev && { href: `/projects/${prev.slug}`, label: prev.title },
        next: next && { href: `/projects/${next.slug}`, label: next.title },
        position: `${i + 1} / ${projects.length}`,
      }}
    >
      <ProjectDetail project={p} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </Panel>
  );
}
