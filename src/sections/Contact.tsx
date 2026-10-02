"use client";

import { useState } from "react";
import { links, profile } from "@/data/profile";
import { ButtonLink } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";

const channels: { label: string; href: string; icon: IconName; handle: string }[] = [
  { label: "GitHub", href: links.github, icon: "github", handle: "tejasvasingh2004" },
  { label: "LinkedIn", href: links.linkedin, icon: "linkedin", handle: "tejasva-singh-chouhan" },
  { label: "LeetCode", href: links.leetcode, icon: "leetcode", handle: "tejasvasingh44" },
];

export function ContactView() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${links.email}`;
    }
  };

  return (
    <>
      <p className="text-[15px] leading-relaxed text-ink-2">
        {profile.status}. If you&apos;re building something with real systems underneath — backend, data or AI agents —
        I&apos;d like to hear about it.
      </p>

      <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
        <p className="label-mono mb-2">Email</p>
        <p className="break-all text-[17px] font-medium text-ink">{links.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ButtonLink href={`mailto:${links.email}`} icon="mail" variant="primary">
            Write an email
          </ButtonLink>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-surface px-4 text-sm font-medium text-ink ring-1 ring-line transition-shadow hover:ring-line-strong"
          >
            <Icon name={copied ? "check" : "file-code"} size={16} />
            {copied ? "Copied" : "Copy address"}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? "Email address copied" : ""}
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {channels.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line transition-shadow hover:ring-line-strong"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-ink ring-1 ring-line">
                <Icon name={c.icon} size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-medium text-ink">{c.label}</span>
                <span className="block font-mono text-[12px] text-ink-3">{c.handle}</span>
              </span>
              <span aria-hidden className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>

      <ButtonLink href={profile.resume} icon="file-down" download>
        Download résumé (PDF)
      </ButtonLink>
    </>
  );
}
