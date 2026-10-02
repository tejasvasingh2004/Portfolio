import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Panel } from "@/components/panels/Panel";
import { AiSystemView } from "@/sections/AI";
import { aiSystems, aiSystemById } from "@/data/aiSystems";

export const dynamicParams = false;

export function generateStaticParams() {
  return aiSystems.map((s) => ({ system: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/ai/[system]">): Promise<Metadata> {
  const { system } = await params;
  const s = aiSystemById(system);
  if (!s) return {};
  return { title: `${s.title} — ${s.kicker}`, description: s.summary, alternates: { canonical: `/ai/${s.id}` } };
}

export default async function AiSystemPage({ params }: PageProps<"/ai/[system]">) {
  const { system } = await params;
  const s = aiSystemById(system);
  if (!s) notFound();
  const i = aiSystems.indexOf(s);
  const prev = aiSystems[i - 1];
  const next = aiSystems[i + 1];
  return (
    <Panel
      kicker={s.kicker}
      title={s.title}
      back={{ href: "/ai", label: "AI Lab" }}
      pager={{
        prev: prev && { href: `/ai/${prev.id}`, label: prev.title },
        next: next && { href: `/ai/${next.id}`, label: next.title },
        position: `${i + 1} / ${aiSystems.length}`,
      }}
    >
      <Suspense>
        <AiSystemView system={s} />
      </Suspense>
    </Panel>
  );
}
