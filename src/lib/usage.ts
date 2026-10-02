import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import type { SkillId } from "@/data/skills";

/** Where a skill was used — derived from project and role stacks, never duplicated by hand. */
export function skillUsage(id: SkillId) {
  return {
    projects: projects.filter((p) => p.stack.includes(id)),
    roles: experience.filter((r) => r.stack.includes(id)),
  };
}

export function usageCount(id: SkillId) {
  const u = skillUsage(id);
  return u.projects.length + u.roles.length;
}
