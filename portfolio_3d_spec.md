# portfolio_3d_spec.md — Tejasva Singh Chouhan · 3D Portfolio

Status: **Approved and implemented** (branch `feat/3d-portfolio`). See "Implementation notes" at the end for where the build differs from this draft.
Legend: `TBD` = content still needed from Tejasva · `ASSUMED` = my inference, please confirm · `DRAFT` = copy I wrote, please edit.

---

## 1. Project Overview

**Goal.** A portfolio that shows, within ten seconds, that Tejasva builds *systems*: backend infrastructure, database internals, and multi-agent AI. It should also be the most memorable portfolio a recruiter opens that week.

**Target audience (priority order).**
1. Recruiters / hiring managers for SWE, backend, and AI-engineering internships and new-grad roles. They skim and need the facts in under a minute.
2. Engineers doing a technical screen. They want architecture, trade-offs and repos.
3. Research supervisors / labs, because of the VLM handwritten-text-recognition work.

**Visual direction.** Taken from the three reference images: a high-key white studio, thick rounded white tiles, rounded "trace" connectors running across the floor, orange signal nodes at the junctions, a tilted dashboard screen, and stacked cards. All of it is shown from a high three-quarter angle. It should look like a premium hardware product render, not a Three.js demo.

**Interaction philosophy.** *The 3D scene is the navigation, and HTML carries the content.* Every object in the scene is a door into a readable panel. Visitors can explore freely but can't get lost. There is always a visible way home (top bar, `Esc`, ⌘K).

**Technical direction.** Next.js (App Router, static generation) with React Three Fiber, Drei and Tailwind. A persistent canvas in the root layout means route changes drive camera moves. Every view has a real URL that can be shared and indexed. A full 2D fallback renders the same content.

---

## 2. Experience Concept

### Metaphor: "The Systems Board"

The scene is Tejasva's engineering workspace, drawn as a **system architecture diagram you can stand inside**. It's a white board where each part of his work is a physical module, joined by signal traces to a central **Identity Hub**. Hovering a module sends an orange pulse from the hub along the trace to it, which says "this is connected to me" without any words.

This is the main idea. A traditional portfolio *lists* things. This one *wires them together*, which is exactly what a backend and agent engineer does.

```
                         [ PROJECTS MONITOR ]                 [ AI LAB ]
                         tilted screen + 4 cards               agent graphs
                                   \                          /
                                    \                        /
                                     \──── ● IDENTITY HUB ●─/
                                     /     glass cube + "TS"  \
                                    /                          \
                         [ SKILLS BOARD ]      [ EXPERIENCE ]      [ CONTACT ]
                          keycap clusters       card stack          request card
```

### Zones mapped to real content

| Zone | Represents | Real content inside |
|---|---|---|
| **Identity Hub** | "Who I am" | Name, title, bio, photo, SGSITS education |
| **Projects Monitor** | "Things I've built" | NeuroFlow · Hybrid-DB · AI Code-Gen CLI · Dinesphere (`TBD`) |
| **AI Lab** | "Systems I build around AI" | NeuroFlow multi-agent graph · Code-Gen CLI agent workflow · HTR/VLM research bench |
| **Experience Stack** | "Where I've worked" | NIT Bhopal (Research) · IndhanPay · E-NOTEBOOK |
| **Skills Board** | "What I build with" | Clustered keycaps that link to the projects where each skill was used |
| **Contact Card** | "Let's build something" | Email, GitHub, LinkedIn, LeetCode, résumé |

---

## 3. 3D Scene Design

**World.** An off-white board about 26 × 18 units with a very faint 1-unit grid (reference image 3). Its edges fade into the background through a radial floor gradient, so the board looks like it sits in endless studio space and has no visible edges.

**Camera.** `PerspectiveCamera` with a **narrow FOV (28°)**. That gives the reference's near-isometric, product-render compression while keeping real perspective. The default angle is high, front-right, around 40° elevation.

**Lighting (procedural, no HDR download).**
- `Environment` built from drei `Lightformer`s: one large soft rectangle overhead-left (key), one thin strip right (rim), and a warm low-intensity fill. This gives soft white reflections on the rounded bevels.
- One `directionalLight` for definition. It casts no realtime shadows (see Shadows).
- Tone mapping: **AgX**, exposure tuned so whites read as `#FAFAF8`, not clipped `#FFF`. Getting this right decides whether a white scene looks premium or flat grey.

**Materials.**
| Use | Material | Values |
|---|---|---|
| Tiles, slabs, cards | `MeshStandardMaterial` | color `#FAFAF8`, roughness 0.55, metalness 0 |
| Board / floor | `MeshStandardMaterial` | `#F1F1EE`, roughness 0.9 |
| Traces (connectors) | `MeshStandardMaterial` | `#ECECE8`, roughness 0.4 (a slight sheen like the references) |
| Icons on tiles | alpha-mask texture + tint uniform | idle `#9A9AA0`, active `#FF6A13` |
| Orange glow strips / nodes | `MeshBasicMaterial`, `toneMapped:false` | `#FF6A13` with HDR intensity 1.5–3 |
| Glass cube (hub) | `MeshPhysicalMaterial` transmission (high tier) / plain transparent (low tier) | |

**Glow without noise.** The orange "underglow" from the references is faked with a soft radial-gradient plane under the active tile (additive blending, opacity animated). Full-screen bloom is used only on the high tier, with a threshold above 1.0, so it catches *only* the deliberately HDR orange elements.

**Shadows.**
- Static: drei `ContactShadows` rendered **once** (`frames={1}`, 1024² desktop / 512² mobile) for the whole board. This gives soft, AO-like contact shadows at zero per-frame cost.
- Dynamic: each interactive object has a cheap **blob-shadow plane** that shrinks and fades as the object lifts on hover.
- Ambient occlusion: N8AO post-pass on the **high tier only** (half resolution) for crevice depth between stacked slabs.

**Reflections.** Only from the environment (rounded bevels catch the Lightformer strips). No mirror floor.

**Depth.** Comes from layering (stacked slabs and cards), height differences between zones, the floor fade, and focus dimming. There is no depth-of-field, which is expensive and makes things blurry.

**Object hierarchy (scene graph).**
```
<Stage>
 ├─ <Lighting/>  <Environment/>
 ├─ <Board/>  (floor, grid, baked contact shadows)
 ├─ <Traces/> (all connectors: one merged geometry) + <Pulses/> (1 InstancedMesh) + <Junctions/> (1 InstancedMesh)
 ├─ <Hub/>
 ├─ <ProjectsZone>  <Monitor/> <ProjectCard ×N/>
 ├─ <AiLabZone>     <SystemSwitcher/> <AgentGraph system=…/>
 ├─ <ExperienceZone><ExperienceCard ×3/>
 ├─ <SkillsZone>    <SkillCluster ×6><Keycap ×n/></SkillCluster>
 └─ <ContactZone>   <ContactCard/> <LinkTile ×4/>
```

