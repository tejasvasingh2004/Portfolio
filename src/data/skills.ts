export type ClusterId = "languages" | "frontend" | "backend" | "data" | "ai" | "tools";

export const clusters: { id: ClusterId; label: string; blurb: string }[] = [
  { id: "ai", label: "AI / ML", blurb: "Agent graphs, local LLMs, VLM evaluation" },
  { id: "backend", label: "Backend", blurb: "APIs, auth, services" },
  { id: "data", label: "Data", blurb: "Schemas, SQL, storage internals" },
  { id: "frontend", label: "Frontend", blurb: "Interfaces and dashboards" },
  { id: "languages", label: "Languages", blurb: "What I write it in" },
  { id: "tools", label: "Tools & Infra", blurb: "Shipping and plumbing" },
];

export const skills = [
  // Languages
  { id: "c", label: "C", cluster: "languages" },
  { id: "cpp", label: "C++", cluster: "languages" },
  { id: "javascript", label: "JavaScript", cluster: "languages" },
  { id: "typescript", label: "TypeScript", cluster: "languages" },
  { id: "python", label: "Python", cluster: "languages" },
  { id: "java", label: "Java", cluster: "languages" },
  { id: "sql", label: "SQL", cluster: "languages" },
  { id: "html-css", label: "HTML / CSS", cluster: "languages" },
  // Frontend
  { id: "react", label: "React", cluster: "frontend" },
  { id: "nextjs", label: "Next.js", cluster: "frontend" },
  { id: "tailwind", label: "Tailwind CSS", cluster: "frontend" },
  { id: "responsive", label: "Responsive UI", cluster: "frontend" },
  // Backend
  { id: "nodejs", label: "Node.js", cluster: "backend" },
  { id: "express", label: "Express", cluster: "backend" },
  { id: "fastapi", label: "FastAPI", cluster: "backend" },
  { id: "spring-boot", label: "Spring Boot", cluster: "backend" },
  { id: "rest", label: "REST APIs", cluster: "backend" },
  { id: "jwt", label: "JWT / Bcrypt", cluster: "backend" },
  // Data
  { id: "postgresql", label: "PostgreSQL", cluster: "data" },
  { id: "knex", label: "Knex.js", cluster: "data" },
  { id: "appwrite", label: "Appwrite", cluster: "data" },
  { id: "schema-design", label: "Schema design", cluster: "data" },
  { id: "db-internals", label: "DB internals", cluster: "data" },
  // AI
  { id: "langgraph", label: "LangGraph", cluster: "ai" },
  { id: "langchain", label: "LangChain", cluster: "ai" },
  { id: "ollama", label: "Ollama", cluster: "ai" },
  { id: "llm-apis", label: "LLM APIs", cluster: "ai" },
  { id: "multi-agent", label: "Multi-agent", cluster: "ai" },
  { id: "scikit-learn", label: "scikit-learn", cluster: "ai" },
  { id: "vlm", label: "VLMs", cluster: "ai" },
  { id: "ocr-eval", label: "OCR eval", cluster: "ai" },
  // Tools
  { id: "git", label: "Git / GitHub", cluster: "tools" },
  { id: "docker", label: "Docker", cluster: "tools" },
  { id: "netlify", label: "Netlify", cluster: "tools" },
  { id: "nodemailer", label: "Nodemailer", cluster: "tools" },
  { id: "zoho", label: "Zoho API", cluster: "tools" },
  { id: "commander", label: "Commander.js", cluster: "tools" },
] as const satisfies readonly { id: string; label: string; cluster: ClusterId }[];

export type SkillId = (typeof skills)[number]["id"];
export type Skill = (typeof skills)[number];

export const skillById = Object.fromEntries(skills.map((s) => [s.id, s])) as Record<SkillId, Skill>;
