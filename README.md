# Tejasva Singh Chouhan — 3D Portfolio

An interactive "Systems Board": an identity hub wired to Projects, an AI Lab of explorable agent graphs, Experience, Skills and Contact. Built with Next.js 16, React Three Fiber and Tailwind CSS v4. The full design spec is in [`portfolio_3d_spec.md`](portfolio_3d_spec.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.dev`) in your hosting environment so canonical URLs, the sitemap and social share images point to the real domain.

## Updating content

All content lives in `src/data/`. The 3D scene, panels, 2D fallback, command palette, sitemap and SEO metadata all read from it, so you never edit 3D components to change copy.

| File | What it holds |
|---|---|
| `profile.ts` | Name, title, tagline, bio, status, links, education |
| `projects.ts` | Projects (problem, solution, decisions, stack, links, facts) |
| `aiSystems.ts` | AI Lab graphs: nodes (with grid positions), edges, adaptive states |
| `experience.ts` | Roles, newest first |
| `skills.ts` | Skills and clusters. "Where I used it" is derived from project/role stacks |

Adding a project means adding an entry to `projects.ts`. Its card, monitor screen, route `/projects/<slug>`, palette entry and sitemap entry appear automatically. With more than ~5 projects, widen `PROJECT_CARD` spacing in `src/three/layout.ts`.

### Images

Put originals in `intake/` and run `node scripts/optimize-images.mjs` (edit the job list at the top) to produce WebP/AVIF files in `public/assets/`. To show a screenshot in a project panel, add its path to that project's `media` field.

## Structure

```
src/
├── app/            routes (every view is a real, statically generated URL)
├── components/     UI primitives, top bar, command palette, panels
├── sections/       content views — used by panels and by the 2D fallback
├── three/          the scene: Scene, CameraRig, layout, atlas, faces, objects/, mobile/
├── data/           all content
├── lib/            routing ↔ view state, graph routing, icons, device tier, prefs
└── store/          zustand view store shared by DOM and canvas
```

## Behaviour notes

- **Routes drive the camera.** `/projects/hybrid-db`, `/ai/neuroflow?node=verifier` and so on are shareable and work with the back button.
- **Keyboard:** `1`–`6` jump to zones, `Esc` goes up a level, `←/→` cycle items, `⌘K`/`Ctrl+K` opens the palette. Tab reaches a proxy list of the 3D objects.
- **2D mode** is used automatically without WebGL, or via the top bar toggle. Reduced motion follows the OS setting or the top bar toggle.
- **Device tiers** come from a local heuristic (`src/lib/deviceTier.ts`). For testing, force one with `?tier=high|medium|low`.