**Background.** CSS `#F4F4F2` behind a transparent canvas, so the page background and the 2D fallback match exactly.

**Interaction zones.** Each zone has a single invisible bounding box for zone-level hover/click. Child objects only become raycast targets while their zone is focused. That keeps raycasting cheap and stops visitors accidentally picking a tiny object from across the board.

---

## 4. Main 3D Objects

Each object below follows one shape: **Form** (what it looks like) · **Idle** · **Hover** · **Click**.

### 4.1 Identity Hub — "my engineering identity"
- **Form:** A three-layer stacked slab (reference 2, bottom-centre) with an orange underglow rim on the lowest layer. On top sits a **glass cube** (reference 1) holding an orange extruded **"TS" monogram**.
- **Idle:** The monogram bobs very slowly (±0.03 units, 6 s period). This is the only ambient motion in the scene besides the heartbeat pulse (see §20).
- **Hover:** The stack lifts 0.08, the rim glow brightens, and a tooltip shows "About Tejasva".
- **Click:** Opens `ABOUT`. The camera moves close and the About panel opens.

### 4.2 Projects Monitor + Project Cards — "things I've built"
- **Form:** A large tilted screen (reference 1/2 dashboard), 7 × 4.5 units, on a slim stand. In front of it, **project cards** sit on short traces that converge into a small base tile (reference 2 layout). Each card shows a project initial or logo, its name, and an orange category tag.
- **Monitor screen content:** At HOME it shows a procedural "overview" UI: card count, stack bars, an orange sparkline. When a project is selected it shows that project's screenshot, or a procedural mockup if no screenshot exists (`TBD`: screenshots needed).
- **Hover (zone):** The monitor screen lights up and a tooltip reads "Projects · 4 built".
- **Click (zone):** Opens `PROJECTS`. The camera frames the monitor and cards, and the cards fan out slightly.
- **Hover (card):** The card lifts and its trace pulses orange.
- **Click (card):** Opens `PROJECT_DETAIL/<slug>`. The card rises and glows, the monitor swaps to that project, and the detail panel opens.
- **Hybrid-DB special:** In its detail view, a small **3D B+ tree** of mini-slabs appears on the monitor stage. Hovering a key range lights the lookup path from root to leaves. It's a modest touch that shows real knowledge of database internals. *(Phase-2 enhancement, not needed for launch.)*

### 4.3 AI Lab — "systems I build around AI" (flagship zone)
- **Form:** A raised sub-board holding a **node graph of tiles and traces**, the closest match to reference image 1. Each node is an agent, tool, model or store. The active path glows orange. A row of three small switch tiles selects which system is shown: **NeuroFlow · Code-Gen CLI · HTR Bench**.
- **Hover (zone):** A single pulse runs through the current graph, and a tooltip reads "AI Lab · 3 systems".
- **Click (zone):** Opens `AI`. The camera frames the lab and the AI overview panel opens.
- **Click (node):** Opens `AI_NODE`. The camera focuses on the node and the panel shows what that node does, its inputs and outputs, and its implementation (see §11).

### 4.4 Experience Stack — "where I've worked"
- **Form:** Three stacked cards (reference 1, bottom-left), newest on top. Each card shows the org logo or monogram, role and dates.
- **Hover:** The stack splays slightly, like riffling a deck.
- **Click:** Opens `EXPERIENCE`. The cards **deal out along a trace** into a left-to-right timeline (E-NOTEBOOK → IndhanPay → NIT Bhopal / Present), and the experience panel opens. Clicking an individual card scrolls the panel to that role.

### 4.5 Skills Board — "what I build with"
- **Form:** Six small plates, one per cluster, each holding **keycaps** with monochrome tech logos (Simple Icons alpha masks) or short text.
- **Hover (keycap):** The key presses down 0.04 and **traces light up to every project or role that used the skill**. For example, hovering LangGraph lights NeuroFlow.
- **Click (zone):** Opens `SKILLS`.
- **Click (keycap):** Filters the panel to "Where I used FastAPI". Skills become evidence, not a list.

### 4.6 Contact Card — "let's build something"
- **Form:** The "request card" from reference 1 (bottom-right): avatar circle, two text lines, and a row of three step dots ending in an **orange check**. Around it sit four small link tiles: mail, GitHub, LinkedIn, LeetCode.
- **Hover:** The step dots fill in sequence and the check pops.
- **Click:** Opens `CONTACT`. Clicking a link tile opens that link (mail opens the `mailto:`).

---

## 5. Interaction System

### Mouse (desktop)
| Input | Behaviour |
|---|---|
| Left-drag | Orbit, constrained (see §6). Damped. |
| Wheel / trackpad pinch | Dolly zoom within per-state min/max distance |
| Right-drag | Disabled; panning is never needed and only gets people lost |
| Hover | Object hover state + tooltip (§7) |
| Click | Activate (§8). A click is only counted if the pointer moved < 6 px, so drags never trigger clicks |
| Double-click empty board | Return to `HOME` |

### Keyboard
| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus through the **object proxy list** (§16). The focused object shows its hover state and an orange outline |
| `Enter` / `Space` | Activate the focused object |
| `Esc` | Go back one level (detail → zone → home); closes panels |
| `1`–`6` | Jump to Hub, Projects, AI Lab, Experience, Skills, Contact |
| `←` / `→` | Previous / next item within the focused zone (projects, AI nodes, roles) |
| `⌘K` / `Ctrl+K` | **Command palette**: search and jump to any project, system, skill, role or link. Fits the "developer OS" idea and is also the fastest route for recruiters |
| `H` | Home |

Shortcuts are listed in a small `?` popover in the top bar and are ignored while focus is in a text input.

### Touch (mobile / tablet)
| Gesture | Behaviour |
|---|---|
| Tap | Select. **There is no hover-only information:** a tap does what hover + click do on desktop |
| One-finger drag | Tablet: constrained orbit. Phone: gentle tilt only (±10°) |
| Pinch | Zoom (tablet only; phone scene has fixed framing) |
| Swipe left/right on the scene in a focused zone | Previous / next item |
| Swipe down on bottom sheet / drag handle | Collapse, then close |
| Edge-swipe back (OS) | Router back = camera back (works because every state is a URL) |

---

## 6. Camera System

