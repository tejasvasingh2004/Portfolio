export const profile = {
  name: "Tejasva Singh Chouhan",
  shortName: "Tejasva",
  monogram: "TS",
  title: "Full-Stack & AI Agent Engineer",
  tagline: "I build backend systems — and the AI agents that run on them.",
  shortBio:
    "Computer Engineering student at SGSITS Indore who builds from the storage layer up: a B+ Tree database engine in Java, production backend APIs in Node.js, and adaptive multi-agent systems with LangGraph.",
  longBio: [
    "I like working where systems get interesting: the layer underneath the product. That has meant writing a database engine with its own B+ Tree index, designing PostgreSQL schemas and REST APIs for real platforms, and building backend automations during my internships.",
    "Lately most of my time goes into AI systems — not single prompts, but graphs of agents that plan, solve, verify and adapt. My NeuroFlow project decodes a user's cognitive workload from EEG signals and reshapes a LangGraph agent topology around it.",
    "I'm currently a research intern at NIT Bhopal, evaluating vision-language models and OCR systems for multilingual, handwritten Indian-language documents.",
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
  cgpa: "8.22",
  coursework: [
    "Structured Programming",
    "Data Structures",
    "Design & Analysis of Algorithms",
    "Database Management Systems",
    "Microprocessors",
  ],
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
