export type Contribution = {
  id: string;
  project: string;
  /** owner/name on GitHub. */
  repo: string;
  /** What the project is, in a few words. */
  about: string;
  pr: number;
  title: string;
  /** What was wrong and what the change does. */
  summary: string;
  status: "merged" | "in-review";
  /** Month merged (or opened, while in review). */
  date: string;
  lang: string;
};

/** Merged first, then in review; newest first within each. */
export const contributions: Contribution[] = [
  {
    id: "headlamp-8263",
    project: "Headlamp",
    repo: "kubernetes-sigs/headlamp",
    about: "Kubernetes web UI and desktop app · Kubernetes SIGs",
    pr: 8263,
    title: "app: Hide console windows of plugin and Azure CLI commands on Windows",
    summary:
      "The Electron app opened a console window on Windows for every plugin command (minikube, az, gh) and Azure CLI call. They now spawn hidden, with tests that fail without the fix.",
    status: "merged",
    date: "Nov 2026",
    lang: "TypeScript",
  },
  {
    id: "reticle-1833",
    project: "Reticle",
    repo: "reticlehq/reticle",
    about: "Runtime perception for AI coding agents",
    pr: 1833,
    title: "fix(browser): keep TanStack queries apart when a key part is an object",
    summary:
      "The TanStack Query adapter turned object key parts into “[object Object]”, so different queries overwrote each other's state. Object parts are now serialised the way TanStack hashes keys.",
    status: "merged",
    date: "Oct 2026",
    lang: "TypeScript",
  },
  {
    id: "youtube-4415",
    project: "Improve YouTube",
    repo: "code-charity/youtube",
    about: "Open-source YouTube browser extension",
    pr: 4415,
    title: "fix: retry subtitles language and auto-dubbing until the player is ready",
    summary:
      "During YouTube's in-page navigation, the subtitle-language and auto-dubbing settings ran once before the player was ready and silently did nothing. A bounded retry helper now applies them once it loads.",
    status: "merged",
    date: "Oct 2026",
    lang: "JavaScript",
  },
  {
    id: "tabularis-1259",
    project: "Tabularis",
    repo: "TabularisDB/tabularis",
    about: "Open-source desktop SQL workspace",
    pr: 1259,
    title: "docs(create-plugin): state the minimum just version in the generated README",
    summary: "Generated driver-plugin READMEs now state the minimum version of the just task runner their recipes need, checked by a scaffold test.",
    status: "merged",
    date: "Oct 2026",
    lang: "TypeScript",
  },
  {
    id: "meshery-22835",
    project: "Meshery",
    repo: "meshery/meshery",
    about: "Cloud native manager · CNCF",
    pr: 22835,
    title: "[Server] Close response bodies in eight RemoteProvider methods",
    summary:
      "Eight remote-provider calls never closed their HTTP response bodies, leaking a connection and a file descriptor per call. Each now drains and closes the body, with tests that fail on master.",
    status: "in-review",
    date: "Nov 2026",
    lang: "Go",
  },
  {
    id: "meshery-22833",
    project: "Meshery",
    repo: "meshery/meshery",
    about: "Cloud native manager · CNCF",
    pr: 22833,
    title: "[Server] Check URL and request errors in RemoteProvider save calls",
    summary:
      "Five save calls ignored URL-parse and request errors and could panic on a nil URL. They now return the existing error codes, with a test per method.",
    status: "in-review",
    date: "Nov 2026",
    lang: "Go",
  },
  {
    id: "meshery-22837",
    project: "Meshery",
    repo: "meshery/meshery",
    about: "Cloud native manager · CNCF",
    pr: 22837,
    title: "[Server] Check the home directory error before defaulting KUBECONFIG_FOLDER",
    summary:
      "Startup checked a stale error, so a failed home-directory lookup went unreported and the kubeconfig folder became a relative path. The error is now checked where it happens.",
    status: "in-review",
    date: "Nov 2026",
    lang: "Go",
  },
  {
    id: "jitsi-18103",
    project: "Jitsi Meet",
    repo: "jitsi/jitsi-meet",
    about: "Open-source video conferencing",
    pr: 18103,
    title: "fix(welcome): add a visible label to the room name input",
    summary:
      "The welcome page's room-name field had no visible label (WCAG 2.1 · 3.3.2). It now has one, reusing the existing translated string, so web and native match.",
    status: "in-review",
    date: "Oct 2026",
    lang: "TypeScript",
  },
  {
    id: "ruxailab-2591",
    project: "RUXAILAB",
    repo: "ruxailab/RUXAILAB",
    about: "Remote usability-testing lab",
    pr: 2591,
    title: "fix(user-test): skip the consent for a returning participant who already accepted it",
    summary:
      "Participants returning to a study had to accept the consent again. A new navigation step decides where Start leads from their saved answer.",
    status: "in-review",
    date: "Nov 2026",
    lang: "JavaScript",
  },
];

export const prUrl = (c: Contribution) => `https://github.com/${c.repo}/pull/${c.pr}`;
export const mergedCount = contributions.filter((c) => c.status === "merged").length;
