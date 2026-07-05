# AGENTS

> Full architecture map, algorithm inventory, route list, and test command catalog: [`docs/AGENTS_REFERENCE.md`](docs/AGENTS_REFERENCE.md)
>
> **Doc maintenance:** When counts, file paths, or test commands change, update the reference doc only. Update this file only for new non-negotiable rules or contracts.

## Project Snapshot

- Product: **Bayan Flow** · client-side React SPA (routes in REFERENCE)
- Repo: `https://github.com/ayoub3bidi/bayan-flow` · prod `main` → bayanflow.com · dev `develop` → dev.bayanflow.com
- License: `Elastic-2.0 OR Commercial` (dual-license)
- Hosting: **Cloudflare Workers** (static SPA via `wrangler.jsonc`); `netlify.toml` kept for rollback only — CI deploys through `.github/workflows/deploy-cloudflare.yml`
- Tooling: React 19, Vite 7 (`rolldown-vite`), Tailwind 4, Vitest 3, Remotion 4, i18next `^25.7.1` (en/fr/ar RTL), Pyodide `0.27.5` in worker, Tone.js `^15.1.22`, DiceBear `^10.3.0`, Phosphor Icons, Monaco Editor, Framer Motion, Playwright (SFX generation only)
- Engines: Node `>=24.11.1`, pnpm `>=8.15.9` · alias `@/` → `src/`
- Version: `0.5.0` in `package.json` — **45 algorithms** across **5 categories** (14 sorting, 9 pathfinding, 9 searching, 6 tree traversal, 7 graph); optional Google sign-in when Supabase env vars are set
- **PRs target `develop`**, not `main` (gated by `ensure-pr-source-develop.yml`)
- **Tests**: 136 test files (~1,700+ tests)
- **Source**: 201 JS/JSX non-test files, 45 Python (one `.py` per algorithm), 1 `.css`
- **Supabase**: `eu-central-1` region, migrations for `profiles`, `favorite_algorithms`, `algorithm_notes` + RLS; `keep-supabase-alive.yml` prevents free-tier pausing

## Routes

| Path | Page | Auth |
|------|------|------|
| `/` | LandingPage | Public |
| `/app` | VisualizerApp | Public |
| `/roadmap` | Roadmap | Public |
| `/privacy` | PrivacyPolicy (LegalDocument) | Public |
| `/terms` | TermsOfUse (LegalDocument) | Public |
| `/auth/google/callback` | GoogleAuthCallback | Public (OAuth redirect) |
| `/settings/profile` | ProfileSettingsPage | `RequireAuth` |

## Source Of Truth (registries)

When docs drift, trust runtime config:

- `src/constants/index.js` — categories, algorithm keys, complexity, visual enums, size defaults
- `src/constants/algorithmKnowledge.js` — insight metadata (inventor, year, facts count, YouTube video ID)
- `src/registry/categoryConfig.js` — category wiring, groups, size controls, icon, default algorithm
- `src/registry/visualizerRegistry.js`, `extraVisualizerProps.js`, `videoSceneRegistry.jsx`
- `src/registry/complexityDatasetRegistry.js`, `searchingSubstrate.js`, `graphAlgorithmRegistry.js`
- `src/config/algorithmConfig.js`, `settingsConfig.js`
- `categoryRuntimeCompleteness.test.js` must stay green when registries change

## Category contracts (non-negotiable)

- **Searching:** array vs node-link via `getSearchingSubstrate()` — do not special-case elsewhere
- **Graph algorithms:** node-link vs matrix profiles; Floyd-Warshall matrix max 6 nodes; scenarios from `graphTestScenarios.js` (18 preset scenarios); `GraphScenarioDropdown` when scenario is active
- **Pathfinding:** grid steps; walls/start/end in `usePathfindingVisualization`; grid size uses named presets (`GRID_SIZES.SMALL/MEDIUM/LARGE`)
- **Tree:** `generateTreeForTraversal()`; `treeNodeCount` 3–31, default 15; BST values assigned inorder
- **Sound:** semantic events in `soundEvents.js` only (16 event kinds) — not from localized descriptions; visualization-only (no UI click sounds); uses Tone.js singleton `soundManager` with 5 synths through master chain (gain → filter → compressor → reverb)
- **Export:** interactive + Remotion parity; `buildExportSoundCues()` from same sound events; WAV assets in `public/video-export/sfx/` (18 pre-rendered files)
- **Feature gating:** Tiered access model — see Auth contracts for Anonymous vs Free tier access; `SignInPromptModal` blocks gated features; `entitlementService.js` is the single authority for all access checks; `src/constants/algorithmEntitlements.js` defines the anonymous-tier algorithm allowlist