**Implementation:** drei `CameraControls` (built on `camera-controls`). `setLookAt(pos, target, true)` gives critically-damped, interruptible transitions, so a visitor can grab and orbit mid-flight without a jarring snap. The **route is the single source of truth**: `pathname → cameraState → setLookAt`.

**Panel-aware framing:** When a desktop side panel is open (right side, 440 px), `camera.setViewOffset` shifts the frame so the focused object is centred in the *visible* area, not hidden under the panel.

### States
Coordinates are world units and are starting values, to be tuned visually during the build. `smoothTime` is the camera-controls damping, roughly equal to perceived duration ÷ 3.

| State | Route | Camera position | Target | ~Duration | Orbit limits | UI state |
|---|---|---|---|---|---|---|
| `HOME` | `/` | (15, 15, 17) | (0, 0, 0) | 1.4 s | azimuth ±35°, polar 35°–62°, dist 18–34 | Hero overlay, top bar, no panel |
| `ABOUT` | `/about` | (3.5, 4.5, 6) | (0, 0.8, 0) | 1.1 s | ±20°, dist 5–10 | About panel |
| `PROJECTS` | `/projects` | (-1, 5, 5) | (-5.5, 1.6, -4) | 1.2 s | ±25°, dist 7–14 | Projects index panel |
| `PROJECT_DETAIL` | `/projects/[slug]` | card-relative: monitor + card in frame | monitor centre | 0.9 s | ±15° | Project detail panel |
| `AI` | `/ai` | (11, 9, 5) | (5.5, 0, -3.5) | 1.2 s | ±25°, dist 8–16 | AI overview panel |
| `AI_SYSTEM` | `/ai/[system]` | same as `AI` | graph centre | 0.6 s | ±25° | System panel; graph swaps |
| `AI_NODE` | `/ai/[system]?node=x` | node + (2.5, 3, 3.5) | node | 0.8 s | ±15° | Node panel section |
| `EXPERIENCE` | `/experience` | (3, 5, 12) | (0, 0.5, 5) | 1.2 s | ±20° | Timeline panel |
| `SKILLS` | `/skills` | (-1, 6, 9) | (-6, 0.5, 3) | 1.2 s | ±20° | Skills panel |
| `CONTACT` | `/contact` | (10, 4.5, 10) | (6, 0.6, 4) | 1.1 s | ±20° | Contact panel |

**Easing:** camera-controls' spring damping (`smoothTime` 0.35–0.5), which naturally eases in and out. For long hops (for example Contact → Projects), the camera **arcs up** through a mid-point above the hub instead of cutting straight through objects.

**Reduced motion:** No flights. A 150 ms opacity cross-fade, then the camera jumps to the new state.

**First load:** One 1.6 s "settle". The camera starts slightly higher and further out and descends into `HOME`. It plays once per session and is skipped with reduced motion.

---

## 7. Hover System

Every interactive object uses one shared hook, `useInteractive(id)`, so all objects behave the same way.

```
IDLE ──pointer enter (60 ms intent delay)──▶ HOVER ──click──▶ ACTIVE
  ▲                                            │                 │
  └──────────pointer leave (120 ms grace)──────┘   Esc / other ──┘
                                     DISABLED (not in the focused zone: no raycast, no cursor)
```

| Property | IDLE | HOVER | ACTIVE | DIMMED (another zone active) |
|---|---|---|---|---|
| Lift (y) | 0 | +0.08 | +0.14 | 0 |
| Scale | 1 | 1.03 | 1.04 | 1 |
| Icon tint | grey `#9A9AA0` | blend toward orange 40% | orange `#FF6A13` | grey |
| Underglow opacity | 0 | 0.35 | 0.8 | 0 |
| Trace pulse to hub | — | one pulse | steady lit trace | — |
| Blob shadow | full | shrinks 10% / fades 15% | shrinks 15% | full |
| Material | normal | normal | normal | lerp 55% toward background colour |
| Cursor | default | `pointer` | `pointer` | default |
| Tooltip | — | DOM chip after 60 ms | hidden (the panel takes over) | — |

All transitions use damped lerps (`maath/easing.damp`, about 180 ms). There's no bouncing and no overshoot. Only one object can be hovered at a time.

**Tooltip:** A single DOM element, positioned each frame by projecting the object's anchor point into screen space. It holds a title plus one line of context ("NeuroFlow · LangGraph multi-agent"). It's styled like the panels (white, 1 px border, soft shadow) and flips its side near the screen edges.

---

## 8. Click System

### Zone click (example: Projects)
```
click Projects zone
  → router.push('/projects')                  (URL updates; back button works)
  → viewStore: { state: PROJECTS, focus: 'projects' }
  → other zones go to DIMMED (300 ms)
  → camera setLookAt → PROJECTS framing (~1.2 s)
  → at ~60% of the flight: project cards fan out (staggered 40 ms)
  → side panel / bottom sheet enters (320 ms, slide + fade)
  → child objects (cards) become raycastable
  → aria-live: "Projects view. 4 projects."
```

### Item click (example: NeuroFlow card)
```
click NeuroFlow card
  → router.push('/projects/neuroflow')
  → card ACTIVE (rises, glows), sibling cards dim slightly
  → monitor screen cross-fades to the NeuroFlow screenshot / mockup
  → camera tightens (0.9 s)
  → panel content swaps (old fades out 120 ms, new staggers in)
  → panel CTA: "Open system graph in AI Lab →" (/ai/neuroflow)
```

### Back / close
`Esc`, the panel ✕, or the router back button all go **up one level** with the reverse animation. Clicking the empty board while focused also goes up one level. The top-bar "TS" logo always goes to `HOME`.

---

## 9. UI / 3D Hybrid Architecture

| Three.js (canvas) handles | HTML / React handles |
|---|---|
| Environment, board, lighting, shadows | All readable text: bios, descriptions, timelines |
| Zone objects and their states | Top bar, command palette, shortcuts popover |
| Camera states and transitions | Side panel (desktop) / bottom sheet (mobile) |
| Pulses, traces, hover feedback | Tooltips (DOM, positioned from 3D) |
| AI graphs (as spatial diagrams) | Buttons, links, contact actions |
| Monitor screen imagery | Images, galleries, video |
| | Hero headline (the LCP element, server-rendered) |
| | Object proxy list (keyboard + screen readers) |
| | Entire 2D fallback |

**Layering:**
```
z: 0  <body bg #F4F4F2>
z: 1  <Canvas> (fixed, full-viewport, transparent, aria-hidden)
z: 2  Tooltips + zone labels (pointer-events: none)
z: 3  Hero overlay (home only)
z: 4  Panels / bottom sheet
z: 5  Top bar
z: 6  Command palette / dialogs
```

