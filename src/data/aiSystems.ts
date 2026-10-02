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
  /** Orthogonal routing style between rows: horizontal-first (default) or vertical-first. */
  route?: "hvh" | "vhv";
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

const neuroflowPipeline = ["eeg>preprocess", "preprocess>features", "features>classifier", "classifier>manager", "manager>planner", "query>planner", "planner>solver", "ollama>solver", "response>dashboard"];

export const aiSystems: AiSystem[] = [
  {
    id: "neuroflow",
    title: "NeuroFlow",
    kicker: "Adaptive multi-agent graph",
    summary:
      "A brain-computer-interface loop: EEG decodes the user's cognitive workload, and the LangGraph agent topology reshapes itself around it. Switch the workload to watch the route change.",
    project: "neuroflow",
    nodes: [
      { id: "eeg", label: "EEG signal", kind: "input", icon: "activity", at: [0, 0], role: "Raw brain activity — the sensor side of the loop.", outputs: "14 channels × 1280 samples per window", impl: "STEW dataset segments; live hardware via Lab Streaming Layer is future work.", why: "Workload is measured, not self-reported." },
      { id: "preprocess", label: "Preprocess", kind: "tool", icon: "filter", at: [1, 0], role: "Cleans the signal before anything learns from it.", inputs: "Raw EEG window", outputs: "Filtered, re-referenced EEG", impl: "Butterworth band-pass, notch filter and common average reference (scipy).", why: "Line noise and drift otherwise dominate the features." },
      { id: "features", label: "Features", kind: "tool", icon: "waves", at: [2, 0], role: "Turns the cleaned signal into numbers a classifier can use.", inputs: "Filtered EEG", outputs: "5-component PCA projection", impl: "Band powers, differential entropy, Hjorth parameters and entropy → feature optimisation → PCA.", why: "Compact, stable features generalise better across sessions." },
      { id: "classifier", label: "SVM classifier", kind: "model", icon: "gauge", at: [3, 0], role: "Decodes the cognitive workload state.", inputs: "PCA features", outputs: "LOW · MEDIUM · HIGH + confidence", impl: "scikit-learn SVM with an RBF kernel, served by FastAPI at /predict-workload.", why: "Fast enough to run on every request." },
      { id: "manager", label: "Workload manager", kind: "router", icon: "network", at: [4, 0], role: "Maps the decoded state to an adaptive routing policy.", inputs: "Predicted (or manually overridden) workload", outputs: "Policy: agents, verification loops, confidence threshold, detail level", impl: "WorkloadManager.resolve_workload — prediction wins, manual override is the fallback.", why: "Keeps policy separate from the graph, so tuning never touches agent code." },
      { id: "query", label: "User query", kind: "input", icon: "message", at: [0, 2], role: "The question the user asks.", outputs: "Question text", impl: "POST /chat from the Next.js dashboard." },
      { id: "planner", label: "Planner", kind: "agent", icon: "list-checks", at: [1, 2], role: "Analyses the question and writes a step-by-step plan.", inputs: "Question + policy", outputs: "Conceptual plan", impl: "LangGraph entry node; every workload state starts here." },
      { id: "solver", label: "Solver", kind: "agent", icon: "brain", at: [2, 2], role: "Drafts the answer by following the plan (the Research agent).", inputs: "Plan, plus verifier feedback on retries", outputs: "Draft answer", impl: "Conditional edge after it: LOW goes straight to the response, MEDIUM/HIGH go to the Verifier.", why: "Depth of checking — not depth of drafting — is what adapts." },
      { id: "verifier", label: "Verifier", kind: "agent", icon: "shield-check", at: [3, 2], role: "Scores the draft against the policy's confidence threshold and sends feedback.", inputs: "Draft answer", outputs: "Confidence score + correction feedback", impl: "Bounded retry loop back to the Solver: 1 loop at MEDIUM (80%), 2 at HIGH (95%).", why: "When the user can't double-check, the system must." },
      { id: "final", label: "Final check", kind: "agent", icon: "check-check", at: [4, 2], role: "Final safety, coherence and formatting pass — HIGH workload only.", inputs: "Verified draft", outputs: "Bullet-point answer", impl: "Final Verification agent; enforces the 'bullet points only' cognitive-relief format." },
      { id: "response", label: "Response", kind: "output", icon: "send", at: [5, 2], role: "Finalises and returns the answer with run metadata.", outputs: "Answer + agents used, loops, threshold, visited nodes", impl: "Finalize node → FastAPI response." },
      { id: "ollama", label: "Ollama · qwen3:8b", kind: "model", icon: "cpu", at: [2, 3], role: "The local LLM every agent calls.", impl: "One shared ChatOllama instance, initialised once and reused by all agents.", why: "Fully local inference; reusing one instance prevents repeated model loads and memory exhaustion." },
      { id: "dashboard", label: "Dashboard", kind: "output", icon: "layout", at: [5, 1], role: "Shows the execution path, workload state and system metrics in real time.", inputs: "Response metadata", impl: "Next.js + Tailwind: agent visualiser, workload selector, metrics panel." },
    ],
    edges: [
      e("eeg", "preprocess"),
      e("preprocess", "features"),
      e("features", "classifier"),
      e("classifier", "manager"),
      e("manager", "planner", { label: "policy", route: "vhv" }),
      e("query", "planner"),
      e("planner", "solver"),
      e("solver", "verifier"),
      e("verifier", "solver", { loop: true, label: "retry" }),
      e("verifier", "final"),
      e("verifier", "response"),
      e("solver", "response"),
      e("final", "response"),
      e("ollama", "solver", { label: "LLM" }),
      e("response", "dashboard"),
    ],
    states: [
      { id: "LOW", label: "Low", detail: "Planner → Solver → Response · 0 verifier loops · 70% threshold · verbose answer with examples", active: [...neuroflowPipeline, "solver>response"] },
      { id: "MEDIUM", label: "Medium", detail: "Planner → Solver → Verifier → Response · 1 loop · 80% threshold · balanced answer", active: [...neuroflowPipeline, "solver>verifier", "verifier>solver", "verifier>response"] },
      { id: "HIGH", label: "High", detail: "Planner → Solver → Verifier → Final check → Response · 2 loops · 95% threshold · bullet points only", active: [...neuroflowPipeline, "solver>verifier", "verifier>solver", "verifier>final", "final>response"] },
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
    kicker: "Research · NIT Bhopal",
    summary:
      "Ongoing research on vision-language models for handwritten text recognition in multilingual and Indian-language documents — benchmarking OCR and VLM systems head-to-head.",
    context: "Research internship at NIT Bhopal, under the guidance of a PhD scholar from IIT Bombay.",
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
