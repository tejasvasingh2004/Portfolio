export const profile = {
  name: "Tejasva Singh Chouhan",
  shortName: "Tejasva",
  monogram: "TS",
  title: "Full-Stack & AI Agent Engineer",
  tagline: "I build backend systems — and the AI agents that run on them.",
  shortBio:
    "Computer Engineering student at SGSITS Indore who builds from the storage layer up: a B+ Tree database engine in Java, an AI workspace and coding-agent platform in TypeScript, and fixes merged into open-source projects like Headlamp from Kubernetes SIGs.",
  longBio: [
    "I like working where systems get interesting: the layer underneath the product. That has meant writing a database engine with its own B+ Tree index and transactions, and building notification services, validation and PostgreSQL-backed APIs during my internships.",
    "Lately most of my time goes into AI systems that behave like infrastructure. NeuroFlow, my largest project, runs an AI workspace and a coding agent on one runtime: queued runs, six execution strategies, a provider-independent model gateway, sandboxed tools and human-approved diffs — plus an optional Cognitive Mode that adapts to the user's EEG-measured workload.",
    "This summer I was a research intern at NIT Bhopal, building multilingual image-text pipelines for vision-language models across 21 Indian languages. Since October I've been contributing fixes upstream: merged in Headlamp (Kubernetes SIGs), Reticle, Improve YouTube and Tabularis, with more in review at Meshery and Jitsi Meet.",
  ],
  location: "Indore, India",
  status: "Open to SWE, backend & AI engineering internships",
  photo: "/assets/profile/tejasva.webp",
  resume: "/resume/Tejasva_Singh_Chouhan_Resume.pdf",
} as const;

export const links = {
  email: "tejasva12112004@gmail.com",
  github: "https://github.com/tejasvasingh2004",
  linkedin: "https://www.linkedin.com/in/tejasva-singh-chouhan-859bab31a",
  leetcode: "https://leetcode.com/u/tejasvasingh44/",
} as const;

export const education = {
  institution: "Shri G. S. Institute of Technology and Science",
  shortName: "SGSITS",
  location: "Indore, India",
  degree: "B.Tech in Computer Engineering",
  period: "2024 – 2028",
  cgpa: "8.17 / 10",
  coursework: [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
  ],
  school: {
    name: "St. Joseph's Convent Senior Secondary School",
    location: "Sagar, India",
    year: "2023",
    results: "CBSE Class XII 90.2% · Class X 93.8%",
  },
} as const;

/**
 * Public site URL. Set NEXT_PUBLIC_SITE_URL for a custom domain; on Vercel the production
 * deployment URL is picked up automatically at build time.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