## Visualizer UX

- Registry-driven architecture — extend config/registries, not `VisualizerApp` one-offs
- All 5 category hooks called unconditionally in `VisualizerApp` (Rules of Hooks), merged via `useCategoryVisualizations()`
- Completion: brief final state before `ComplexityPanel`
- Regenerate control is category-neutral ("Generate New Input")
- Sorting only category with sort-order controls
- Lazy panels (`PythonCodePanel`, `AlgorithmInsightPanel`) stay optional overlays — Monaco editor, Pyodide worker execution, editable test cases, LeetCode-style pass/fail
- Full-screen mode (`useFullScreen`) uses same `ControlPanel` + visualizer registry; F key toggle, Escape exits
- Touch: horizontal swipe (`useSwipe`) for manual step navigation; one-time `SwipeTutorial` on mobile
- Video export: horizontal (1920×1080) or vertical (1080×1920) MP4 via `@remotion/web-renderer`; orientation → capability check → render → preview → download
- Complexity panel: interactive SVG chart with log/linear toggle; best/average/worst time + space complexity
- Graph algorithms: `GraphAlgorithmCategoryVisualizer` routes node-link to `GraphVisualizer` and matrix (Floyd-Warshall) to `GraphAlgorithmMatrixVisualizer`; `GraphScenarioDropdown` for preset scenarios
- Searching category: `SearchingCategoryVisualizer` routes array-based to `ArrayVisualizer` and node-link (DFS/BFS graph) to `GraphVisualizer`
- Animation speeds: SLOW 8000ms, MEDIUM 4800ms, FAST 2400ms, VERY_FAST 1200ms

## Ship It test ladder

| Phase | Command |
|-------|---------|
| Iterate | `pnpm vitest run <touched tests>` |
| Gate | `pnpm lint` → `pnpm format:check` → `pnpm test:coverage` → `pnpm build` |

## i18n / user-facing changes

Audit all three locales (en/fr/ar) + pseudocode strings + export fallbacks when renaming categories or algorithms. Arabic is RTL — check app UI and Remotion export. Translation detection order: `localStorage` → `navigator` → `htmlTag`, cached in localStorage. Pseudocode is English source of truth, FR/AR generated via `localize.js`.

## Adding algorithms or categories

See reference doc for full checklists (JS, Python, pseudocode, sound, insight, tests, registries). Keep graph algorithm commits scoped to one algorithm when possible. Algorithms follow dual-export pattern: visualization function → `steps[]` array + `*Pure` function for testing.

## Auth contracts (non-negotiable)

- **OIDC only** — Google sign-in via Supabase Auth; no email/password flows in v0.5.0
- **OAuth UX** — Google Identity Services (PKCE popup on `/auth/google/callback`); web uses `signInWithIdToken`, not `signInWithOAuth`; `googleIdentity.js` manages GIS script loading, nonce creation, and popup flow
- **Service layer** — `src/services/authService.js`, `profileService.js`, `entitlementService.js`, `googleTokenExchange.js`; components use `AuthContext` / `useAuth`, never import Supabase directly
- **Postgres-portable schema** — `profiles` keyed to `auth.users`; RLS on public tables; client-writable columns: `display_name`, `avatar_preference` only; `avatar_url` is OAuth/trigger-populated (not client-writable); `plan` and future `referral_*` / `pro_*` columns are service role / webhook only
- **Profile settings** — private route `/settings/profile` (`RequireAuth`); `updateProfile()` in `profileService.js`; security boundary = RLS row scope + `REVOKE UPDATE` + `GRANT UPDATE (display_name, avatar_preference)`; tabbed UI with profile/notifications/connections tabs; DiceBear notionists avatar fallback
- **Session** — `getSession()`, `onAuthStateChange()`; `AuthProvider` in `src/main.jsx`; request-dedup via `requestRef`
- **Tiered access model** — Anonymous (no account) gets limited access to drive sign-in conversion; Free account (Google sign-in) unlocks the full platform
- **Anonymous tier (no account):**
  - 18 of 45 algorithms (curated starter set across all 5 categories; see `src/constants/algorithmEntitlements.js`)
  - 12 visualizations per session (localStorage counter `anon_viz_count`, resets on sign-in)
  - Autoplay only, default speed (MEDIUM: 4800ms)
  - Complexity panel: 2 views per completion (localStorage `anon_complexity_views`), then blur overlay + sign-in gate
  - No manual controls, speed adjustment, or category-specific controls (grid size locked to MEDIUM, sort order locked to ascending, graph scenarios disabled)
  - No Code Panel, Insight Panel, Video Export, Sound, or Fullscreen