**One rule:** if a fact matters for hiring (name, role, project facts, dates, links), it **lives in the HTML** for that route. The canvas can show it again but never holds it alone.

---

## 10. Project Detail Experience

**Sequence:** the camera focuses → the card goes ACTIVE → the monitor shows the project → the rest of the scene dims → the panel opens. The browser never navigates away from the 3D scene: it's the same canvas with a new URL.

**Panel layout (desktop 440 px right panel, scrollable; mobile full-height bottom sheet):**
```
┌──────────────────────────────────────┐
│ ← Projects            2 / 4    ✕    │  sticky header: back, pager (←/→), close
│ AI · 2026                            │  category tag (orange) + year
│ NeuroFlow                            │  H1
│ Cognitive-state-aware multi-agent…   │  one-liner
│ [ GitHub ↗ ]  [ Live ↗ ]             │  only rendered when URLs exist
├──────────────────────────────────────┤
│ ▢ hero screenshot / video (16:9)     │  click → lightbox
├──────────────────────────────────────┤
│ Problem                              │
│ Solution                             │
│ Architecture  [mini diagram]  → "Explore in AI Lab"
│ Key engineering decisions            │  3–5 bullets
│ Tech stack  [chip][chip][chip]       │  chips link to /skills?filter=x
│ My role                              │
│ Challenges                           │
│ Gallery  ▢ ▢ ▢                       │
├──────────────────────────────────────┤
│ ← Hybrid-DB          AI Code-Gen →   │  prev/next
└──────────────────────────────────────┘
```
Sections with no data are not rendered at all, so there are no empty headings.

### Project content (from résumé; `TBD` where missing)

**NeuroFlow** — Cognitive-State-Aware Adaptive AI Agent System · 2026 · `ASSUMED` that the `projects/NeuroFlow` folder is this project
- Stack: Next.js, FastAPI, LangGraph, Ollama
- Multi-agent system that adapts agent workflows to the user's workload level.
- FastAPI + LangGraph backend with Planner, Research, Verifier and Summarizer agents.
- Adaptive routing policies for NORMAL / MODERATE / HIGH / OVERLOADED workload states.
- Next.js dashboard visualising agent execution paths, workload states and system metrics in real time.
- `TBD`: GitHub URL, live URL/demo video, screenshots, how workload is detected, routing table per state.

**Hybrid-DB** — Custom Database Engine with B+ Tree Indexing · 2025 · `ASSUMED` that the `projects/Hybrid-DB` folder is this project
- Stack: Java, Spring Boot
- Fully functional B+ Tree: lookups, inserts, deletes, range queries.
- DBMS internals: node split/merge, file-based persistence, caching, block storage.
- REST API layer that executes CRUD directly through the B+ Tree.
- GitHub: https://github.com/tejasvasingh2004/Database_Project
- `TBD`: why "Hybrid"? Screenshots or a diagram; any benchmarks.

**AI Code-Gen Workflow CLI** · 2025 (display name `TBD`)
- Stack: TypeScript, Node.js, Commander.js
- CLI orchestrating AI-assisted code generation with plan → review → approve → verify workflows.
- Interactive and batch execution modes; modular commands.
- Staging system with diff-based review and selective application of changes.
- GitHub: https://github.com/tejasvasingh2004/Ai_clone-traycer_project-
- `TBD`: terminal GIF/recording (this would look excellent on the monitor).

**Dinesphere** — `TBD` (not on the résumé; folder is empty). Needs the full project template.

---

## 11. AI Agent Experience

**What it says:** *"I don't call an API. I design the graph around it."* The AI Lab shows three real systems as explorable node graphs. A switcher selects the system, and **clicking any node opens an explanation of that node**.

### System A — NeuroFlow (default)
```
            USER REQUEST
                 │
                 ▼
       ┌─ WORKLOAD ESTIMATOR ─┐   (cognitive state: NORMAL / MODERATE / HIGH / OVERLOADED)
       │                      │
       ▼                      ▼
   ADAPTIVE ROUTER ◀──── POLICY TABLE
       │
  ┌────┼──────────┬───────────┐
  ▼    ▼          ▼           ▼
PLANNER→RESEARCH→VERIFIER→SUMMARIZER
                                │
       OLLAMA (local LLM) ◀─────┤  (all agents call it)
                                ▼
                            RESPONSE ──▶ NEXT.JS DASHBOARD (execution path + metrics)
```
**Signature interaction:** A 4-position **workload switch** (a physical slider tile). Changing the state **re-routes the orange path live**, so visitors watch the graph adapt. This is the single most memorable moment on the site, because it shows the real idea of the project in about two seconds.
- `TBD (needed for this)`: which agents run in each state. For example, does OVERLOADED skip Research or Verifier, or produce a shorter summary? How is the workload estimated?

### System B — AI Code-Gen CLI
```
PROMPT → PLANNER → GENERATOR → STAGING (diff) → REVIEW → APPROVE ─┬─▶ APPLY (selective) → VERIFY
                                                                  └─▶ REJECT → back to PLANNER
```
Interaction: The staging node opens a small **animated diff** (green/red lines in the panel) showing selective application.

### System C — HTR Bench (NIT Bhopal research)
```
HANDWRITTEN DOC (multilingual / Indic)
        │
  ┌─────┼─────────┬──────────┬──────────────┐
  ▼     ▼         ▼          ▼              ▼
PaddleOCR EasyOCR TrOCR   VLM (multimodal transformer)
  └─────┴─────────┴──────────┴──────────────┘
                 │
        EVALUATION (CER / WER)
                 │
          COMPARATIVE REPORT
```
Interaction: Model nodes are parallel lanes into an evaluation tile. If results can be shared, the panel shows a CER/WER bar chart. `TBD`: whether any findings or numbers are public.

### Node panel template
`Role` · `Inputs → Outputs` · `Implementation` (framework, model, prompt or tool pattern) · `Why it exists` · `Code link` (anchor into the repo when available).

### Graph rendering
Nodes are `RoundedBox` tiles with icon decals. Edges are Manhattan-routed traces with rounded corners (the reference style), built as merged `TubeGeometry`. Pulses are a single `InstancedMesh` moving along edge curves via a shader uniform. Switching systems = tiles sink into the board, then the new set rises (staggered, 500 ms).

---

## 12. Skills Visualization

Six keycap clusters on the board. Every skill carries `usedIn: [projectIds | roleIds]`, which drives the connecting traces and the "where I used it" filter.

