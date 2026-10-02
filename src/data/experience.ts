import type { SkillId } from "./skills";

export type Role = {
  id: string;
  org: string;
  orgShort: string;
  title: string;
  period: string;
  current?: boolean;
  mode: string;
  summary: string;
  points: string[];
  stack: SkillId[];
  logo?: string;
};

/** Newest first. */
export const experience: Role[] = [
  {
    id: "nit-bhopal",
    org: "NIT Bhopal (MANIT)",
    orgShort: "NIT",
    title: "Research Intern — VLMs for Handwritten Text Recognition",
    period: "Present",
    current: true,
    mode: "Under the guidance of a PhD scholar, IIT Bombay",
    summary:
      "Researching vision-language models for handwritten text recognition on multilingual and Indian-language documents.",
    points: [
      "Conducting research on Vision Language Models (VLMs) for handwritten text recognition, focused on multilingual and Indian-language documents.",
      "Evaluating state-of-the-art OCR and VLM systems including PaddleOCR, EasyOCR, TrOCR and multimodal transformer architectures.",
      "Running comparative analysis with CER and WER metrics on handwritten text datasets.",
    ],
    stack: ["vlm", "ocr-eval", "python"],
  },
  {
    id: "indhanpay",
    org: "IndhanPay Pvt. Ltd.",
    orgShort: "IP",
    title: "Backend & AI Automations Intern",
    period: "2025 · 85 days",
    mode: "Remote",
    summary: "Backend APIs and AI-driven automation workflows on Node.js systems.",
    points: [
      "Completed an 85-day internship focused on backend development and AI-driven automation workflows.",
      "Developed backend APIs and automation scripts to streamline internal processes.",
      "Worked with Node.js systems integrating authentication, databases and external APIs.",
      "Received appreciation for reliability and timely delivery of development tasks.",
    ],
    stack: ["nodejs", "express", "rest", "jwt"],
    logo: "/assets/logos/indhanpay.webp",
  },
  {
    id: "e-notebook",
    org: "E-NOTEBOOK",
    orgShort: "EN",
    title: "Backend & Database Development Intern",
    period: "2025",
    mode: "Remote",
    summary: "Led backend and database development for the E-NOTEBOOK-8 platform.",
    points: [
      "Led backend and database development for the E-NOTEBOOK-8 platform.",
      "Delivered scalable APIs, optimized database schemas and production-ready system improvements.",
    ],
    stack: ["nodejs", "postgresql", "schema-design", "rest"],
  },
];
