# solar-punk

Adam's main portfolio site — a 3D interactive solar system built with Next.js
16 + React 19 + Three.js / react-three-fiber. Each "planet" orbiting the
central sun represents a project or work area; clicking a planet opens a HUD
panel with content, docs, or embedded apps.

**Live site:** https://solar-punk-five.vercel.app  
**Repo:** https://github.com/lakar-team/solar-punk  
**Local folder:** `G:\My Drive\AI Platforms\solar-punk`

## CRITICAL: never run npm in this folder

This project lives on Google Drive; `npm install` here corrupts `node_modules`.
Build locally or via a mirrored build folder. If you need a dev server, mirror
the folder to `%LOCALAPPDATA%\solar-punk-build` first, then `npm run dev` from
there.

## Architecture

- `src/app/` — Next.js app router. Main entry at `src/app/page.tsx` (thin
  shell that mounts the canvas). Mobile fallback at `src/app/mobile/page.tsx`.
- `src/components/canvas/` — Three.js scene: `Scene.tsx`, `Planet.tsx`,
  `CentralStar.tsx`, `CameraController.tsx`, `PlanetSystem.tsx`, `Universe.tsx`.
- `src/components/ui/` — HUD overlay (`HUD.tsx`, 27KB — the main content
  panel), `PlanetPreview.tsx`, `SunPreview.tsx`, `MobileLiteView.tsx`.
- `src/data/` — `projects.ts` (planet definitions + content, 12KB) and
  `profile.ts` (Adam's profile data). **This is the intended single source of
  truth** for Adam's info across the whole ecosystem — see [[project-aibo]].
- `src/store/useStore.ts` — lightweight Zustand store for selected planet state.
- `public/` — static assets served directly:
  - `docs/` — PDFs (CV, Kyoto conference paper, Lakar projects, PhD research,
    Malaysia presentation, personal background, S&A award, smart home).
  - `games/` — Demon Hunter (116KB single HTML), Kanji Pad game.
  - `apps/hydrocalc/` — a full hydrology calculator app (pipe flow, fixtures).
  - `textures/` — planet textures and preview images (several MB each).
  - `Adam_Tech_CV.md` + `Adam_Tech_CV.pdf` — downloadable CV.

## Key issues to fix (from 2026-06-24 code review)

- Large binaries in git: `textures/lakar-1.jpg` (11MB), `demon-hunter.png`
  (7MB), `malaysia-presentation.pdf` (15MB) — should move to CDN / Git LFS.
- No HTTPS-only redirect or security headers configured in `next.config.ts`.
- Profile data in `src/data/profile.ts` duplicates content in project-aibo's
  `adam-info.json` and brain route system prompt — consolidate here.

## Relationship to other projects

- **project-aibo** — the Web Witch avatar planet links out to
  `project-aibo.vercel.app`. Could be consolidated into this repo as a `/aibo`
  route — see [[project-aibo]] revamp notes.
- **AI CAD / vtube** — separate toolchain for VTuber mocap; no direct
  runtime dependency from solar-punk.

## Wiki — check before, update after

A knowledge wiki lives at `G:\My Drive\AI Platforms\Wiki`. Check
`vault/drive-map/project-aibo.md` for the full ecosystem breakdown before
working on any cross-repo concerns. After non-trivial changes: update that note
and the `wiki-chain` block below.

<!-- wiki-chain
id: solar-punk-claude
status: As of 2026-07-03. Since the 2026-06-27 rename, underwent a major site redesign: two-tier solar system (category planets + orbiting moon system replacing the old flat planet layout), inline content layer (keyFacts, image galleries, per-project detail pages, all 6 nested pages populated), Vercel Analytics + AI-discoverability files (llms.txt, sitemap.xml, JSON-LD), two-tier mobile navigation, teaching + personal-background sections. AIBO integration got 4 response-time optimizations (streaming, Gemini 2.0, prompt trim, deferred Kokoro TTS warmup moved to a Web Worker). vtube-mocap planet entry now links straight to vtubemaker.pages.dev (Launch App) instead of GitHub. Single git-linked folder, remote https://github.com/lakar-team/solar-punk.git.
updated: 2026-07-03
links: [project-aibo, ai-platforms-claude]
-->
