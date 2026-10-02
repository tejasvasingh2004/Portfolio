import {
  Activity, Brain, Briefcase, CheckCheck, Cpu, Database, Eye, FileCode, FileDown, Filter, Gauge,
  GitBranch, Keyboard, Layers, LayoutDashboard, ListChecks, Mail, MessageSquare, Network, ScanText,
  Send, ShieldCheck, Sparkles, Terminal, User, Utensils, Waves, Check, FolderOpen, Rotate3d, LocateFixed, Search,
  type IconNode,
} from "lucide";
import { siGithub, siLeetcode } from "simple-icons";

/** Stroke icons (Lucide) — rendered as outlines. */
const stroke = {
  activity: Activity,
  brain: Brain,
  briefcase: Briefcase,
  "check-check": CheckCheck,
  check: Check,
  cpu: Cpu,
  database: Database,
  eye: Eye,
  "file-code": FileCode,
  "file-down": FileDown,
  filter: Filter,
  folder: FolderOpen,
  gauge: Gauge,
  "git-branch": GitBranch,
  keyboard: Keyboard,
  layers: Layers,
  layout: LayoutDashboard,
  locate: LocateFixed,
  "rotate-3d": Rotate3d,
  search: Search,
  "list-checks": ListChecks,
  mail: Mail,
  message: MessageSquare,
  network: Network,
  "scan-text": ScanText,
  send: Send,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  terminal: Terminal,
  user: User,
  utensils: Utensils,
  waves: Waves,
} satisfies Record<string, IconNode>;

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.689 1.637-1.716 3.37-1.716 3.601 0 4.267 2.37 4.267 5.455v6.248zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

/** Filled brand marks — rendered solid. */
const fill = {
  github: siGithub.path,
  leetcode: siLeetcode.path,
  linkedin: LINKEDIN_PATH,
} as const;

export type IconName = keyof typeof stroke | keyof typeof fill;

const attrs = (o: Record<string, string | number | undefined>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

/** Inner SVG markup (no <svg> wrapper) on a 24×24 viewBox. */
export function iconMarkup(name: IconName): { body: string; filled: boolean } {
  if (name in fill) return { body: `<path d="${fill[name as keyof typeof fill]}"/>`, filled: true };
  const node = stroke[name as keyof typeof stroke];
  return { body: node.map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join(""), filled: false };
}

/** Standalone SVG string, used to rasterise icons into the 3D texture atlas. */
export function iconSvg(name: IconName, color: string, size = 96, strokeWidth = 1.75): string {
  const { body, filled } = iconMarkup(name);
  const paint = filled
    ? `fill="${color}"`
    : `fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${paint}>${body}</svg>`;
}
