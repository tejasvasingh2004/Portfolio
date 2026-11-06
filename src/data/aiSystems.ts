import type { IconName } from "@/lib/icons";

export type AiSystemId = "neuroflow" | "traycer-mini" | "htr-bench";

export type NodeKind = "input" | "agent" | "router" | "tool" | "model" | "store" | "output";

export type AiNode = {
  id: string;
  label: string;
  kind: NodeKind;
  icon: IconName;
  /** Grid cell on the AI Lab plate: [column, row]. Columns run left → right, rows back → front. */
  at: [number, number];
  role: string;
  inputs?: string;
  outputs?: string;
  impl?: string;
  why?: string;
};

export type AiEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  loop?: boolean;
  /**
   * Orthogonal routing: horizontal-first (default), vertical-first, or a bypass lane
   * above/below the row for edges that skip over nodes in between.
   */
  route?: "hvh" | "vhv" | "over" | "under";
  /** Lane position (in rows) for over/under/vhv routes. */
  lane?: number;
};

export type AiState = {
  id: string;
  label: string;
  detail: string;
  /** Edges that carry the signal in this state. Edges not listed render idle. */
  active: string[];
};

export type AiSystem = {
  id: AiSystemId;
  title: string;
  kicker: string;
  summary: string;
  project?: string;
  context?: string;
  nodes: AiNode[];
  edges: AiEdge[];
  states?: AiState[];
  defaultState?: string;
};

const e = (from: string, to: string, extra: Partial<AiEdge> = {}): AiEdge => ({
  id: `${from}>${to}`,
  from,
  to,
  ...extra,
});

/** Edges every NeuroFlow run uses, whatever the workload. */
const neuroflowPipeline = [
  "eeg>policy", "policy>router", "request>queue", "queue>router",
  "gateway>providers", "gateway>tools", "gateway>evaluation", "evaluation>stream",
];