```
LANGUAGES        FRONTEND          BACKEND           DATA              AI / ML                TOOLS & INFRA
├ C              ├ React           ├ Node.js         ├ PostgreSQL      ├ LangGraph            ├ Git / GitHub
├ C++            ├ Next.js         ├ Express         ├ Appwrite        ├ LangChain            ├ Docker
├ JavaScript     ├ Tailwind CSS    ├ FastAPI         ├ Knex.js         ├ Ollama               ├ Netlify
├ TypeScript     ├ Responsive/UI   ├ REST APIs       ├ Schema design   ├ Multi-agent systems  ├ JWT / Bcrypt
├ SQL            │                 ├ Spring Boot*    ├ DB internals*   ├ VLMs                 ├ Nodemailer
├ HTML / CSS     │                 │  (B+ Tree)      │  (B+ Tree)      ├ OCR evaluation       ├ Zoho API
├ Java*          │                 │                 │                 │  (CER/WER)           │
└ Python*        │                 │                 │                 │                      │
```
`*` = **not in your résumé's skills section but implied by your projects** (Java/Spring Boot → Hybrid-DB; Python → FastAPI/LangGraph/OCR tooling). Shown only if you confirm.

Panel view: clusters as headed groups. Each skill is a chip; clicking it shows the projects and roles it powered. There are **no proficiency bars or percentages**, because they mean nothing and recruiters distrust them.

---

## 13. Visual Design System

### Colour tokens
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F4F4F2` | page / scene background (warm off-white) |
| `--surface` | `#FFFFFF` | panels, cards |
| `--surface-2` | `#F8F8F6` | inset areas, chips |
| `--line` | `#E6E6E2` | 1 px borders, dividers |
| `--ink` | `#121214` | primary text |
| `--ink-2` | `#5C5C63` | secondary text (AA on white) |
| `--ink-3` | `#9A9AA0` | tertiary labels / idle icons (non-text or large only) |
| `--accent` | `#FF6A13` | interaction accent: glows, active states, dots, focus visuals |
| `--accent-ink` | `#C2410C` | **orange text** on white (meets AA 4.5:1; plain `--accent` fails for body text) |
| `--accent-soft` | `#FFEDE1` | tag backgrounds, selection |

Dark mode is **not** planned. The light studio *is* the identity. The site sets `color-scheme: light` explicitly so OS dark mode doesn't invert form controls.

### Typography — **Geist Sans + Geist Mono**
- **Why Geist:** It's designed for developer interfaces, with tight, precise geometry that matches the hard-edged-but-rounded tiles. Its **Mono sibling** gives a built-in "system" voice for labels (`AGENT / PLANNER`, `2025 — PRESENT`, the boot log) without mixing type families. It's free and self-hosted via `next/font` (no layout shift).
- Scale: Display 56/60 (−2% tracking) · H1 36 · H2 24 · H3 18 · Body 16/26 · Small 14 · Mono label 12 uppercase, +6% tracking.

### Cards and panels
- Radius 16 px (panels), 12 px (cards), 8 px (chips). These echo the 3D tile bevel radius.
- Border 1 px `--line`. Shadow: `0 1px 2px rgb(0 0 0 / .04), 0 12px 32px -8px rgb(0 0 0 / .10)`.
- Frosted glass **only** on the top bar (`backdrop-blur: 12px`, 80% white). Nowhere else.
- Orange is used sparingly: one accent per component (an active dot, a tag, a CTA underline).

### Iconography
Lucide (UI), Simple Icons (tech logos, rendered monochrome). Both feed a single generated **icon atlas texture** for the 3D tiles.

---

## 14. Responsive Design

| Tier | Width | 3D experience | Content surface |
|---|---|---|---|
| **Desktop** | ≥ 1024 px | Full Systems Board, orbit, all effects allowed by GPU tier | 440 px right side panel |
| **Tablet** | 640–1023 px | Full board layout, reduced effects (no AO/bloom), DPR ≤ 1.5 | Landscape: 380 px side panel · Portrait: bottom sheet |
| **Phone** | < 640 px | **Different scene**: "Keycap Home Screen" (below) | Bottom sheet |

### Phone: designed separately, not a shrunk desktop
A portrait-shaped scene: the Hub sits at the top and below it is a **3 × 2 grid of large keycap tiles** (Projects, AI Lab, Experience, Skills, Contact, Résumé), joined to the hub by short traces. It works like a home screen made of physical keys.
```
   ┌──────────────────────┐
   │      ◇ TS hub        │  name + title (HTML, above canvas)
   │     ╱  │  ╲          │
   │  [⌗]  [✦]  [▤]       │  keycaps (tap = physical key-press animation)
   │  [◎]  [✉]  [↓]       │
   ├──────────────────────┤
   │ ▔▔▔ bottom sheet ▔▔▔ │  peek (40%) → drag to full
   └──────────────────────┘
```
- Tap a key → it **presses down** (haptic via `navigator.vibrate(8)` where supported) → the camera tilts toward it → a bottom sheet rises to the 40% "peek" with a summary → drag up for full content.
- Inside AI Lab on a phone, the graph is shown **flattened as a top-down diagram** (readable at phone width). Nodes are tappable.
- The canvas takes the top ~55% of the viewport. The page below is normal scrollable HTML (quick-links list), so a phone visitor is never stuck inside a canvas.

---

## 15. Performance

### Budgets
| Metric | Desktop | Phone |
|---|---|---|
| Draw calls (steady) | ≤ 120 | ≤ 45 |
| Triangles | ≤ 250k | ≤ 60k |
| Initial JS (excluding the lazy 3D chunk) | ≤ 110 KB gz | same |
| 3D chunk (three + r3f + drei subset + scene) | ≤ 350 KB gz, lazy | same |
| LCP (hero text, server-rendered) | < 1.5 s | < 2.5 s on 4G |
| Textures total | ≤ 8 MB GPU | ≤ 3 MB GPU |
| Frame rate target | 60 fps | 60 fps; floor 30 |

