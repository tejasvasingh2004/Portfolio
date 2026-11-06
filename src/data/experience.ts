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
    org: "MANIT Bhopal (NIT Bhopal)",
    orgShort: "NIT",
    title: "Research Intern — BharatGen Vision-Language Models",
    period: "May – Jul 2026",
    mode: "Bhopal, India",
    summary:
      "Multilingual image-text pipelines and OCR / VLM experiments for vision-language models across 21 Indian languages.",
    points: [
      "Engineered multilingual data pipelines combining OCR, image-text preprocessing and language-specific tokenization for 5,000+ image-text samples across 21 Indian languages.",
      "Ran 20+ experiments across 4 preprocessing and model configurations, analysing output quality and error patterns to guide the design of multimodal VLM workflows.",
      "Benchmarked OCR and VLM systems (PaddleOCR, EasyOCR, TrOCR and multimodal transformers) on handwritten text using CER and WER.",
    ],
    stack: ["vlm", "ocr-eval"],
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
