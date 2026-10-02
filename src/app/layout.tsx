import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { profile, links, education, siteUrl } from "@/data/profile";
import { bootScript } from "@/lib/prefs";
import { TopBar } from "@/components/navigation/TopBar";
import { AppShell } from "@/components/navigation/AppShell";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { SceneSlot } from "@/three/SceneSlot";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description = `${profile.title}. ${profile.shortBio}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} — ${profile.title}`, template: `%s · ${profile.name}` },
  description,
  applicationName: `${profile.name} — Portfolio`,
  authors: [{ name: profile.name, url: links.github }],
  keywords: ["Tejasva Singh Chouhan", "full-stack developer", "AI agents", "LangGraph", "backend engineer", "portfolio"],
  openGraph: {
    type: "website",
    title: `${profile.name} — ${profile.title}`,
    description: profile.tagline,
    siteName: profile.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: `${profile.name} — ${profile.title}`, description: profile.tagline },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.shortBio,
  email: `mailto:${links.email}`,
  url: siteUrl,
  image: `${siteUrl}${profile.photo}`,
  address: { "@type": "PostalAddress", addressLocality: "Indore", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.institution },
  sameAs: [links.github, links.linkedin, links.leetcode],
  knowsAbout: ["Backend development", "AI agents", "LangGraph", "Multi-agent systems", "Database internals", "Next.js"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Sets 2D/3D mode + motion preference before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden">
        <a
          href="#content"
          className="fixed left-3 top-3 z-[70] -translate-y-20 rounded-lg bg-ink px-3 py-2 text-sm text-white focus:translate-y-0"
        >
          Skip to content
        </a>
        <SceneSlot />
        <TopBar />
        <main id="content">{children}</main>
        <Suspense>
          <AppShell />
        </Suspense>
        <CommandPalette />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