### Techniques
- **Lazy 3D:** The canvas is `next/dynamic({ ssr:false })` and starts loading after the hero HTML paints. The scene sits inside `<Suspense>` with the poster image as fallback.
- **Poster first:** A pre-rendered WebP/AVIF still of the HOME scene, captured from the real scene at build time with Playwright, shows instantly and cross-fades into the live canvas. Visitors never see a blank box.
- **On-demand rendering:** `frameloop="demand"`. A small animation scheduler `invalidate()`s only while something is moving. When nothing changes, the GPU is idle (good for laptop fans and batteries). The scene pauses when the tab is hidden or the canvas is off-screen.
- **Geometry:** Repeated tiles, keycaps, junctions and pulses use `InstancedMesh`. All traces are **one merged geometry**. Rounded boxes come from a shared geometry cache keyed by size.
- **Textures:** Icons come from one atlas (≤ 2048²). Project screenshots are WebP/AVIF at ≤ 1600 px wide, loaded **only when the Projects zone is focused**. KTX2 is used if any large textures appear.
- **Shadows** are baked once (see §3), with no realtime shadow maps.
- **DPR control:** `dpr={[1, 2]}` desktop, `[1, 1.5]` tablet/phone. drei `PerformanceMonitor` lowers DPR and switches off AO/bloom if fps drops.
- **Device tiers:** `detect-gpu` plus `navigator.hardwareConcurrency`, `deviceMemory` and `saveData` sort devices into `high` / `medium` / `low` / `none`:
  - `high`: everything (transmission glass, N8AO, selective bloom).
  - `medium`: no AO, no bloom, glass becomes simple transparency.
  - `low`: phone-style simple scene, DPR 1, no transmission, no pulses except on interaction.
  - `none` (no WebGL2 / failed context): 2D fallback (§22).
- **Fonts:** Geist via `next/font` with subsetting. The 3D text font is the same Geist WOFF loaded by troika (one file).
- **Images:** `next/image` with AVIF/WebP and `sizes` set. Original uploads are processed by a `sharp` script into `public/assets`.

---

## 16. Accessibility

- **Usable without the 3D:** Every route renders its full content as semantic HTML. The canvas is `aria-hidden="true"`, and a visually-hidden description sits next to it.
- **Object proxy list:** A visually-hidden (but focusable) `<nav aria-label="Workspace objects">` holds one `<button>` per interactive 3D object, in a logical order. Focusing a button triggers that object's 3D hover state and an **orange outline**. Enter activates it. This makes the 3D world fully keyboard-navigable.
- **Visible top navigation** is always present: About · Projects · AI Lab · Experience · Skills · Contact · Résumé.
- **Focus:** `:focus-visible` uses a 2 px `--accent-ink` outline with 2 px offset, on everything. It's never removed.
- **Panels:** Desktop side panel = `<aside role="region" aria-labelledby>`. Focus moves to its heading on open and returns to the trigger on close. Mobile full sheet = `role="dialog" aria-modal="true"` with a focus trap. `Esc` always closes.
- **Live region:** View changes are announced ("AI Lab. NeuroFlow system. 9 nodes.").
- **Reduced motion (`prefers-reduced-motion: reduce`)** *plus* a manual toggle in the top bar:
  - Camera flights are replaced by a 150 ms cross-fade.
  - The heartbeat pulse, monogram bob and hover lift are off (hover = colour change only).
  - Panels fade instead of sliding; staggers are removed.
  - Pulses are replaced by static lit traces.
- **Contrast:** All text meets WCAG AA. Orange is never used for body text (`--accent-ink` is used for orange text).
- **Hit targets:** at least 44 × 44 px for all HTML controls. Phone keycaps are larger than that.
- **2D mode toggle** in the top bar for anyone who simply prefers it (persisted in `localStorage`).

---

## 17. SEO

- **Real routes, statically generated:** `/`, `/about`, `/projects`, `/projects/[slug]`, `/ai`, `/ai/[system]`, `/experience`, `/skills`, `/contact`.
- **Per-route Metadata API:** title template `%s · Tejasva Singh Chouhan`, unique descriptions, canonical URLs.
- **OpenGraph + Twitter cards:** OG images are generated with `next/og` in the site's style (white card, Geist, orange accent line, project name). The home OG image uses the scene poster.
- **JSON-LD:** `Person` (name, jobTitle, `alumniOf` SGSITS, `sameAs` GitHub/LinkedIn/LeetCode) on home. `CreativeWork`/`SoftwareSourceCode` per project.
- `sitemap.ts`, `robots.ts`, semantic headings (one `h1` per route), descriptive link text, alt text on all images.
- Domain: `TBD`.

---

## 18. Project Architecture

```
portfolio-v2/
├── intake/                        # raw uploads (never served directly)
├── scripts/
│   ├── optimize-images.mjs        # sharp → public/assets (webp/avif, sizes)
│   ├── build-icon-atlas.mjs       # lucide + simple-icons → atlas.png + atlas.json
│   └── capture-poster.mjs         # Playwright screenshot of HOME scene → poster
├── public/
│   ├── assets/ (profile, projects/<slug>/, logos/)
│   ├── fonts/ (Geist woff for troika)
│   └── resume/Tejasva_Singh_Chouhan_Resume.pdf
└── src/
    ├── app/
    │   ├── layout.tsx             # fonts, TopBar, <SceneRoot/> (persistent), <PanelHost/>
    │   ├── page.tsx               # HOME: hero + summary (SEO content)
    │   ├── about/page.tsx
    │   ├── projects/page.tsx  projects/[slug]/page.tsx
    │   ├── ai/page.tsx        ai/[system]/page.tsx
    │   ├── experience/page.tsx  skills/page.tsx  contact/page.tsx
    │   ├── opengraph-image.tsx  sitemap.ts  robots.ts
    ├── components/
    │   ├── ui/                    # Button, Chip, Tag, Card, Kbd, Tooltip
    │   ├── navigation/            # TopBar, CommandPalette, ShortcutsPopover, ObjectProxyNav
    │   ├── panels/                # PanelHost, SidePanel, BottomSheet, PanelHeader
    │   ├── project/               # ProjectDetail, Gallery, Lightbox, TechChips
    │   └── loading/               # BootLog, Poster
    ├── sections/                  # content views, used by panels AND the 2D fallback
    │   ├── Hero/ About/ Projects/ AI/ Experience/ Skills/ Contact/
    ├── three/
    │   ├── scene/                 # SceneRoot (Canvas), Stage, Board, Effects
    │   ├── objects/               # Hub, Monitor, ProjectCard, AgentGraph, AgentNode,
    │   │                          # ExperienceCard, SkillCluster, Keycap, ContactCard, LinkTile
    │   ├── connectors/            # Traces (merged), Pulses (instanced), Junctions
    │   ├── camera/                # CameraRig, cameraStates.ts, viewOffset
    │   ├── lighting/              # StudioLighting, Environment
    │   ├── interactions/          # useInteractive, hoverStore, tooltipAnchor
    │   ├── materials/             # shared materials, icon-tint shader
    │   ├── mobile/                # KeycapHomeScene
    │   └── layout.ts              # zone/object positions (NOT content)
    ├── data/                      # ALL content (see §19)
    ├── store/viewStore.ts         # zustand: state, focus, hovered, panel, tier, reducedMotion
    ├── hooks/                     # useDeviceTier, useReducedMotion, useViewState, useShortcuts
    ├── lib/                       # routeToState, gpuTier, seo/jsonld, cn
    └── styles/globals.css         # tokens, Tailwind layers
```