- **Free tier (Google sign-in):**
  - All 45 algorithms, unlimited visualizations
  - Manual controls, all 4 speed presets
  - Full complexity panel access, all category-specific controls
  - Code Panel, Insight Panel (with My Notes tab), Sound, Fullscreen
  - Favorite algorithms: up to 20 slots (`FREE_TIER_FAVORITE_SLOT_LIMIT` in `src/constants/personalLearning.js`); stored in Supabase `favorite_algorithms`
  - Per-algorithm study notes: stored in Supabase `algorithm_notes`; sanitized HTML via `notesService.js`
  - Self-service account deletion: Profile Settings danger zone → Supabase Edge Function `delete-account` (CASCADE removes profile, favorites, notes)
  - Video Export: unlimited for Free tier with mandatory watermark; Pro tier adds watermark customization/removal; internal daily abuse guard exists (not user-facing)
- **Auth PRs must not reduce Free tier functionality** — only Anonymous tier can be further restricted
- **Secrets** — publishable anon key via `VITE_*` only; service role key never in repo or client bundle
- **CSP** — Supabase origin in `connect-src`; Google profile photos in `img-src` (lh3.googleusercontent.com); GIS scripts/connect/frame in respective directives; asserted via `scripts/cspHeaders.js` at build time
- **Tests** — mock Supabase in Vitest (`src/test/supabaseMock.js`, wired in `src/test/setup.js`); mock includes `authStateChangeCallbackRef` for testing auth state changes
- **Auth pages:** `GoogleAuthCallback.jsx` (handles OAuth redirect), `PrivacyPolicy.jsx`, `TermsOfUse.jsx` (both use shared `LegalDocument` component with content from `src/content/legal/`)

## Workflow rules

- Minimal diff; no unrelated edits; preserve user-authored changes
- Sync registries across JS, Python, pseudocode, sound, export, and tests
- Run focused tests while iterating; full gate before Ship It handoff
- Generators should accept `rng` param for deterministic test output
- Sound is silent on initial load, reset, step-back, algorithm changes, and regeneration — only forward playback and manual stepping
- Do NOT add UI click sounds (panels, buttons, toggles, export) — visualization steps only
- When adding net-new visual step states, add corresponding `SOUND_EVENT_KINDS` entry and align `buildExportSoundCues.test.js`
- When adding a graph algorithm, keep commits scoped to one algorithm; update `graphAlgorithmRegistry.js` profile, `graphAlgorithmGenerators.js` if new generator needed, and `graphTestScenarios.js` if new scenarios needed

## Build-time env vars

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_GIT_BRANCH` | CI | Deploy context; `isProductionMainBranch()` gates noindex/robots |
| `VITE_SUPABASE_URL` | Auth | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Auth | Publishable anon key |
| `VITE_GOOGLE_WEB_CLIENT_ID` | Auth | Google OAuth client ID |
| `VITE_PYODIDE_CDN_BASE` | Optional | Override default jsDelivr CDN for Pyodide |
| `VITE_DEV_SITE_URL` | CI | Dev site URL for build metadata |

## CI workflow summary

- `ci.yml` — push/PR to main/develop: quality (lint + format + audit) → test (coverage + Codecov) → build (with `VITE_GIT_BRANCH` + `VITE_DEV_SITE_URL`)
- `deploy-cloudflare.yml` — triggered by CI completion on main/develop: build + `wrangler deploy` (production/staging envs)
- `preview-cloudflare.yml` — PR to develop: lint → test → build → `wrangler versions upload` → comment PR with preview URL + QR code; cleanup on PR close
- `ensure-pr-source-develop.yml` — blocks PRs to `main` unless head is `develop` or user in `ALLOWED_MERGERS`
- `release.yml` — GitHub release on `v*` tags
- `keep-supabase-alive.yml` — weekly ping to prevent free-tier project hibernation
- `stale.yml`, `labeler.yml`, `semgrep.yml` — repo hygiene + SAST scanning
