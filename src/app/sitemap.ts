import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/profile";
import { projects } from "@/data/projects";
import { aiSystems } from "@/data/aiSystems";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/projects", "/ai", "/experience", "/skills", "/contact"];
  return [
    ...routes.map((r) => ({ url: `${siteUrl}${r}`, priority: r === "" ? 1 : 0.8 })),
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, priority: 0.7 })),
    ...aiSystems.map((s) => ({ url: `${siteUrl}/ai/${s.id}`, priority: 0.7 })),
  ];
}