**Stack:** Next.js (latest stable, App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · three · @react-three/fiber v9 · @react-three/drei · @react-three/postprocessing (high tier only) · maath · zustand · motion (Framer Motion, for HTML panels) · cmdk (command palette) · detect-gpu · Vercel hosting.

---

## 19. Data-Driven Design

3D components **never** contain content strings. They read data plus `three/layout.ts`. Adding a project means adding one data entry and dropping images into a folder.

```ts
// data/projects.ts
export type Project = {
  slug: string;                     // 'neuroflow'
  title: string;
  tagline: string;
  category: 'AI' | 'Backend' | 'Full-Stack' | 'Tooling';
  year: number;
  featured: boolean;
  problem?: string; solution?: string; role?: string;
  features?: string[]; decisions?: string[]; challenges?: string[];
  stack: SkillId[];                 // typed refs into skills.ts
  links: { github?: string; live?: string; demo?: string };
  media: { cover?: string; gallery?: string[]; video?: string; logo?: string };
  aiSystem?: AiSystemId;            // links card → AI Lab graph
};

// data/aiSystems.ts
export type AiSystem = {
  id: 'neuroflow' | 'codegen-cli' | 'htr-bench';
  title: string; summary: string; project?: string;   // project slug
  nodes: { id: string; label: string; kind: 'input'|'agent'|'router'|'tool'|'model'|'store'|'output';
           role: string; inputs?: string; outputs?: string; impl?: string; why?: string }[];
  edges: { from: string; to: string }[];
  states?: { id: string; label: string; activeEdges: string[] }[];  // e.g. NeuroFlow workload states
};

// data/skills.ts
export type Skill = { id: SkillId; label: string; cluster: ClusterId; icon?: string;
                      usedIn: (`project:${string}` | `role:${string}`)[] };

// also: profile.ts, links.ts, experience.ts, education.ts, achievements.ts
```
The graph layout (node positions) is computed from `nodes`/`edges` by a small layered-layout function (Sugiyama-style rows) with optional manual overrides. Content changes never need hand-placed coordinates.

Empty collections hide their UI. For example, `achievements.ts` is currently empty, so no Achievements section renders.

---

## 20. Animation Philosophy

**Motion shows hierarchy and cause and effect, never decoration.**

| Allowed | Where |
|---|---|
| Camera flights | View changes only |
| Hover lift / tint / pulse | Under the pointer only |
| Card fan, deal and stack transitions | When a zone opens |
| Staggered panel entrance (40 ms) | Panel open |
| **Heartbeat** | One faint pulse from the hub to a random module every ~6 s, so the system feels alive. Off with reduced motion and pauses after 60 s idle |
| Monogram bob | Hub only |

Not allowed: floating everything, particles, spinning, bouncing/overshoot springs, continuous camera drift, parallax wobble.

**Timing tokens:** micro 120 ms · hover 180 ms · panel 320 ms · stagger 40 ms · camera 0.9–1.4 s.
**Easing:** UI `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out feel), exits `cubic-bezier(0.4, 0, 1, 1)`. In 3D, critically damped lerps (`maath.easing.damp`).

---

## 21. Loading Experience

1. **0 ms:** Server-rendered HTML: top bar, hero text ("Tejasva Singh Chouhan / Full-Stack & AI Agent Engineer") and the **scene poster image**. The site is already useful at this point.
2. **In parallel:** The 3D chunk loads. A tiny **boot log** in Geist Mono sits bottom-left, over the poster, with lines driven by *real* progress (drei `useProgress` plus our own stages):
   ```
   ▸ mounting workspace ........ ok
   ▸ loading projects (4) ...... ok
   ▸ wiring ai systems (3) ..... ok
   ▸ compiling shaders ......... ok
   ready.
   ```
3. **Ready:** The poster cross-fades (400 ms) into the live canvas, then the camera "settle" plays (§6).

Rules: the boot log only appears if loading takes more than 400 ms; it shows at most once per session (`sessionStorage`); and it **never blocks** interaction with the HTML. Shader compilation is pre-warmed with `gl.compile` before the cross-fade, so the first hover doesn't stutter.

---

## 22. Fallback Experience (no WebGL / `none` tier / 2D toggle)

The same routes and the same `sections/` components, laid out as a polished single-scroll page:
- The header uses the **scene poster** as a static hero illustration, so the brand look is kept.
- Sections stack in order: About → AI Lab → Projects → Experience → Skills → Contact. AI system graphs render as **inline SVG diagrams** generated from the same `aiSystems.ts` data.
- Project cards use a grid layout. Detail pages are normal pages.
- A notice is shown only if 3D *failed* (not if chosen): "Showing the 2D version — your browser couldn't start 3D."

WebGL context loss mid-session is handled by restoring once, then switching to 2D if it fails again.

---

## 23. Mobile Fallback

On top of §14:
- Phones use the Keycap Home scene (≈ 30 draw calls).
- No transmission, AO, bloom or realtime shadows. Blob shadows plus baked contact shadows only.
- Pulses only on tap (no heartbeat). Monogram bob disabled.
- Simplified geometry: fewer bevel segments (`RoundedBox` smoothness 2 instead of 4).
- DPR is capped at 1.5 (1.0 on the `low` tier).
- Screenshots load at 800 px wide.
- All interactions are kept (tap, sheet, swipe between items, ⌘K becomes a search button).

---

## 24. Security

- **No secrets in the client.** It's a static site, and there are no API keys in the bundle.
- **Contact:** The default is links only (`mailto:` plus a copy-email button). **If** a form is chosen, it posts to a Next.js Route Handler that uses a server-only env var (`RESEND_API_KEY`), with a honeypot field, a simple rate limit, server-side input validation and no echoing of user input.
- **Personal data:** The **phone number from the résumé is NOT published** on the site. The downloadable résumé PDF still contains it: `TBD` whether you want a web version of the PDF without the phone number.
- External links use `rel="noopener noreferrer"`. A strict CSP is set via `next.config` headers (self, plus fonts/images only). No third-party trackers unless you ask (Vercel Analytics is optional and cookieless).

---

## 25. Final User Experience: the 60-second test

| Question a visitor has | Answered by | Time |
|---|---|---|
| **Who is this?** | Hero text on first paint + Hub | 0–3 s |
| **What do they build?** | Title + the Systems Board layout itself (AI Lab and DB monitor are visible at once) | 3–8 s |
| **What tech?** | Hover any keycap, or the stack chips on every project | 10–20 s |
| **What AI systems?** | AI Lab: the NeuroFlow workload switch re-routing live | 15–40 s |
| **What projects?** | Projects monitor + cards → detail panels with repos | 20–60 s |
| **Where have they worked?** | Experience stack → timeline | any time |
| **How do I contact them?** | Contact card, top-bar "Contact", ⌘K "email" | any time |

A recruiter who never touches the 3D can still get everything from the top bar and panels in under a minute.

---

## Appendix A — Content inventory (from your uploads)

**Profile**
- Name: Tejasva Singh Chouhan
- Title: `DRAFT` *Full-Stack & AI Agent Engineer*
- Tagline: `DRAFT` *"I build backend systems — and the AI agents that run on them."*
- Short bio: `DRAFT` *Computer Engineering student at SGSITS Indore who builds from the storage layer up: a B+ Tree database engine in Java, backend APIs and automations in Node.js, and adaptive multi-agent systems with LangGraph. Currently researching vision-language models for handwritten text recognition at NIT Bhopal.*
- Location: Indore, India (`TBD` show or hide)
- Photo: `profile/tejasva2.jpg`. It's an outdoor travel photo with sunglasses. Plan: crop to a square around head and shoulders for the About panel only. The Hub uses the "TS" monogram, so the scene doesn't depend on the photo. A front-facing photo without sunglasses would work better for recruiters (optional).
- Résumé: `profile/tejasva_resume (3).pdf` → served as `/resume/Tejasva_Singh_Chouhan_Resume.pdf`

**Links (extracted from résumé PDF)**
- Email: tejasva12112004@gmail.com
- GitHub: https://github.com/tejasvasingh2004
- LinkedIn: https://www.linkedin.com/in/tejasva-singh-chouhan-859bab31a/
- LeetCode: https://leetcode.com/u/tejasvasingh44/

**Education**
- Shri G. S. Institute of Technology and Science (SGSITS), Indore: B.Tech Computer Engineering, 2024–2028, CGPA 8.22 (`TBD` show CGPA?)
- Coursework: Structured Programming, Data Structures, Design & Analysis of Algorithms, DBMS, Microprocessors

**Experience**
| Role | Org | Dates | Logo |
|---|---|---|---|
| Research Intern: Exploration of VLMs for Handwritten Text Recognition (under a PhD scholar, IIT Bombay) | NIT Bhopal | `TBD` start → Present | none (monogram) |
| Backend & AI Automations Intern (85 days, remote) | IndhanPay Pvt. Ltd. | 2025 (`TBD` months) | `experience/images.png` (`ASSUMED` IndhanPay) |
| Backend & Database Development Intern (remote) | E-NOTEBOOK | 2025 (`TBD` months) | none (monogram) |

**Achievements:** none provided, so the section is hidden until data exists.

---

## Appendix B — Open questions (needed before / during build)

**Blocking (content I can't invent):**
1. **Dinesphere:** what is it? Please fill the project template (description, stack, links, screenshots).
2. **Confirm folder mapping:** `Hybrid-DB` = Custom DB Engine (B+ Tree)? `NeuroFlow` = Cognitive-State-Aware Agent System? Why "Hybrid"?
3. **NeuroFlow details:** GitHub URL, which agents run in each workload state (NORMAL / MODERATE / HIGH / OVERLOADED), and how workload is detected. This powers the signature AI Lab interaction.
4. **Screenshots / GIFs / videos:** all three project folders are empty. Even 1–2 images per project, or a terminal recording of the CLI, would make a big difference. Without them I'll use procedural UI mockups on the monitor.

**Quick confirmations:**
5. Is the AI Code-Gen CLI a portfolio project? What display name should it have?
6. Internship months for IndhanPay and E-NOTEBOOK; NIT Bhopal start month; any extra detail or stack for E-NOTEBOOK.
7. Add **Java, Spring Boot, Python** to skills?
8. Approve or edit the DRAFT title, tagline and bio.
9. Show CGPA? Show location? (Phone stays hidden either way.)
10. Contact: links only (recommended to start) or a working form?
11. Any achievements (hackathons, LeetCode stats, certifications)?
12. Domain name for deployment?
13. Accent `#FF6A13` (matches the references): OK, or another shade?

---

## Appendix C — Build order after approval

1. Init Next.js + TS + Tailwind; tokens, fonts, data files with real content
2. HTML layer first: routes, sections, panels, top bar, 2D fallback, SEO (the site is fully usable at this point)
3. Canvas shell: Stage, lighting, board, baked shadows, device tiers, poster pipeline
4. Camera rig + route↔state mapping + view offset
5. Interaction system: `useInteractive`, tooltips, proxy nav, shortcuts, ⌘K
6. Hub → Projects zone → AI Lab (graphs + NeuroFlow switch) → Experience → Skills → Contact
7. Phone Keycap scene + bottom sheet
8. Reduced motion, accessibility pass (keyboard-only + screen reader run-through)
9. Performance pass (budgets above, Lighthouse, real-phone test), loading sequence
10. QA across Chrome / Safari / Firefox / iOS / Android, then deploy to Vercel

---

## Implementation notes (deviations from the draft)

- **NeuroFlow states:** The repo's `workload.py` uses **LOW / MEDIUM / HIGH**, decoded from EEG by an SVM. The résumé's four states are now legacy aliases. The AI Lab shows the real policies: 0/1/2 verifier loops, 70/80/95% thresholds, and a Final Verification agent at HIGH.
- **Project names:** "AI Code-Gen CLI" uses its repo name, **Traycer-mini**. Hybrid-DB = the custom B+ Tree database engine. Dinesphere details come from `Dinesphere_backend`.
- **Device tiers:** A local heuristic replaces `detect-gpu`, which downloads its benchmark data from a CDN at runtime. drei's `PerformanceMonitor` still lowers DPR if frame rate drops.
- **Tone mapping:** Neutral instead of AgX. AgX rendered the white tiles grey.
- **Glass cube:** A clear coated material on every tier instead of transmission. Transmission doubled the figure and costs an extra render pass.
- **Not built yet:** Hybrid-DB's 3D B+ tree (planned as phase 2), selective bloom/AO post-processing (the glow is faked with gradient planes), and a strict CSP (it needs nonces for the inline boot and JSON-LD scripts; the other security headers are set).
- **Poster:** A real scene capture is used as the Open Graph / Twitter image. While loading, the page shows a matching backdrop and fades the canvas in.
