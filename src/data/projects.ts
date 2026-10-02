import type { SkillId } from "./skills";
import type { AiSystemId } from "./aiSystems";

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  category: "AI" | "Backend" | "Systems" | "Tooling";
  year: number;
  featured: boolean;
  problem: string;
  solution: string;
  role?: string;
  features: string[];
  decisions: string[];
  challenges?: string[];
  stack: SkillId[];
  links: { github?: string; live?: string; demo?: string };
  media: { cover?: string; gallery?: string[]; video?: string };
  aiSystem?: AiSystemId;
  note?: string;
  /** Short numeric facts shown on the 3D monitor and in the panel header. */
  facts: { label: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: "neuroflow",
    title: "NeuroFlow",
    subtitle: "Cognitive-state-aware adaptive multi-agent system",
    tagline:
      "Reads your cognitive workload from EEG and reshapes a LangGraph agent team around it.",
    category: "AI",
    year: 2026,
    featured: true,
    problem:
      "LLM assistants answer the same way whether you are relaxed or overloaded. Under high cognitive load, long verbose answers add friction — and that is exactly when correctness matters most.",
    solution:
      "A five-layer closed loop. An EEG classifier decodes workload (LOW / MEDIUM / HIGH) from 14-channel signals, a workload manager selects a routing policy, and a LangGraph agent graph scales its depth: more verification and stricter confidence thresholds — delivered in a lighter format — as load rises.",
    role: "Designed and built the EEG pipeline, classifier, FastAPI backend, LangGraph orchestration and Next.js dashboard.",
    features: [
      "Workload prediction endpoint returning state, confidence and processing time",
      "Adaptive chat that reports which agents ran, verification loops used and the threshold applied",
      "Next.js dashboard visualising agent execution paths, workload state and system metrics",
      "Fully local inference with Ollama (qwen3:8b); Docker Compose for the whole stack",
    ],
    decisions: [
      "Verification scales with load: 0 loops at LOW, 1 at MEDIUM, 2 plus a Final Verification agent at HIGH — with confidence thresholds of 70 / 80 / 95%.",
      "Output format is part of the policy: verbose with examples at LOW, bullet points only at HIGH for cognitive relief.",
      "One compiled LangGraph serves all three topologies via conditional edges, instead of three separate pipelines.",
      "The Verifier → Solver retry is a bounded cycle (an explicit loop-counter node), so quality retries can never run away.",
      "A single shared ChatOllama instance is reused by every agent to avoid repeated model loads and memory exhaustion.",
    ],
    challenges: [
      "Turning noisy, high-dimensional EEG windows (14 channels × 1280 samples) into a stable three-class signal: Butterworth band-pass + notch + common average reference, then band powers, differential entropy, Hjorth parameters and entropy, optimised down to a 5-component PCA projection for an RBF-kernel SVM.",
    ],
    stack: ["python", "fastapi", "langgraph", "langchain", "ollama", "multi-agent", "scikit-learn", "nextjs", "typescript", "tailwind", "docker"],
    links: { github: "https://github.com/tejasvasingh2004/Tejasva_BCI_Cognitive-state-aware-multi-agent-system" },
    media: {},
    aiSystem: "neuroflow",
    note: "Academic guidance: Dr. Mitul Kumar Ahirwal, Department of CSE, MANIT Bhopal. EEG data: STEW dataset.",
    facts: [
      { label: "Workload states", value: "3" },
      { label: "Agents", value: "4" },
      { label: "EEG channels", value: "14" },
    ],
  },
  {
    slug: "traycer-mini",
    title: "Traycer-mini",
    subtitle: "AI code-generation workflow CLI",
    tagline: "A CLI that turns a task description into a planned, reviewed and verified code change.",
    category: "AI",
    year: 2025,
    featured: true,
    problem:
      "AI code generators tend to write straight into your codebase — no plan to inspect, no diff to approve, and no check that the result even compiles.",
    solution:
      "A staged workflow: plan → generate → review → approve → verify. Plans are persisted as JSON, generated code lands in a staging area as unified diffs, you apply files selectively, and verification runs the TypeScript compiler and ESLint.",
    features: [
      "Natural-language task → structured plan with steps and files to touch",
      "Code generation per planned file, saved as proposals with unified diffs",
      "Interactive and batch modes built from modular Commander.js commands",
      "Selective approval — apply only the files you accept",
      "Automated verification with tsc and ESLint",
    ],
    decisions: [
      "Planning and generation are separate commands with a persisted plan, so the plan is reviewable and re-runnable.",
      "A staging directory with diffs instead of in-place writes: nothing touches the codebase without approval.",
      "Provider abstraction — OpenAI, Anthropic or Groq selected with one environment variable.",
    ],
    stack: ["typescript", "nodejs", "commander", "llm-apis"],
    links: { github: "https://github.com/tejasvasingh2004/Ai_clone-traycer_project-" },
    media: {},
    aiSystem: "traycer-mini",
    facts: [
      { label: "Workflow stages", value: "5" },
      { label: "LLM providers", value: "3" },
    ],
  },
  {
    slug: "hybrid-db",
    title: "Hybrid-DB",
    subtitle: "Custom database engine with B+ Tree indexing",
    tagline: "A database engine written from scratch — B+ Tree index, file persistence and a REST layer on top.",
    category: "Systems",
    year: 2025,
    featured: true,
    problem:
      "Most developers only ever see a database through an ORM. I wanted to understand what actually happens underneath — indexing, node splits and merges, persistence — by building one.",
    solution:
      "A Java engine whose tables are indexed by a B+ Tree supporting lookups, inserts, updates, deletes and range queries, with typed schemas, file-based persistence, caching and block storage. A Spring Boot REST API executes CRUD directly through the tree, and a lightweight web UI creates tables and runs queries.",
    features: [
      "Fully functional B+ Tree: lookups, inserts, deletes and range queries",
      "Node split and merge with rebalancing",
      "Schema manager with typed columns",
      "File-based persistence, caching and block storage",
      "REST API and a browser UI for table management and CRUD",
    ],
    decisions: [
      "No ORM, no external database: every REST call goes straight through the custom B+ Tree.",
      "A high-fan-out tree (order 50) keeps the tree shallow, so a lookup touches very few nodes.",
      "Engine, schema, storage and server live in separate packages, so the storage layer can change without touching the API.",
    ],
    challenges: [
      "Getting deletes right: merging and redistributing underfull nodes while keeping keys and child pointers consistent all the way up to the root.",
    ],
    stack: ["java", "spring-boot", "db-internals", "rest", "javascript", "html-css"],
    links: { github: "https://github.com/tejasvasingh2004/Database_Project" },
    media: {},
    facts: [
      { label: "Tree order", value: "50" },
      { label: "Operations", value: "5" },
    ],
  },
  {
    slug: "dinesphere",
    title: "Dinesphere",
    subtitle: "Restaurant management & booking API",
    tagline: "The backend for a restaurant platform — reservations, menus, orders, payments, reviews and loyalty.",
    category: "Backend",
    year: 2025,
    featured: false,
    problem:
      "Restaurants and diners need one system for discovery, table booking, ordering and repeat-visit rewards — with a clear line between what admins, managers and customers are allowed to do.",
    solution:
      "A modular Express API over PostgreSQL with eleven resource modules, each following routes → controllers → models. The schema is managed with Knex and evolved through versioned migrations and seed data, and the whole API is documented with OpenAPI.",
    features: [
      "JWT authentication with bcrypt hashing and role-based authorization (admin, manager, customer)",
      "Reservations with party size, time windows and special requests",
      "Menus with categories, pricing, veg and spice-level flags",
      "Orders, order items and payments",
      "Loyalty program: points, tiers, rewards, redemptions and points history",
      "Swagger / OpenAPI docs served at /api-docs",
    ],
    decisions: [
      "Versioned Knex migrations let the schema grow — loyalty, notifications, favorites and user preferences were added without rewriting the base schema.",
      "UUID primary keys generated in PostgreSQL with pgcrypto.",
      "Loyalty and redemption tables are indexed on user, reward, status and time — the columns the app actually queries.",
      "API documentation generated from JSDoc annotations that live next to the routes.",
    ],
    stack: ["nodejs", "express", "postgresql", "knex", "jwt", "rest", "javascript", "schema-design"],
    links: { github: "https://github.com/tejasvasingh2004/Dinesphere_backend" },
    media: {},
    facts: [
      { label: "API modules", value: "11" },
      { label: "Migrations", value: "8" },
      { label: "Roles", value: "3" },
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
