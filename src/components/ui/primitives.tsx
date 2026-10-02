import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/icons";
import { skillById, type SkillId } from "@/data/skills";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Tag({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em]",
        tone === "accent" ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-ink-2 ring-1 ring-line",
      )}
    >
      {children}
    </span>
  );
}

export function SkillChips({ ids, link = true }: { ids: readonly SkillId[]; link?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {ids.map((id) => {
        const label = skillById[id]?.label ?? id;
        const cls =
          "inline-flex h-7 items-center rounded-lg bg-surface-2 px-2.5 text-[13px] text-ink-2 ring-1 ring-line transition-colors";
        return (
          <li key={id}>
            {link ? (
              <Link href={`/skills?skill=${id}`} className={cn(cls, "hover:text-ink hover:ring-line-strong")}>
                {label}
              </Link>
            ) : (
              <span className={cls}>{label}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
  download?: boolean;
  className?: string;
};

export function ButtonLink({ href, children, icon, variant = "secondary", external, download, className }: ButtonProps) {
  const cls = cn(
    "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-[background,box-shadow,color] duration-200",
    variant === "primary" && "bg-ink text-white hover:bg-[#2a2a2e]",
    variant === "secondary" && "bg-surface text-ink ring-1 ring-line hover:ring-line-strong shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
    variant === "ghost" && "text-ink-2 hover:text-ink",
    className,
  );
  const content = (
    <>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {external && <span aria-hidden className="text-ink-3">↗</span>}
    </>
  );
  if (external || download || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(download ? { download: "" } : {})}
      >
        {content}
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="border-t border-line pt-5">
      <h3 id={id} className="label-mono mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="relative pl-4 text-[15px] leading-relaxed text-ink-2">
          <span aria-hidden className="absolute left-0 top-[0.7em] h-1 w-1 rounded-full bg-accent" />
          {t}
        </li>
      ))}
    </ul>
  );
}
