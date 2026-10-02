export type Zone = "home" | "about" | "projects" | "ai" | "experience" | "skills" | "contact";

export type View = {
  zone: Zone;
  /** Project slug, AI system id, … */
  item?: string;
  /** AI node id (from ?node=) */
  node?: string;
};

export const zoneOrder: Exclude<Zone, "home">[] = ["about", "projects", "ai", "experience", "skills", "contact"];

export const zoneMeta: Record<Exclude<Zone, "home">, { label: string; href: string; key: string }> = {
  about: { label: "About", href: "/about", key: "1" },
  projects: { label: "Projects", href: "/projects", key: "2" },
  ai: { label: "AI Lab", href: "/ai", key: "3" },
  experience: { label: "Experience", href: "/experience", key: "4" },
  skills: { label: "Skills", href: "/skills", key: "5" },
  contact: { label: "Contact", href: "/contact", key: "6" },
};

export function parseView(pathname: string, node?: string | null): View {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (!first) return { zone: "home" };
  if (first in zoneMeta) {
    return { zone: first as Zone, item: second, node: node ?? undefined };
  }
  return { zone: "home" };
}

/** Where "back" goes from a view: detail → zone → home. */
export function parentHref(view: View): string {
  if (view.node && view.item) return `/ai/${view.item}`;
  if (view.item) return `/${view.zone}`;
  return "/";
}