export const aiSystems: AiSystem[] = [
  {
    id: "neuroflow",
    title: "NeuroFlow",
    kicker: "Adaptive agent runtime",
    summary:
      "The runtime behind NeuroFlow: every request becomes a queued run that a worker routes to the smallest reliable agent strategy, with model calls through one gateway and tool calls through a validated runtime. In Cognitive Mode an EEG workload estimate caps the strategy, model and answer length — switch the workload to watch the route change.",
    project: "neuroflow",
    nodes: [
      { id: "eeg", label: "EEG workload", kind: "input", icon: "activity", at: [0, 0], role: "Optional input for Cognitive Mode: an estimate of the user's current cognitive workload.", outputs: "LOW · MEDIUM · HIGH + confidence", impl: "A Python sidecar (FastAPI + scikit-learn SVM on 14-channel EEG features) behind a cognitive-state provider; a manual setting works too.", why: "Workload is measured, not self-reported." },
      { id: "policy", label: "Cognitive policy", kind: "router", icon: "gauge", at: [1, 0], role: "Turns the workload into bounded execution preferences.", inputs: "Cognitive state", outputs: "Strategy cap, model preference, evaluation mode, answer format", impl: "Low-confidence estimates are softened toward MEDIUM. A policy never touches authentication, tool permissions or approvals.", why: "Adaptation is policy on top of the normal runtime, so Standard Mode works without it." },
      { id: "request", label: "Request", kind: "input", icon: "message", at: [0, 1], role: "A chat message, an API call or an OpenAI-compatible request.", outputs: "One internal RunRequest", impl: "Workspace UI, scoped API keys or POST /v1/chat/completions — all normalized to the same run model." },
      { id: "queue", label: "Run queue", kind: "store", icon: "layers", at: [1, 1], role: "Persists the run and hands it to a worker.", inputs: "RunRequest", outputs: "Queued job", impl: "Fastify Run Manager → PostgreSQL → BullMQ, with idempotency keys, plan-based priority and per-tenant fairness.", why: "Long model and tool loops never block an HTTP handler." },
      { id: "router", label: "Router", kind: "router", icon: "network", at: [2, 1], role: "Chooses the execution strategy, the agents and a model for each agent.", inputs: "Task signals + policy cap", outputs: "Strategy, agents, models and a rationale", impl: "The smallest reliable of six strategies: direct, single agent, sequential, parallel, evaluator-optimizer and supervisor.", why: "Not every request needs a team of agents." },
      { id: "supervisor", label: "Supervisor team", kind: "agent", icon: "users", at: [3, 0], role: "A supervisor splits the task, a researcher and an analyst work the subtasks, and a writer synthesises the answer.", impl: "SUPERVISOR strategy — allowed only when the user has spare attention (LOW workload)." },
      { id: "sequential", label: "Research → write", kind: "agent", icon: "list-checks", at: [3, 1], role: "A researcher gathers what the task needs; a writer turns it into the answer.", impl: "SEQUENTIAL strategy — the most the router may use at MEDIUM workload." },
      { id: "single", label: "Single agent", kind: "agent", icon: "brain", at: [3, 2], role: "One agent answers, calling tools when it needs them.", impl: "SINGLE_AGENT strategy — the most the router may use at HIGH workload." },
      { id: "gateway", label: "Model Gateway", kind: "model", icon: "cpu", at: [4, 1], role: "Every model call goes through one provider-independent gateway.", impl: "Streaming, reasoning budgets (off / low / medium / high), timeouts, retries, same-model failover across providers, a circuit breaker per provider, shared Redis rate budgets, usage and cost.", why: "Agents never call a provider SDK directly." },
      { id: "providers", label: "Providers", kind: "model", icon: "sparkles", at: [4, 0], role: "The models behind the gateway, in fast, balanced and strong tiers.", impl: "Groq (GPT-OSS, Qwen), local Qwen through Ollama, and Anthropic, OpenAI and Gemini with platform or workspace keys." },
      { id: "tools", label: "Tool Runtime", kind: "tool", icon: "wrench", at: [4, 2], role: "Runs the tools a model asks for, then appends the result and resumes the model.", impl: "Registry → JSON Schema validation (Zod) → authorization → approval when consequential → execute → normalized result, with loop limits. Memory is a search_memory tool with bounded results.", why: "Model-generated arguments are never executed unvalidated." },
      { id: "evaluation", label: "Evaluation", kind: "tool", icon: "check-check", at: [5, 1], role: "Scores the answer before the run completes.", impl: "Heuristic or model-graded, as the policy asks; scores also feed learned routing." },
      { id: "stream", label: "Live stream", kind: "output", icon: "radio", at: [5, 2], role: "Real backend events, streamed to the workspace as they happen.", outputs: "run.created, router.selected, agent.*, model.*, tool.*, response.delta, run.completed", impl: "Redis event bus → SSE / WebSocket → React. The UI never fakes progress." },
    ],
    edges: [
      e("eeg", "policy"),
      e("policy", "router", { label: "cap", route: "vhv", lane: 0.5 }),
      e("request", "queue"),
      e("queue", "router"),
      e("router", "supervisor"),
      e("router", "sequential"),
      e("router", "single"),
      e("supervisor", "gateway"),
      e("sequential", "gateway"),
      e("single", "gateway"),
      e("gateway", "providers", { label: "LLM" }),
      e("gateway", "tools", { label: "tool calls" }),
      e("gateway", "evaluation"),
      e("evaluation", "stream"),
    ],
    states: [
      { id: "LOW", label: "Low", detail: "Up to a supervisor team · strongest model · heuristic evaluation · thorough answer with detail and examples", active: [...neuroflowPipeline, "router>supervisor", "supervisor>gateway"] },
      { id: "MEDIUM", label: "Medium", detail: "Up to research → write · default model · model-graded evaluation · key point first, short paragraphs", active: [...neuroflowPipeline, "router>sequential", "sequential>gateway"] },
      { id: "HIGH", label: "High", detail: "Single agent · fastest model · model-graded evaluation · one or two sentences, then at most five bullets", active: [...neuroflowPipeline, "router>single", "single>gateway"] },
    ],
    defaultState: "MEDIUM",
  },
  {
    id: "traycer-mini",
    title: "Traycer-mini",
    kicker: "Agentic code-generation workflow",
    summary:
      "Plan, generate, review, approve, verify. AI writes the code — but nothing reaches the codebase without a reviewable plan, a diff and a passing check.",
    project: "traycer-mini",
    nodes: [
      { id: "llm", label: "LLM provider", kind: "model", icon: "cpu", at: [2, 0], role: "Pluggable model backend for planning and generation.", impl: "OpenAI, Anthropic or Groq — chosen by environment variable, with per-provider default models.", why: "No lock-in to one vendor." },
      { id: "task", label: "Task", kind: "input", icon: "terminal", at: [0, 1], role: "A natural-language task typed into the CLI.", outputs: "e.g. “Add login API with JWT authentication”", impl: "`plan` command (Commander.js)." },
      { id: "planner", label: "Planner", kind: "agent", icon: "list-checks", at: [1, 1], role: "Turns the task into a structured plan.", inputs: "Task description", outputs: "Steps + files to create or modify", impl: "LLM call with a structured-output prompt." },
      { id: "plan", label: "plan.json", kind: "store", icon: "file-code", at: [2, 1], role: "The persisted plan.", impl: "Saved under plans/ — reviewable, editable and re-runnable.", why: "Separating plan from generation makes the agent's intent inspectable." },
      { id: "generator", label: "Generator", kind: "agent", icon: "sparkles", at: [3, 1], role: "Generates complete code for every file in the plan.", inputs: "Plan file", outputs: "Proposed file contents", impl: "`generate` command; one generation per planned file." },
      { id: "staging", label: "Staging", kind: "store", icon: "layers", at: [3, 2], role: "Holds proposals as unified diffs — never touching the real code.", impl: "staging/ directory with per-file diffs.", why: "Safe by default." },
      { id: "review", label: "Review", kind: "tool", icon: "eye", at: [2, 2], role: "Interactive diff review in the terminal.", inputs: "Staged diffs", outputs: "Approve / reject per file" },
      { id: "apply", label: "Apply", kind: "tool", icon: "git-branch", at: [1, 2], role: "Writes only the approved files.", impl: "Selective application of generated changes." },
      { id: "verify", label: "Verify", kind: "output", icon: "check-check", at: [0, 2], role: "Checks the result actually builds.", impl: "TypeScript compiler + ESLint.", why: "Closes the loop: generated code is held to the same bar as written code." },
    ],
    edges: [
      e("task", "planner"),
      e("llm", "planner", { route: "vhv" }),
      e("planner", "plan"),
      e("plan", "generator"),
      e("llm", "generator", { route: "vhv" }),
      e("generator", "staging"),
      e("staging", "review"),
      e("review", "apply"),
      e("apply", "verify"),
      e("review", "planner", { loop: true, label: "reject" }),
    ],
  },
  {
    id: "htr-bench",
    title: "HTR Bench",
    kicker: "Research · MANIT Bhopal",
    summary:
      "Research on vision-language models for handwritten and multilingual Indian-language documents — benchmarking OCR and VLM systems head-to-head on the same pages.",
    context:
      "Research internship at MANIT Bhopal (May – Jul 2026) on BharatGen vision-language models: image-text pipelines for 5,000+ samples in 21 Indian languages and 20+ experiments.",
    nodes: [
      { id: "doc", label: "Handwritten doc", kind: "input", icon: "scan-text", at: [0, 1.5], role: "Multilingual and Indian-language handwritten documents.", outputs: "Page / line images" },
      { id: "paddle", label: "PaddleOCR", kind: "model", icon: "scan-text", at: [1.5, 0], role: "Classical OCR pipeline baseline." },
      { id: "easyocr", label: "EasyOCR", kind: "model", icon: "scan-text", at: [1.5, 1], role: "OCR baseline with broad script coverage." },
      { id: "trocr", label: "TrOCR", kind: "model", icon: "cpu", at: [1.5, 2], role: "Transformer-based OCR (vision encoder + text decoder)." },
      { id: "vlm", label: "VLMs", kind: "model", icon: "eye", at: [1.5, 3], role: "Multimodal transformer models that read text directly from the image." },
      { id: "eval", label: "CER / WER", kind: "tool", icon: "gauge", at: [3, 1.5], role: "Character and word error rates against ground truth.", why: "CER captures script-level mistakes that WER hides." },
      { id: "report", label: "Comparison", kind: "output", icon: "file-code", at: [4, 1.5], role: "Comparative analysis across models, scripts and datasets." },
    ],
    edges: [
      e("doc", "paddle"),
      e("doc", "easyocr"),
      e("doc", "trocr"),
      e("doc", "vlm"),
      e("paddle", "eval"),
      e("easyocr", "eval"),
      e("trocr", "eval"),
      e("vlm", "eval"),
      e("eval", "report"),
    ],
  },
];

export const aiSystemById = (id: string) => aiSystems.find((s) => s.id === id);
