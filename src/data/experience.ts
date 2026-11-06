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
    title: "Backend & AI Intern",
    period: "2025 · 85 days",
    mode: "Remote",
    summary: "Notification services, request validation and credit-customer APIs for a Node.js and PostgreSQL platform.",
    points: [
      "Designed reusable AWS SNS notification services for 15+ event types across employee lifecycle, dealership, credit-account and sales/payment flows, with role-based and individual-user routing.",
      "Built a reusable Joi validation framework and wired request-validation middleware into 40+ endpoints across 5 API modules (auth, employee, dealership, sales, credit).",
      "Developed credit-customer APIs with phone-number masking, role-based filtering and safer response handling; evolved PostgreSQL schemas through 10+ Knex migrations and transactional queries.",
      "Fixed 20+ production bugs, refactored duplicated logic, and improved error handling and Swagger/OpenAPI documentation across REST services.",
    ],
    stack: ["nodejs", "express", "postgresql", "knex", "aws-sns", "joi", "rest", "openapi"],
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
