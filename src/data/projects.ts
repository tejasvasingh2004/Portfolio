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
    subtitle: "AI workspace & coding-agent platform",
    tagline:
      "One runtime for AI chat and a code agent that plans, edits, tests and opens pull requests — with you approving every change that matters.",
    category: "AI",
    year: 2026,
    featured: true,
    problem:
      "Most AI assistants and code agents are a prompt loop inside a web request: they block the server while the model runs, fail outright when a provider has an outage, and let the model write into your repository unchecked.",
    solution:
      "A TypeScript monorepo where every request — from the UI, an API key or the OpenAI-compatible endpoint — becomes a persisted run. A Fastify API queues it in BullMQ; a worker routes it to the smallest reliable of six execution strategies, calls models through a provider-independent Model Gateway and tools through a validated, authorized Tool Runtime, and streams real execution events back to the React workspace. The Code workspace is an AI IDE built on the same runtime, not a second backend.",
    role: "Designed and built the platform end to end: shared contracts, API, workers, orchestrator, Model Gateway, tool runtime, sandbox, React workspace and the test suites.",
    features: [
      "AI workspace: routed agents, multiple models, tools, bounded memory, live execution events and an optional inspector",
      "Code workspace: connect GitHub, pick a repository and branch, edit in Monaco and ask the Code Agent for a change",
      "Code Agent with 27 schema-validated tools: plan → patch → diff → approval → tests in a sandbox → bounded repair → commit on its own branch → draft pull request",
      "Replay of every run from stored events and artifacts — never re-executed",
      "OpenAI-compatible POST /v1/chat/completions, TypeScript and Python SDKs, and signed webhooks",
      "Bring-your-own provider keys with envelope encryption (AES-256-GCM) and per-workspace dollar budgets",
      "Optional Cognitive Mode: an EEG workload estimate caps the strategy, model and answer length",
    ],
    decisions: [
      "Long work never runs in a request handler: Fastify persists and enqueues, BullMQ workers execute, and Redis carries events back over SSE and WebSocket.",
      "The router picks the smallest reliable strategy (direct → supervisor) and chooses agents and models independently, instead of making every request multi-agent.",
      "Every model call goes through one gateway with timeouts, retries, same-model failover across providers, a circuit breaker per provider and rate budgets shared through Redis.",
      "Every tool call is schema-validated, authorized and — when consequential — approved by the user before it runs.",
      "Agent commands run in throwaway Docker containers with no network by default, a read-only root, dropped capabilities and CPU, memory and time limits — never on the API server.",
      "Model calls are checkpointed, so a run interrupted by a worker crash resumes on another worker without repeating or double-billing completed steps.",
    ],
    challenges: [
      "Keeping a gateway cheap enough to sit in front of every call: the direct gateway mode adds under 6 ms (p95) before the provider request, and 3 ms p95 at 40 calls/s under k6 load.",
      "Scaling out without code changes: with 2 APIs and 2 workers behind nginx, the same load test went from 86% to 100% of runs admitted and run latency p95 from 34.8 s to 5.6 s.",
      "Cognitive Mode's classifier turns noisy 14-channel EEG windows into a stable three-class workload signal: band-pass, notch and common-average reference, then band powers, differential entropy and Hjorth parameters, reduced by PCA for an RBF-kernel SVM.",
    ],
    stack: ["typescript", "nodejs", "fastify", "react", "vite", "tailwind", "postgresql", "redis", "bullmq", "sse", "docker", "opentelemetry", "playwright", "llm-apis", "multi-agent", "ollama", "python", "fastapi", "scikit-learn"],
    links: { github: "https://github.com/tejasvasingh2004/Tejasva_BCI_Cognitive-state-aware-multi-agent-system" },
    media: {},
    aiSystem: "neuroflow",
    note: "Started in 2026 as research on EEG-adaptive LangGraph agents (academic guidance: Dr. Mitul Kumar Ahirwal, Department of CSE, MANIT Bhopal; EEG data: STEW dataset), then rebuilt in TypeScript as a production runtime.",
    facts: [
      { label: "Agent tools", value: "27" },
      { label: "Strategies", value: "6" },
      { label: "Tests", value: "300+" },
    ],
  },
  {
    slug: "petrotwin",
    title: "PetroTwin",
    subtitle: "Digital twin for heavy-oil wells",
    tagline:
      "A well-to-surface digital twin that shows what limits each well, and which steam cycle, pump plan and re-steam day pay off most within safety limits.",
    category: "Systems",
    year: 2026,
    featured: true,
    problem:
      "In a heavy-oil field, steam injection (Cyclic Steam Stimulation) and sucker-rod pumping are usually planned separately: steam from experience, pumps at a fixed speed, re-steaming on a habitual day. But steam, heat, oil viscosity and rod loads are one coupled system.",
    solution:
      "A coupled state model of every well. One physics chain (heat → viscosity → inflow → pump → rods) feeds the dashboard, well console, 3D well sandbox, scenario lab, optimizer and backtests, so every screen agrees on the same number. A joint optimizer picks steam volume, soak time, pump-speed plan and re-steam day together, and an independent safety gate re-checks every strategy at P90 uncertainty.",
    features: [
      "Bottleneck Navigator: which limit binds each well now (inflow, pump, rod float, fatigue, torque), which binds next, and the fixes ranked by net ₹/day",
      "Rod float margin along the full rod string, with Goodman stress and fatigue per section",
      "Re-steam timing by optimal stopping, with a P10–P90 window per well instead of one habitual day",
      "3D well sandbox: cut-away strata, the heated zone and an animated pumpjack; pump-speed and day sliders recompute every number live",
      "Counterfactual backtest over 120 past cycles on 31 wells, reporting forecast skill (median error 6.7%) before any gain",
      "Evidence behind every number (function, inputs, registry and model versions) and a hash-chained audit log of decisions",
    ],
    decisions: [
      "The 3D model is the visual index, not the twin: one coupled physics chain is the single source every page reads from.",
      "The safety gate is independent of the optimizer: close calls go to human review, and failing strategies can't be approved.",
      "Skill before gains: backtests learn on earlier cycles only and report forecast accuracy before any predicted gain.",
      "A build check blocks KPI numbers typed into the screens, so every figure traces back to the model.",
      "The API client switches to a twin server when one answers /api/health and otherwise runs the same engine in the browser, so the demo works offline.",
    ],
    challenges: [
      "Coupling steam and pump decisions: more steam thins the oil and lets the pump run faster, but as the heated zone cools the oil in the tubing thickens and the rods can fall slower than the pump strokes. The optimizer searches 1,485 designs × 4 objective presets for plans that keep the rods from floating.",
    ],
    stack: ["typescript", "react", "vite", "threejs", "html-css"],
    links: {
      github: "https://github.com/tejasvasingh2004/indian_oil_limited_sih_2026",
      live: "https://indian-oil-limited-sih-2026.vercel.app",
    },
    media: {},
    note: "Built for Smart India Hackathon 2026 (problem statement SIH26120, Oil India Limited). The demo runs on a simulated field: nothing on screen is a field result.",
    facts: [
      { label: "Wells modelled", value: "33" },
      { label: "Designs searched", value: "1,485" },
      { label: "Backtest cycles", value: "120" },
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
    tagline: "A relational database engine written from scratch — B+ Tree index, atomic transactions and a REST layer on top.",
    category: "Systems",
    year: 2025,
    featured: true,
    problem:
      "Most developers only ever see a database through an ORM. I wanted to understand what actually happens underneath — indexing, node splits and merges, persistence and transactions — by building one.",
    solution:
      "A Java engine (about 3.3K lines with its web UI) whose tables are indexed by an order-50 B+ Tree with O(log n) lookups, inserts and deletes. Four layers — storage, schema management, query and transaction processing, and a Spring Boot REST API — keep CRUD going straight through the tree, with JSON persistence and snapshot-based rollback for atomic transactions.",
    features: [
      "Fully functional B+ Tree: lookups, inserts, deletes and range queries",
      "Node split and merge with rebalancing",
      "Schema manager with 6 typed column types (string, boolean, int, long, float, double)",
      "Atomic multi-step transactions with snapshot-based rollback",
      "11 REST endpoints for tables, records, conditional queries and transactions",
      "Browser UI for CRUD, conditional queries, pagination and building multi-step transactions",
    ],
    decisions: [
      "No ORM, no external database: every REST call goes straight through the custom B+ Tree.",
      "A high-fan-out tree (order 50) keeps the tree shallow, so a lookup touches very few nodes.",
      "A transaction snapshots the table before it runs and restores the snapshot if any step fails, so a failed transaction leaves no partial writes.",
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
      { label: "REST endpoints", value: "11" },
      { label: "Column types", value: "6" },
    ],
  },
  {
    slug: "codeguardian",
    title: "CodeGuardian",
    subtitle: "Code-review environment for AI agents",
    tagline:
      "An environment that scores AI agents on spotting bugs and security issues, rating their risk and proposing a fix — with partial credit for each step.",
    category: "AI",
    year: 2026,
    featured: false,
    problem:
      "Checks for code agents usually ask only whether a fix runs, not whether the agent understood the problem. A good reviewer has to spot the issue, judge how risky it is and propose a correct fix — three different skills.",
    solution:
      "A Gymnasium-style environment (OpenEnv spec) where every task takes the agent through three steps — detect issues, assess risk, suggest a fix — and returns a continuous reward between 0 and 1. Tasks range from an off-by-one error to SQL injection, XSS and an async race condition. It is served over an HTTP API with a Gradio UI, packaged as a Docker Space.",
    features: [
      "6 review tasks from easy to hard: off-by-one, None handling, a logic bug, SQL injection, XSS and an async race condition",
      "Three graded steps per task — detect, assess risk, suggest a fix — each earning partial credit",
      "OpenEnv / TRL-style HTTP API (POST /reset, POST /step, GET /state) next to an interactive Gradio UI",
      "Inference agent for any OpenAI-compatible endpoint, with structured prompts and safe JSON parsing",
      "Benchmark script that runs repeated episodes and reports results per task",
    ],
    decisions: [
      "Issue detection is scored with token-overlap F1, so a partly right answer earns partial credit instead of a plain pass or fail.",
      "Risk is ordinal: the exact level scores 1.0 and an adjacent level 0.5.",
      "A fix is compared with a canonical fix by edit distance, and step rewards are weighted 0.3 detect, 0.2 risk and 0.5 fix, because the fix matters most.",
      "The API routes are registered on FastAPI before Gradio is mounted at /, so the agent API and the UI share one container.",
    ],
    stack: ["python", "fastapi", "llm-apis", "docker"],
    links: { github: "https://github.com/tejasvasingh2004/Code_man" },
    media: {},
    facts: [
      { label: "Review tasks", value: "6" },
      { label: "Steps per task", value: "3" },
      { label: "Reward", value: "0–1" },
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
