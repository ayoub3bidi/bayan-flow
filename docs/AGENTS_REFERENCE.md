# AGENTS Reference (Bayan Flow)

> Exhaustive agent lookup: inventories, architecture map, CI detail, test catalog, and add-algorithm checklists.
> The lean always-on guide is **[`AGENTS.md`](../AGENTS.md)** — update _this_ file when factual inventory changes; update the root file only for behavioral rules.

## Project Snapshot

- Product: `Bayan Flow` (Bayan / بيان = clarity in Arabic)
- Package name: `bayan-flow`
- App type: client-side React SPA with routes `/`, `/app`, `/roadmap`, `/pro`, `/settings/profile`, `/privacy`, `/terms`
- Version target in `package.json`: `0.5.0`
- License: `Elastic-2.0 OR Commercial` (see `LICENSE`, `COMMERCIAL_LICENSE.md`, `TRADEMARK.md`, `NOTICE`)
- Repository/homepage:
  - `https://github.com/ayoub3bidi/bayan-flow`
  - Production: `https://bayanflow.com` (`main`)
  - Dev/beta: `https://dev.bayanflow.com` (`develop`)
  - Contact: `contact@bayanflow.com`
- Tooling: React 19, React Router 7, Rolldown Vite 7, Tailwind CSS 4, Vitest 3, React Testing Library, Framer Motion, Remotion 4 (`remotion`, `@remotion/web-renderer`, `@remotion/media`), i18next, Monaco Editor, Tone.js, @phosphor-icons/react, react-icons (SimpleIcons for brand logos), Octokit, Playwright (export SFX script only)
- Python execution: Pyodide `0.27.5` loaded client-side in a worker
- Engines: Node `>=24.11.1`, pnpm `>=8.15.9` (CI uses pnpm 9)
- Contribution flow: PRs target `develop`, not `main`; PRs to `main` are gated by `.github/workflows/ensure-pr-source-develop.yml`
- Algorithm inventory: **45** algorithms across **5** categories (14 sorting, 9 pathfinding, 9 searching, 6 tree traversal, 7 graph algorithms)
- Python parity: **45** `.py` files under `src/algorithms/python/` (one per algorithm)
- Test surface: **188** test files (~**2,300** tests, per `pnpm vitest run`)
- Source surface: **265** non-test `*.js` / `*.jsx` files under `src/`, **45** Python files under `src/algorithms/python/`, **1** `src/index.css`
- Path alias: `@/` → `src/` (Vite + Vitest)

## Source Of Truth

- Treat runtime registries and config files as the source of truth when docs drift:
  - `src/constants/index.js` — category keys, algorithm keys, complexity maps, visual state enums, size defaults
  - `src/constants/algorithmKnowledge.js` — insight metadata registry (translated copy lives in locales)
  - `src/constants/githubRepo.js` — GitHub owner/name/URL constants for the repo badge
  - `src/registry/categoryConfig.js` — per-category wiring (defaults, i18n, size controls, groups, features)
  - `src/registry/visualizerRegistry.js`
  - `src/registry/extraVisualizerProps.js`
  - `src/registry/videoSceneRegistry.jsx`
  - `src/registry/complexityDatasetRegistry.js`
  - `src/registry/searchingSubstrate.js`
  - `src/registry/graphAlgorithmRegistry.js` — profiles, scenarios, `GRAPH_ALGORITHM_KEYS`, `GRAPH_ALGORITHM_GROUPS`
  - `src/config/algorithmConfig.js` — `useAlgorithmConfig()`, `buildAlgorithmsForCategory()`, `buildGroupsForCategory()`
  - `src/config/settingsConfig.js` — `useSettingsConfig()` (grid size + speed option labels)
  - `src/motion/chromeMotion.js` — shared chrome UI motion presets (drawers/modals/menus/marketing); do not invent local spring params for chrome
- `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `README.md`, and `CONTRIBUTING.md` are useful, but they can lag behind the live category/runtime wiring.
- Runtime completeness tests are important because the app depends heavily on synchronized registries (`categoryRuntimeCompleteness.test.js`).

## Current Feature Surface

### Categories and algorithms

- Categories:
  - `sorting`
  - `pathfinding`
  - `searching`
  - `treeTraversal`
  - `graphAlgorithm`
- Sorting algorithms (14):
  - `bubbleSort`, `quickSort`, `mergeSort`, `selectionSort`, `insertionSort`, `heapSort`, `shellSort`, `radixSort`, `countingSort`, `bucketSort`, `cycleSort`, `combSort`, `timSort`, `bogoSort`
- Pathfinding algorithms (9):
  - `bfs`, `dijkstra`, `aStar`, `bidirectionalSearch`, `greedyBestFirstSearch`, `jumpPointSearch`, `bellmanFord`, `idaStar`, `dStarLite`
- Searching algorithms (9):
  - array substrate: `linearSearch`, `binarySearch`, `ternarySearch`, `jumpSearch`, `interpolationSearch`, `exponentialSearch`, `fibonacciSearch`
  - node-link substrate: `depthFirstSearch`, `breadthFirstSearchGraph`
- Tree traversal algorithms (6):
  - `inorderTraversal`, `preorderTraversal`, `postorderTraversal`, `levelOrderTraversal`, `zigzagLevelOrderTraversal`, `morrisTraversal`
- Graph algorithms (7):
  - `topologicalSort`, `kahnAlgorithm`, `kruskalAlgorithm`, `primAlgorithm`, `tarjanAlgorithm`, `kosarajuAlgorithm`, `floydWarshallAlgorithm`

### Shared product features

- Playback: manual vs autoplay (`VISUALIZATION_MODES`), five speed presets (`ANIMATION_SPEEDS`)
- Mobile: horizontal swipe for manual step forward/back (`useSwipe`), one-time swipe tutorial (`SwipeTutorial`)
- Full-screen visualization mode (`useFullScreen`) reuses the same control panel and visualizer registry
- Light/dark theme with system preference fallback (`ThemeContext`, `ThemeToggle`, `useTheme`)
- i18n: English, French, Arabic with RTL (`rtlManager`, `LanguageSwitcher`); Arabic UI font IBM Plex Sans Arabic (`@fontsource/ibm-plex-sans-arabic`, Arabic subsets imported in `src/main.jsx`)
- Optional visualization sound (Tone.js); persisted in `localStorage` under `bayan-flow:sound-enabled`
- Code panel (lazy): Python + pseudocode tabs in one panel (`PythonCodePanel`), Monaco editor, Pyodide worker execution, editable custom test cases, predefined tests (`TestCasesPanel`, `OutputConsole`)
- Blocks tab (#234): the code panel has **Pseudocode | Python | Blocks** tabs; the Blocks tab exists only at ≥1280px. It opens on the **complete** program for the algorithm (a playground: no challenges, no solution button) for all **14 sorting algorithms, the 7 array searches, the 9 pathfinding algorithms and the 6 tree traversals** (`src/blocks/starters/`). DFS / BFS-graph searching and the Graph category show the tab muted with a "Soon" badge and a "Blocks coming soon for this algorithm" empty state (not docked). Blocks sit beside read-only generated Python at ≥1600px and above it at 1280–1599px. Run records the program's steps in the Pyodide worker and they play in the sorting, searching, pathfinding or tree visualizer with the producing block and Python line highlighted. Searches run on the visualizer's array and `targetValue`; pathfinding programs run on the visualizer's grid, start and end; tree programs run on the visualizer's tree (`treeContext` from `useTreeTraversalVisualization`). Toolbar: **Reset** (back to the starter) only; the Python tab is one click away. The workspace persists under `bayan-flow:blocks-workspace:v2:<algo>`. The Python tab is unchanged (editor, Run, Reset, test cases)
- Algorithm insight panel with history, intuition, facts, optional YouTube embed (`AlgorithmInsightPanel`, `InsightFloatingActionButton`)
- Pseudocode: localized strings and syntax highlighting inside `PythonCodePanel` (`pseudocodeHighlight.js`, `pseudocode/localize.js`) — not a separate overlay
- Auto-hiding color legend on visualizers (`AutoHidingLegend`)
- Complexity panel after completion; exported video includes a complexity segment
- Video export: horizontal/vertical orientation, MP4/H.264 via `@remotion/web-renderer`, progress modal, watermark, export audio cues via `@remotion/media`
- Landing page with hero, features, algorithm-type grid, GitHub repo badge (Octokit live stats)
- Roadmap page driven by `src/data/roadmapData.js`
- Document title syncs with route/i18n (`DocumentTitle`)
- Side FABs: `FloatingActionButton` (code/pseudocode panel), `InsightFloatingActionButton` (insight panel)
- Feature gating: `SignInPromptModal` blocks Code Panel, Insight Panel, Video Export, Sound, and Fullscreen until the user signs in with Google
- Profile settings (signed-in): `/settings/profile` — edit `display_name`, toggle `avatar_preference` (`google` \| `generated`); `RequireAuth` guard; `profileService.updateProfile()`

## Auth and Supabase

- Supabase project: `bayan-flow` (`eu-central-1`); migrations in `supabase/migrations/`
- Client: `src/lib/supabaseClient.js` (anon key via `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` only)
- Services: `src/services/authService.js`, `src/services/profileService.js`, `src/services/entitlementService.js`, `src/services/accessService.js`, `src/services/waitlistService.js`, `src/services/favoritesService.js`, `src/services/notesService.js`
- Hooks: `src/hooks/useFavorites.js`, `src/hooks/useNoteAutosave.js`
- Constants: `src/constants/personalLearning.js` (favorite slot limits, note length cap)
- Components: `src/components/FavoritesDropdown.jsx`, `src/components/AlgorithmNotesTab.jsx`, `src/components/NoteEditor.jsx` (lazy TipTap)
- Edge Functions (deployed via `deploy-supabase-functions.yml` after green CI):
  - `supabase/functions/before-signup/` — signup ban gate (fail-closed)
  - `supabase/functions/post-signup/` — post-signup side effects
  - `supabase/functions/platform-access/` — signed-in ban check (`accessService.checkPlatformAccess()`; fail-open on transport)
  - `supabase/functions/waitlist-welcome/` — Pro waitlist confirmation email via Resend (fail-open; invoked after client insert)
  - `supabase/functions/sync-contacts/` — JWT-authenticated Resend contact upsert + one-time Free welcome email on sign-in (fail-open; identity from JWT only; atomic claim on `profiles.welcome_email_sent_at`; Resend segment via `RESEND_SEGMENT_ID` or legacy `RESEND_AUDIENCE_ID`)
  - `supabase/functions/delete-account/` — self-service account deletion
- Shared email HTML: `supabase/functions/_shared/transactionalEmails.ts`
- **Not in 0.5.0:** LemonSqueezy webhook, subscriptions / usage_events / referrals / user_sessions tables (dropped via `20260720180000_drop_premature_saas_scaffolding.sql`); no viz-limit email, weekly digest, Pro nudge, or referral invite sends (Pro nudge + referral templates may exist in Resend as parked drafts for later)
- Analytics: `src/services/analytics.js`, `src/services/analyticsEvents.js` — PostHog SPA pageviews + growth events `waitlist_joined`, `upgrade_limit_hit`; surveys disabled in SDK. PostHog inits on mount via `PostHogProvider` (cookieless until consent, `setAnalyticsConsent()` on banner choice). Funnel events: `visualization_started` (once per run, `is_authenticated`), `upgrade_modal_viewed` (`trigger`), `sign_in_clicked` (`source`), `sign_in_completed` (`is_new_user`), `video_export_completed`, `video_shared` (`platform`). Dev and prod share PostHog project 517091 — filter insights on `$host`
- Context: `src/contexts/AuthProvider.jsx`, `src/hooks/useAuth.js`
- Avatar resolution: `src/utils/resolveUserAvatar.js` (`resolveUserAvatar`, `resolveDisplayName`, DiceBear notionists style)
- Components: `src/components/UserMenu.jsx`, `src/components/UserAvatar.jsx`, `src/components/RequireAuth.jsx`
- Page: `src/pages/ProfileSettingsPage.jsx`

### `public.profiles` schema

| Column                  | Client writable | Notes                                                                     |
| ----------------------- | --------------- | ------------------------------------------------------------------------- |
| `id`                    | no              | PK, FK → `auth.users`                                                     |
| `email`                 | no              | Set by `handle_new_user` trigger                                          |
| `plan`                  | no              | `free` \| `pro`; service role / webhook only                              |
| `provider`              | no              | Set on signup                                                             |
| `created_at`            | no              |                                                                           |
| `display_name`          | yes             | Editable on profile settings page                                         |
| `avatar_url`            | no              | OAuth / trigger-populated HTTPS URL                                       |
| `avatar_preference`     | yes             | `google` (default) \| `generated`                                         |
| `welcome_email_sent_at` | no              | Set atomically by `sync-contacts` when claiming the one-time welcome send |

Future (post-0.5.0, not shipped): `username` (unique, set-once RLS), public `/u/:username` route; any referral/billing columns — new migrations then, not restore of dropped scaffolding. Through 0.5.0 Pro remains waitlist-only.

### Personal learning tables

| Table                 | PK                                   | Client access                     |
| --------------------- | ------------------------------------ | --------------------------------- |
| `favorite_algorithms` | `(user_id, category, algorithm_key)` | SELECT / INSERT / DELETE own rows |
| `algorithm_notes`     | `(user_id, category, algorithm_key)` | SELECT / INSERT / UPDATE own rows |

Migration: `supabase/migrations/*_personal_learning_favorites_notes.sql`. Free tier: 20 favorite slots (`getFavoriteSlotLimit` in `entitlementService.js`); notes unlimited per algorithm with HTML sanitization (`noteHtmlSanitizer.js`).

### `public.waitlist` (Pro demand validation)

| Column       | Client writable | Notes                                         |
| ------------ | --------------- | --------------------------------------------- |
| `id`         | no              | PK                                            |
| `user_id`    | yes (on insert) | Nullable; FK → `profiles` when signed in      |
| `email`      | yes (on insert) | Unique, normalized lowercase in service layer |
| `source`     | yes (on insert) | `landing` \| `app` \| `direct`                |
| `created_at` | no              |                                               |

Insert-only RLS for `anon` + `authenticated`; no client SELECT. Public count via `waitlist_public_count()` RPC. Welcome email via `waitlist-welcome` edge function (Resend).

Migrations: `20260710140000_pro_waitlist.sql`, `20260710150000_pro_waitlist_attribution.sql` (if base table applied without attribution columns), `20260710160000_drop_waitlist_pitch_variant.sql`.

### RLS and column grants

- `profiles_select_own` — `SELECT` where `auth.uid() = id`
- `profiles_update_own` — `UPDATE` where `auth.uid() = id`
- `REVOKE UPDATE` on table for `authenticated`; `GRANT UPDATE (display_name, avatar_preference)` only

### Profile service API

- `getProfile(userId)` → `{ display_name, avatar_url, avatar_preference, plan, email }` or null
- `updateProfile(userId, { displayName, avatarPreference })` — trims display name; validates `avatarPreference`; never touches `plan`, `avatar_url`, etc.

### Profile-related tests

- `pnpm vitest run src/services/profileService.test.js`
- `pnpm vitest run src/services/favoritesService.test.js src/services/notesService.test.js`
- `pnpm vitest run src/hooks/useFavorites.test.js src/hooks/useNoteAutosave.test.js`
- `pnpm vitest run src/components/FavoritesDropdown.test.jsx src/components/AlgorithmNotesTab.test.jsx`
- `pnpm vitest run src/pages/ProfileSettingsPage.test.jsx`
- `pnpm vitest run src/contexts/AuthProvider.test.jsx src/utils/resolveUserAvatar.test.js src/components/UserMenu.test.jsx`

## Architecture Map

### App entry and providers

- `src/main.jsx` — router, `ThemeProvider`, RTL init
- `src/contexts/ThemeContext.jsx`, `src/contexts/ThemeContextDefinition.js`
- `src/i18n/index.js` — three locales, browser language detection, `localStorage` cache

### Pages

- `src/pages/LandingPage.jsx` — served through `LandingRoute` in `src/AppRoutes.jsx`: returning signed-in visitors (`hasStoredSession()` + hydrated auth) go to `/app` on a fresh visit
- `src/AppRoutes.jsx` wraps every route in `ErrorBoundary` (reset on path change) with a localized `RouteErrorFallback` (Reload / Back to Home), so a crashing page or a failed lazy chunk never blanks the app
- `src/pages/VisualizerApp.jsx` — main visualizer shell and top-level state
- `src/pages/Roadmap.jsx`
- `src/pages/ProComingSoonPage.jsx` — Pro waitlist teaser + email capture (`/pro`)
- `src/pages/ProfileSettingsPage.jsx` — signed-in display name + avatar preference

### Category registry and runtime wiring

- `src/registry/categoryConfig.js`
- `src/config/algorithmConfig.js`
- `src/config/settingsConfig.js`
- `src/hooks/useCategoryVisualizations.js`
- `src/registry/visualizerRegistry.js`
- `src/registry/extraVisualizerProps.js`
- `src/registry/videoSceneRegistry.jsx`
- `src/registry/complexityDatasetRegistry.js`

### Category hooks

- `src/hooks/useSortingVisualization.js`
- `src/hooks/usePathfindingVisualization.js`
- `src/hooks/useSearchingVisualization.js`
- `src/hooks/useTreeTraversalVisualization.js`
- `src/hooks/useGraphAlgorithmVisualization.js`

### Shared hooks

- `src/hooks/useVisualization.js` — shared step playback, sound emission, completion timing
- `src/hooks/usePythonExecution.js` — Pyodide worker lifecycle
- `src/hooks/useFullScreen.js`
- `src/hooks/useSwipe.js` — touch swipe for manual stepping
- `src/hooks/useTheme.js`

### Main UI surfaces (visualizer)

- `src/components/Header.jsx`, `src/components/Footer.jsx`
- `src/components/SettingsPanel.jsx` — category tabs, size controls, speed, export orientation
- `src/components/ControlPanel.jsx` — play/pause, step, reset, shuffle, sort order, sound toggle
- `src/components/AlgorithmDropdown.jsx`, `src/components/GraphScenarioDropdown.jsx`
- `src/components/ComplexityPanel.jsx`
- `src/components/FloatingActionButton.jsx`, `src/components/InsightFloatingActionButton.jsx`
- `src/components/PythonCodePanel.jsx` (lazy), `src/components/AlgorithmInsightPanel.jsx` (lazy)
- `src/components/ExportProgressModal.jsx`
- `src/components/OutputConsole.jsx`, `src/components/TestCasesPanel.jsx`
- `src/components/AutoHidingLegend.jsx`, `src/components/SwipeTutorial.jsx`
- `src/components/SignInPromptModal.jsx`
- `src/components/ProWaitlistBanner.jsx` — dismissible Pro waitlist CTA (landing + app)
- `src/components/LanguageSwitcher.jsx`, `src/components/ThemeToggle.jsx`, `src/components/DocumentTitle.jsx`
- `src/components/GitHubRepoBadge.jsx`

### Landing and roadmap components

- `src/components/landing/` — `Hero`, `HeroVisualizerDemo`, `AlgorithmTypes`, `Features`, `ProPreview`, `ClaritySection`, `FAQ`, `RoadmapCTA`, `TechPattern`, `SocialProofStrip` (gated by `SHOW_LANDING_SOCIAL_PROOF`)
- `src/components/roadmap/` — `RoadmapHero`, `Timeline`, `TimelineItem`
- `src/components/ui/` — shared `Button`, `Container`, `Section`

### Visualizers

- `src/components/ArrayVisualizer.jsx` — renders `ArrayBarChart.jsx` (bar view, default) or `ArrayBox.jsx` (numbered box view)
  - Array view (`ARRAY_VIEWS.BARS | BOXES`) is a per-browser preference (`bayan-flow:array-view`), toggled in `ControlPanel` for sorting + array searching, available to every tier
  - Element identity: `withElementIds()` in `src/utils/elementIds.js` adds `ids` to each sorting step (`useSortingVisualization`); bars are keyed by id so swaps slide and overwrites resize in place. Never key bars by value
  - Array row is always `dir="ltr"` (index 0 on the left), including Arabic, matching the export
  - Export parity: `arrayView` flows `exportVideo` → `inputProps` → `SortingScene` (bars interpolate slot/height from `step.ids`)
- `src/components/GridVisualizer.jsx`, `src/components/GridCell.jsx`
- `src/components/SearchingCategoryVisualizer.jsx`
- `src/components/GraphVisualizer.jsx`
- `src/components/TreeVisualizer.jsx`
- `src/components/GraphAlgorithmCategoryVisualizer.jsx`
- `src/components/GraphAlgorithmMatrixVisualizer.jsx`

### Video export

- `src/video/useVideoExporter.js`, `src/video/AlgorithmVideo.jsx`
- Scenes: `SortingScene`, `PathfindingScene`, `SearchingVideoScene`, `GraphSearchingScene`, `TreeTraversalScene`, `GraphAlgorithmVideoScene`, `GraphAlgorithmScene`, `GraphAlgorithmMatrixScene`, `ComplexityScene`
- `src/video/VideoWatermarkOverlay.jsx`
- `src/video/exportLanguage.js`, `src/video/videoExportTheme.js`, `src/video/constants.js`
- `src/video/audio/buildExportSoundCues.js`, `src/video/audio/exportAudioAssets.js`, `src/video/audio/mixExportAudio.js`
- Static export SFX: `public/video-export/sfx/` — 18 pre-rendered WAV files (regenerated via `pnpm run generate:export-sfx`)

### Python and pseudocode

- `src/hooks/usePythonExecution.js` — also `runVisualization` / `warmUp` / `vizResult` for block programs
- `src/workers/pyodide.worker.js` — `run-viz` message → `viz-steps`
- `src/workers/blocksTracer.js` — Python `__bf` tracer source + caps (25k events, 1M loop ticks), sent with each `run-viz`; `__bf_run(code, fn_name, input, target, …)` returns `finalArray` (sorts) or `result` index (searches)
- `src/blocks/` — `definitions.js` (custom blocks + i18n messages; `bf_call` / `bf_call_value` are JS blocks whose arity lives in `extraState.args`, no mutator UI), `generators.js` (display vs exec Python, line↔block map; helper hats `bf_define_helper` are emitted before the main function), `starters/` (`builders.js` JSON helpers, `sorting.js`, `searching.js`, `pathfinding.js`, `tree.js`, `index.js` with `getBlocksStarter` + `toolboxFor`, which derives each flyout from the blocks its program uses; no Blockly import), `programSteps.js` (`buildProgramSteps` for sorts, `buildSearchProgramSteps` for searches → `withElementIds` steps; `buildPathProgramSteps` for paths → grid steps; `treeToDict` + `buildTreeProgramSteps` for traversals → tree steps). Hats: `bf_define_sort` / `bf_define_search` / `bf_define_path` / `bf_define_tree` carry the whole signature in one `NAME` label (`bubble_sort(arr)`; a second field would render a gap before the parentheses). The generator takes the name before `(`; a missing `NAME` means `bubble_sort(arr)`, for workspaces saved before phase 2
- `src/components/BlocksWorkspace.jsx` — lazy Blockly injection (RTL, theme, collapsible toolbox in the stacked layout); no trash can and no zooming (no buttons, wheel or pinch; the wheel scrolls); starters are tidied (`cleanUp`) and every load is fit to the view (`zoomToFit`, capped at 100%)
- `src/algorithms/python/**`, `src/algorithms/python/index.js`, `src/algorithms/python/testCases.js`
- `src/algorithms/pseudocode/**` — `strings.en.js`, `strings.fr.js`, `strings.ar.js`, `localize.js`, `index.js`

### Audio

- `src/utils/soundEvents.js` — semantic event derivation (`SOUND_EVENT_KINDS`)
- `src/utils/soundManager.js` — Tone.js playback singleton
- `src/utils/soundFrequencies.js`, `src/utils/toneInstrumentPresets.js`
- `src/utils/masterChain.js` — shared effects bus (gain → filter → compressor → reverb)
- `src/utils/categoryPalettes.js` — per-category instrument and chord mappings
- `src/utils/scaleQuantizer.js` — pentatonic note selection for melodic cues

### Utility generators and helpers

- `src/utils/arrayHelpers.js`, `src/utils/gridHelpers.js`, `src/utils/treeGenerators.js`
- `src/utils/graphSearchGenerators.js`, `src/utils/graphAlgorithmGenerators.js`, `src/utils/graphTestScenarios.js`
- `src/utils/graphMatrixLayout.js`, `src/utils/dStarLiteHelpers.js`, `src/utils/PriorityQueue.js`
- `src/utils/resolveStepDescription.js`, `src/utils/pseudocodeHighlight.js`
- `src/utils/rtlManager.js`, `src/utils/algorithmTranslations.js`
- `src/utils/deployContext.js` — `isProductionMainBranch()` from `VITE_GIT_BRANCH`
- `src/utils/formatGitHubCount.js`

### Data

- `src/data/roadmapData.js`

### Test infrastructure

- `src/test/setup.js` — global Vitest setup (i18n init, constants/Tone/soundManager/framer-motion mocks)
- `src/test/testUtils.jsx` — `renderWithI18n()` helper
- `src/test/framerMotionMock.jsx` — shared Framer Motion test double

### Public static assets

- `public/manifest.json`, `public/sitemap.xml`, `public/robots.txt`, `public/logo.svg`
- `public/_headers` — security headers, cache rules, and `workers.dev` noindex for Cloudflare Workers static assets
- `public/ui/sfx/` — interactive UI one-shot sounds (e.g. theme toggle); loaded via Web Audio in `src/utils/themeSwitchSound.js`
- `public/video-export/sfx/` — 18 pre-rendered Remotion export WAV files (see Export sound contract)
- `public/blockly-media/` — Blockly sprites/cursors vendored from `blockly@13.4.0` (no `.mp3`), plus Blockly's Apache-2.0 `LICENSE`; referenced via `media: '/blockly-media/'`

### Build, CI, and repo config

- `vite.config.js`, `vitest.config.js` (`@/` alias, jsdom, sequential forks for memory)
- `eslint.config.js`, `wrangler.jsonc`, `codecov.yml`
- `scripts/render-tone-export-sfx.mjs` — Playwright + Tone.Offline WAV generation
- `.github/workflows/ci.yml`, `deploy-cloudflare.yml`, `deploy-supabase-functions.yml`, `preview-cloudflare.yml`, `ensure-pr-source-develop.yml`, `release.yml`, `stale.yml`, `semgrep.yml`, `.github/labeler.yml`

## Runtime Pattern

- `VisualizerApp` owns top-level UI state:
  - active category (`algorithmType`)
  - selected algorithm per category (`selectedAlgorithms`)
  - size state: `arraySize`, `gridSize`, `searchGraphNodeCount`, `treeNodeCount`, `graphNodeCount`
  - graph scenario selection for graph algorithms
  - sorting order (`SORT_ORDERS`)
  - speed, playback mode (`VISUALIZATION_MODES`), sound preference, full-screen state
  - export flow, lazy panel visibility (`PythonCodePanel`, `AlgorithmInsightPanel`)
  - gated feature state (`gatedFeature`, `pendingFeatureRef`) for sign-in gating
- All category hooks are called unconditionally in `VisualizerApp` to preserve React Rules of Hooks.
- `CATEGORY_CONFIG` is the central registry for:
  - default algorithm
  - translation prefix and tab label
  - icon (Phosphor)
  - `sizeBinding`: `array` | `grid` | `tree` | `graph`
  - algorithm lookup and data generation
  - feature flags (e.g. `hasDataRefresh`)
  - size control metadata (slider vs preset buttons)
  - grouped dropdown definitions (`groupDefs`)
  - complexity dataset key
- `useAlgorithmConfig()` derives translated dropdown data from `CATEGORY_CONFIG`.
- Each category hook computes steps and runtime state; `useCategoryVisualizations()` exposes them as a map keyed by `ALGORITHM_TYPES`.
- `VISUALIZER_REGISTRY` selects the interactive renderer.
- `getExtraVisualizerProps()` centralizes category-specific props for visualizer components.
- `VIDEO_SCENE_RENDERERS` selects the Remotion scene.
- `COMPLEXITY_DATASETS` must stay aligned with `CATEGORY_CONFIG[category].complexityDataset`.
- Visualization sound is emitted from the shared playback layer through `getSoundEventsForStep()`, not from category-specific UI controls.

## Category-Specific Contracts

### Searching Substrate Contract

- Source of truth: `src/registry/searchingSubstrate.js`
- Array search algorithms use `ArrayVisualizer` through `SearchingCategoryVisualizer`.
- Node-link graph search algorithms use `GraphVisualizer` through `SearchingCategoryVisualizer`.
- Do not special-case searching substrate in unrelated components; branch through `getSearchingSubstrate()` / `isNodeLinkSearchingAlgorithm()`.
- Node-link searching uses `DEFAULT_SEARCH_GRAPH_NODE_COUNT` (12) and `SEARCH_GRAPH_NODE_COUNT` (slider 5–24), separate from pathfinding grid size and graph-algorithm node count.
- Searching video export routes array-shaped steps to `SortingScene` and node-link shaped steps to `GraphSearchingScene` via `SearchingVideoScene`.

### Graph Algorithm Contract

- Registry: `src/registry/graphAlgorithmRegistry.js`
- Representations:
  - `GRAPH_REPRESENTATIONS.NODE_LINK`
  - `GRAPH_REPRESENTATIONS.MATRIX`
- Profiles (`GRAPH_ALGORITHM_PROFILES`): directed/weighted flags, representation, scenario support, deterministic input generation via `createInput()`
- Groups (`GRAPH_ALGORITHM_GROUPS`): topological ordering, MST, SCC, shortest paths
- Input shape for node-link graph algorithms:
  - `{ nodes, edges, adjacency, directed, weighted }`
- Step shape for node-link graph algorithms:
  - `{ nodes, edges, nodeStates, edgeStates, stackOrder, outputOrder, graphArtifacts, description, representation, directed, weighted }`
- Step shape for matrix graph algorithms:
  - `{ matrix, description, representation, directed, weighted, graphArtifacts }`
- `matrix` shape:
  - `{ rowLabels, columnLabels, cells, cellStates }`
- Floyd-Warshall is the matrix-path exception and has a smaller max node-count range (`max: 6`).
- Preset scenarios are fixed datasets in `graphTestScenarios.js`. When a scenario is selected, UI must not imply that `graphNodeCount` still changes the active graph (`GraphScenarioDropdown`).

### Pathfinding Contract

- Pathfinding algorithms operate on grid steps and are rendered by `GridVisualizer` / `PathfindingScene`.
- `CATEGORY_CONFIG[PATHFINDING].generateData()` creates an empty grid template; randomized start/end and walls are owned by `usePathfindingVisualization`.
- `gridSize` uses named presets from `GRID_SIZES`, not the array-size slider.

### Tree Traversal Contract

- Tree traversal data comes from `generateTreeForTraversal()`.
- `sizeBinding: 'tree'` with `treeNodeCount` (default 15, slider 3–31).
- Visual state includes nodes, edges, node states, visit order, optional queue order, and optional level scan direction.
- Keep tree generator and traversal tests aligned when changing node shape or traversal ordering.

## User-Facing Surface

- Locales:
  - `src/i18n/locales/en/translation.json`
  - `src/i18n/locales/fr/translation.json`
  - `src/i18n/locales/ar/translation.json`
- Pseudocode strings:
  - `src/algorithms/pseudocode/strings.en.js`
  - `src/algorithms/pseudocode/strings.fr.js`
  - `src/algorithms/pseudocode/strings.ar.js`
- Python snippets:
  - `src/algorithms/python/*.py`
  - `src/algorithms/python/index.js`
  - `src/algorithms/python/testCases.js`
- `featureGate` i18n namespace: feature labels and sign-in prompt strings in all three locale files
- Insight copy: `insight_panel.algorithms.<key>.*` keys in all three locale files; metadata in `algorithmKnowledge.js`
- User-facing category labels are reused in multiple places. If you rename one, audit:
  - all locale files
  - pseudocode strings if algorithm names/descriptions change
  - `src/registry/videoSceneRegistry.jsx`
  - landing/roadmap/README/docs copy that mentions the category by name
  - export title fallbacks and complexity labels
- Arabic is RTL. Check layout direction-sensitive changes in both app UI and Remotion export.

## Visualizer UX Rules

- Preserve the registry-driven architecture. Prefer extending config/registry files over adding special-case branches in `VisualizerApp`.
- Completion UX should preserve the final visualization state briefly before showing `ComplexityPanel`.
- Graph algorithm parity must cover both:
  - interactive visualization
  - Remotion export
- Floyd-Warshall must remain aligned across:
  - `GraphAlgorithmCategoryVisualizer`
  - `GraphAlgorithmVideoScene`
  - `GraphAlgorithmMatrixScene`
  - `GraphAlgorithmMatrixVisualizer`
- The shared regenerate action is category-neutral and should stay described as input regeneration, not array regeneration.
- The shared control uses `Generate New Input` copy and a refresh-style icon because the same action regenerates arrays, grids, trees, and graphs depending on the active category.
- Sorting is the only category with sort-order controls.
- Full-screen mode uses the same `ControlPanel` and visualizer registry as normal mode.
- Lazy panels (`PythonCodePanel`, `AlgorithmInsightPanel`) must remain optional overlays and should not block the main visualization path.
- Blocks mode contracts:
  - Blocks are the source of truth; Python is generated one way (shown read-only beside the blocks). The Python tab keeps the reference `.py`.
  - Steps come from the generator's exec pass (`__bf.gt/lt/ge/le/cmp_target/swap/get/set/shuffle/is_sorted/tick` calls carrying block ids), never from tracing arbitrary Python. Only operations on `arr` are traced (compare, swap, read, write, shuffle, sorted check); helper lists (`[0] * n`, buckets, slices) are plain Python, matching the JS visualizations, which only show `arr`. Search steps come from target compares only (reads in formulas are skipped). Display code stays clean (no `global`, no `= None`); `arr`, `target`, `grid`, `start`, `end`, `heapq` and helper names are reserved so learner variables can't shadow them.
  - Path programs (`bf_define_path`, `def name(grid, start, end)` → path as a list of `(row, col)` cells, `[]` when the end is reached) trace only the frontier and costs: `__bf.push` / `push_priority` / `relax` → `open` (OPEN), `pop` / `pop_min` → `visit` (CLOSED), `pop_last` → `leave` (CLOSED, IDA*'s backtrack). Events carry `cell`, not an array copy. Parent maps, visited sets and the returned path are plain Python. `neighbors`, `walkable` and `manhattan` are untraced helpers emitted via `provideFunction_` (not reserved, or they'd be renamed `neighbors2`). Helper calls in path programs pass every argument (`build_path(parent, cell)`); sort/search helper calls get `arr` prepended. Verdict: a returned list is solved when it runs start → end through free cells, each 4-adjacent to the previous (`isValidGridPath`); a valid path longer than the BFS shortest (`shortestPathLength`) still passes but the final step and the output say so (`blocksPathLonger`, `run_path_longer`; expected for greedy search). The grid has no walls in the app yet: JPS skips forced-neighbour checks and D* Lite plans once (both marked `shortcut:` in `starters/pathfinding.js`); add those when walls can be drawn.
  - Tree programs (`bf_define_tree`, `def name(root)` → node values in visit order, returned with an explicit `return result`) take the tree as nested dicts `{"value", "left", "right"}` (`treeToDict`); node values are unique (1..n), so a value names a node. Traced: `bf_visit` (`result.append(node["value"])`) → `output` (VISITING then VISITED, like the JS traversals); `push` / `pop` / `pop_last` on nodes → `open` / `visit` / `leave` events carrying the node value in `cell`, mirrored as the queue strip (hidden once `pop_last` shows the list is a stack; the starting `[root]` literal is untraced); `bf_set_child` → `thread` / `unthread` (extra `{from, to}` edge, Morris). Compare nodes with `bf_is` (`is` / `is not`): `==` on a threaded Morris tree recurses forever. `root` is reserved. Pre/in/post-order starters are recursive (`walk(node, result)` helper, like the `.py` references); level-order and zigzag use a queue. Verdict: solved when the returned list equals `pureTreeTraversalAlgorithms[algo]` mapped to values; otherwise the final step and the output show both orders (`blocksTreeWrongOrder`, `run_tree_wrong_order`). A right order that leaves Morris threads in the tree also fails (`blocksTreeThreadsLeft`, `run_tree_threads_left`): without the unthread, Morris still visits in order but corrupts the tree. Zigzag's scan-direction badge is derived, not traced: each level's direction comes from the layout `x` of its first two visits (a one-node level alternates by depth).
  - Worker contract: `runVisualization(code, args, { functionName, kind })` → `__bf_run(code, fn_name, args_json, kind, …)`; `args` is `[arr]`, `[arr, target]`, `[grid, [r, c], [r, c]]` (start/end become tuples) or `[root]`. A path comes back in `finalArray` as `[r, c]` lists, a traversal as a list of values.
  - Starters sort in place like `src/algorithms/sorting/*.js` (not the `src/algorithms/python/*.py` references, some of which return new lists). Each stays under the 25k-event cap at the max input size (100); bogo sort gives up after 1000 shuffles like the JS version. Pathfinding starters stay far below it on the largest grid (35×35: ≤2.7k events; IDA\* ≈200 on an empty grid but it blows up with random walls).
  - Blockly stays out of the main bundle (lazy `BlocksWorkspace`). `vite.config.js` `blocklyNoAmd` strips Blockly's UMD AMD branch (Monaco's loader installs a global `define.amd`); keep it in both `plugins` and `optimizeDeps.rolldownOptions.plugins`.
  - Inject with `sounds: false` (no UI sounds) and local `media` (CSP).
  - Split: the divider between the workspace and its Python is draggable (and arrow keys on the focused divider); Python's share (20–70%, default 42%) is stored under `bayan-flow:blocks-python-percent`.
  - Full screen is disabled while docked (button disabled with a tooltip; `useFullScreen({ canEnter })` ignores F), since it would hide the panel; exiting still works.
  - Header: while docked, `body:has([data-docked]) header[role='banner']` (in `src/index.css`) lifts the header above the panel so the language and account menus open over it.
  - Docking: on the Blocks tab of a supported algorithm the drawer docks non-modally at `min(60vw, 100vw - 820px)` (settings sidebar hidden, `<main>` padded, a close button replaces the backdrop click). Below 1600px blocks and Python stack and the toolbox is a collapsible category (an open flyout would cover the narrow workspace). Below 1280px there is no Blocks tab.
  - Block-program playback goes through the active category's `visualization.loadSteps` and `consumeRunIfNeeded()` (`visualization_started` carries `source: 'blocks'`).
  - `blocks_tab_opened` (`algorithm_key`, `supported`) fires when the Blocks tab is selected; `blocks_program_run` (`algorithm_key`, `success`) fires every run.
  - Persistence: only edits are written to `bayan-flow:blocks-workspace:v2:<algo>` (an untouched algorithm keeps getting the latest starter); Reset removes the key; a stored workspace without blocks is ignored. Re-injection (theme, language, the 1600px layout switch) restores the in-memory workspace JSON, so block ids that already-played steps refer to stay valid.
  - New algorithms: add a starter in `src/blocks/starters/` (the coverage test in `starters/index.test.js` lists which keys must have one) and run the CPython check below.
- Swipe stepping applies only in manual playback mode on touch devices.
- The step progress bar is seekable for everyone (anonymous trial included): an invisible full-width range input drives seeking, a circular grab handle (`seek-thumb`) marks the fill edge, and `controls.dragToSeek` microcopy sits under the bar. For anonymous users a seek on a fresh run consumes one trial credit via `VisualizerApp` `consumeRunIfNeeded()` (`session_limit` gate once the 12 runs are used).

## Sound And Export Notes

- Sound enable/disable UI lives in `src/components/ControlPanel.jsx`.
- Persisted sound preference and shared sound toggle state live in `src/pages/VisualizerApp.jsx` (`bayan-flow:sound-enabled`).
- Semantic sound event derivation lives in `src/utils/soundEvents.js` (`SOUND_EVENT_KINDS`: compare, swap, pivot, complete, visit, frontier, targetFound, pathFound, noResult, edgeConsider, edgeSelect, cycle, matrixConsider, matrixUpdate, componentComplete, passComplete).
- Actual Tone.js playback state lives in the singleton `soundManager`, routed through `createMasterChain()` and category-specific palettes/chords from `categoryPalettes.js`.
- Pentatonic note selection for melodic micro-events uses `scaleQuantizer.js`.
- If you touch sound UX, keep the enabled state synchronized with `soundManager.getIsEnabled()` and local storage.
- Sound is visualization-only: do not add click, settings, panel, export-button, fullscreen, or regeneration sounds.
- Do not infer sound from localized `description` text. Use stable visual state or explicit semantic step metadata.
- `useVisualization` is responsible for emitting sound during intentional forward playback/manual stepping. Initial load, reset, step-back, algorithm changes, and passive regeneration should stay silent.
- `soundManager` should create Tone instruments lazily after sound is enabled, not at module import.
- Interactive playback and export audio should consume the same sound events so they do not drift.
- Pre-rendered export WAV assets live under `public/video-export/sfx/`; regenerate with `pnpm run generate:export-sfx` after changing instrument presets or event kinds.
- Graph algorithm and Floyd-Warshall matrix sound parity must cover both interactive visualization and Remotion export.
- Export uses `@remotion/web-renderer`, supports horizontal and vertical orientations, and renders MP4/H.264 when the browser supports it.
- Export audio is pre-mixed into one WAV before rendering (`buildExportAudioUrl()` in `src/video/audio/mixExportAudio.js`) and played by a single `@remotion/media` `<Audio>` in `AlgorithmVideo`.
- `AlgorithmVideo` adds title, step counter, localized description, watermark, optional export audio, and final complexity scene.
- `buildExportSoundCues()` should schedule cues from `getSoundEventsForStep()` and must not special-case translated copy.
- Export descriptions use `resolveStepDescription()` and normalized export language (`exportLanguage.js`). Keep description keys localizable.

## CI, Deployment, And Build-Time Env

- CI (`.github/workflows/ci.yml`) on push/PR to `main` and `develop` — Node **24.11.1**, pnpm **9**:
  1. **Quality** — `pnpm lint`, `pnpm format:check`
  2. **Test** — `pnpm test:coverage` (Codecov upload via `codecov.yml`, PR lcov comment)
  3. **Build** — `pnpm build` with `VITE_GIT_BRANCH`, `VITE_DEV_SITE_URL`
  4. **Deploy** — Cloudflare Workers (`main` → production, `develop` → staging); PR previews via `preview-cloudflare.yml` (separate workflow)
  5. **All-checks-pass** — aggregate gate for branch protection
- Other workflows:
  - `deploy-cloudflare.yml` — production/staging deploy after CI succeeds on `main`/`develop`
  - `preview-cloudflare.yml` — PR preview URLs on `bayan-flow-staging`
  - `ensure-pr-source-develop.yml` — blocks PRs to `main` unless head is `develop` or author is in `ALLOWED_MERGERS` secret
  - `release.yml` — GitHub release on `v*` tags
  - `stale.yml`, `labeler.yml` — repo hygiene
- Cloudflare SPA routing in `wrangler.jsonc` (`not_found_handling: single-page-application`); branch context sets `VITE_GIT_BRANCH` at build time.
- Optional `VITE_PYODIDE_CDN_BASE` overrides the default jsDelivr Pyodide CDN (`src/constants/pyodideCdn.js`).
- `src/utils/deployContext.js` — `isProductionMainBranch()` gates production-only UI (e.g. certain landing content).
- GitHub repo constants: `src/constants/githubRepo.js`.

## Adding Or Changing A Category

1. Add/update the category key in `src/constants/index.js` (`ALGORITHM_TYPES`, complexity map if needed).
2. Add/update the `CATEGORY_CONFIG` entry in `src/registry/categoryConfig.js`.
3. Wire the hook unconditionally in `src/pages/VisualizerApp.jsx`.
4. Add the hook result in `src/hooks/useCategoryVisualizations.js`.
5. Register the visualizer in `src/registry/visualizerRegistry.js`.
6. Register extra props in `src/registry/extraVisualizerProps.js`.
7. Register the Remotion scene and title fallback in `src/registry/videoSceneRegistry.jsx`.
8. Ensure `src/registry/complexityDatasetRegistry.js` contains the dataset key.
9. Add settings config/i18n entries where needed.
10. Add or update tests for category config, runtime completeness, visualizer selection, export scene selection, and settings UI.
11. Add a runner for the category hook in `src/registry/generatorSmoke.test.jsx` (the test fails until one exists). Build hook inputs once per case, outside the render.

## Adding A New Algorithm

1. Add the JS implementation under the relevant `src/algorithms/<category>/` folder.
2. Export/register it from that category's `index.js`.
3. Add constants/complexity metadata in `src/constants/index.js`.
4. Add insight metadata in `src/constants/algorithmKnowledge.js` (if insight panel coverage is desired).
5. Add i18n entries in all three locale files.
6. Add pseudocode in all three pseudocode string files.
7. Add Python code in `src/algorithms/python/` and register it in `src/algorithms/python/index.js`.
8. Add Python test cases in `src/algorithms/python/testCases.js`.
9. Add/update semantic sound-event coverage in `src/utils/soundEvents.js` when the algorithm introduces new visual action states.
10. Update `categoryConfig.js` `algorithmKeys` and `groupDefs` (and graph profile if applicable).
11. Add or extend tests for algorithm logic, registry wiring, hook behavior, visualizers, export scenes, Python index, complexity metadata, pseudocode, sound events, and insight metadata.
12. `src/registry/generatorSmoke.test.jsx` must stay green: the algorithm terminates at min/default/max size (and every graph scenario) and its default-size run fits the export limit.

### Generator and export guardrails

- Step generators run synchronously on the main thread; a non-terminating loop freezes the tab and hangs the smoke test. Loops driven by a queue without decrease-key (`src/utils/PriorityQueue.js`) must skip stale or already-consistent entries and carry an iteration bound (see `dStarLite.js`).
- Export pacing comes from `getExportTiming()` in `src/video/constants.js`: 1.5 s per step when the video fits in 10 minutes, faster down to 0.2 s per step, and blocked in the format dialog above that. Scenes must derive all timing from the `framesPerStep` prop.
- Export scenes may render any Unicode inside `<svg>` (Remotion `>= 4.0.458`, asserted by `src/video/remotionSvgEncoding.test.js`). Keep `remotion`, `@remotion/media` and `@remotion/web-renderer` on the same exact version.
- Export audio is always mixed in; it does not follow the playback Sound toggle.
- `@remotion/web-renderer` draws every DOM element on every frame, but rasterises an `<svg>` once with its children. Scenes with many cells or shapes draw them inside one `<svg>` (see `PathfindingScene.jsx`: a 35×35 grid of `<div>`s rendered at 7.7× real time, one `<svg>` at 1.2×).
- `generatorSmoke.test.jsx` runs each generator under a watchdog thread that kills the test process after 20 s and names the case, because Vitest timeouts cannot interrupt a synchronous infinite loop.
- Never mount one media element per step or cue in an export composition. `@remotion/media` keeps an iterator per element in a cache sized to half of system RAM, so ~2,000 per-step `<Audio>` elements crashed near-limit exports. Add new sounds as cues to the pre-mixed track instead.

## Adding A New Graph Algorithm

1. Add the algorithm implementation in `src/algorithms/graphAlgorithm/`.
2. Export it from `src/algorithms/graphAlgorithm/index.js`.
3. Register its profile in `src/registry/graphAlgorithmRegistry.js` (`GRAPH_ALGORITHM_PROFILES`, scenarios, groups).
4. Add its constant and complexity entry in `src/constants/index.js`.
5. Add insight metadata in `src/constants/algorithmKnowledge.js`.
6. Add i18n entries in all three locale files.
7. Add pseudocode in all three pseudocode string files.
8. Add Python code in `src/algorithms/python/` and register it in `src/algorithms/python/index.js`.
9. Add Python test cases in `src/algorithms/python/testCases.js`.
10. Add/update graph or matrix sound-event coverage in `src/utils/soundEvents.js`.
11. Add or extend tests for JS logic, graph profile/scenario wiring, hook behavior, visualizers, export scenes, Python index, complexity metadata, pseudocode, sound events, and insight metadata.

## Testing Workflow

- Vitest runs in jsdom with `@/` path alias; tests use sequential forks to reduce memory pressure (`vitest.config.js`).
- Setup: `src/test/setup.js` (global mocks for constants, Tone, soundManager, framer-motion, gridHelpers).
- Helper: `renderWithI18n()` from `src/test/testUtils.jsx` for component tests needing i18n.
- Coverage config: `codecov.yml` (patch target 70%; several presentational components excluded from coverage totals).

### Fast targeted checks while iterating

**Registry and runtime (run first for wiring changes):**

- `pnpm vitest run src/registry/categoryConfig.test.js`
- `pnpm vitest run src/registry/categoryRuntimeCompleteness.test.js`
- `pnpm vitest run src/registry/visualizerRegistry.test.js`
- `pnpm vitest run src/registry/extraVisualizerProps.test.js`
- `pnpm vitest run src/registry/videoSceneRegistry.test.jsx`
- `pnpm vitest run src/registry/complexityDatasetRegistry.test.js`
- `pnpm vitest run src/registry/graphAlgorithmRegistry.test.js`
- `pnpm vitest run src/registry/searchingSubstrate.test.js`

**Config and constants:**

- `pnpm vitest run src/config/algorithmConfig.test.jsx`
- `pnpm vitest run src/config/settingsConfig.test.jsx`
- `pnpm vitest run src/constants/index.test.js`
- `pnpm vitest run src/constants/algorithmKnowledge.test.js`
- `pnpm vitest run src/constants/githubRepo.test.js`

**Hooks:**

- `pnpm vitest run src/hooks/useCategoryVisualizations.test.js`
- `pnpm vitest run src/hooks/useVisualization.test.js`
- `pnpm vitest run src/hooks/useGraphAlgorithmVisualization.test.js`
- `pnpm vitest run src/hooks/useSortingVisualization.test.js`
- `pnpm vitest run src/hooks/usePathfindingVisualization.test.js`
- `pnpm vitest run src/hooks/useSearchingVisualization.test.js`
- `pnpm vitest run src/hooks/useTreeTraversalVisualization.test.js`
- `pnpm vitest run src/hooks/usePythonExecution.test.js`
- `pnpm vitest run src/hooks/useSwipe.test.js`
- `pnpm vitest run src/hooks/useTheme.test.js`

**Core visualizer shell:**

- `pnpm vitest run src/pages/VisualizerApp.test.jsx`
- `pnpm vitest run src/components/SettingsPanel.test.jsx`
- `pnpm vitest run src/components/ControlPanel.test.jsx`
- `pnpm vitest run src/components/PythonCodePanel.test.jsx`
- `pnpm vitest run src/components/AlgorithmInsightPanel.test.jsx`
- `pnpm vitest run src/components/AlgorithmDropdown.test.jsx`
- `pnpm vitest run src/components/GraphScenarioDropdown.test.jsx`

**Visualizers and panels:**

- `pnpm vitest run src/components/GraphVisualizer.test.jsx`
- `pnpm vitest run src/components/GraphAlgorithmCategoryVisualizer.test.jsx`
- `pnpm vitest run src/components/GraphAlgorithmMatrixVisualizer.test.jsx`
- `pnpm vitest run src/components/ComplexityPanel.test.jsx`
- `pnpm vitest run src/components/AutoHidingLegend.test.jsx`
- `pnpm vitest run src/components/TestCasesPanel.test.jsx`
- `pnpm vitest run src/components/ExportProgressModal.test.jsx`
- `pnpm vitest run src/components/SignInPromptModal.test.jsx`

**Video export:**

- `pnpm vitest run src/video/AlgorithmVideo.test.jsx`
- `pnpm vitest run src/video/AlgorithmVideo.renderer.test.jsx`
- `pnpm vitest run src/video/useVideoExporter.test.js`
- `pnpm vitest run src/video/GraphAlgorithmVideoScene.test.jsx`
- `pnpm vitest run src/video/GraphAlgorithmMatrixScene.test.jsx`
- `pnpm vitest run src/video/GraphAlgorithmScene.test.jsx`
- `pnpm vitest run src/video/ComplexityScene.test.jsx`
- `pnpm vitest run src/video/audio/buildExportSoundCues.test.js`

**Sound:**

- `pnpm vitest run src/utils/soundEvents.test.js`
- `pnpm vitest run src/utils/soundManager.test.js`
- `pnpm vitest run src/utils/masterChain.test.js`

**Algorithms and Python/pseudocode:**

- `pnpm vitest run src/algorithms/graphAlgorithm/*.test.js`
- `pnpm vitest run src/algorithms/sorting/algorithms.test.js`
- `pnpm vitest run src/algorithms/pathfinding/pathfinding.test.js`
- `pnpm vitest run src/algorithms/searching/index.test.js`
- `pnpm vitest run src/algorithms/treeTraversal/*.test.js`
- `pnpm vitest run src/algorithms/python/index.test.js`
- `pnpm vitest run src/algorithms/pseudocode/index.test.js`

**Blocks tab:**

- `pnpm vitest run src/blocks src/hooks/usePythonExecution.test.js src/components/PythonCodePanel.test.jsx src/pages/VisualizerApp.test.jsx src/services/analyticsEvents.blocks.test.js`
- The tracer (`src/workers/blocksTracer.js`) runs only in Pyodide in the app; check it in the browser (Run in Blocks mode) after changing it. It is plain Python, so it can also be exercised in CPython by `exec`-ing `BLOCKS_TRACER_PY` and calling `__bf_run` on each starter's `execCode` (for pathfinding: random start/end on 15/25/35 grids, asserting a valid path of BFS-shortest length for all but greedy)

**Landing, roadmap, and i18n:**

- `pnpm vitest run src/pages/LandingPage.test.jsx`
- `pnpm vitest run src/pages/Roadmap.test.jsx`
- `pnpm vitest run src/components/landing/*.test.jsx`
- `pnpm vitest run src/components/roadmap/*.test.jsx`
- `pnpm vitest run src/i18n/i18n.test.js`
- `pnpm vitest run src/data/roadmapData.test.js`

### Before handing off a branch

- `pnpm test:run`
- `pnpm build`
- `pnpm lint`
- `pnpm format:check`

Use focused tests first for registry/category changes, then broaden to the full suite before handoff when the change touches shared runtime behavior.

## Workflow Rules For This Repo

- Do not rewrite user-authored changes.
- Keep shared registries synchronized; this codebase relies on configuration completeness more than ad hoc branching.
- When changing a user-facing label or category concept, audit all locales and export fallbacks, not just the visible screen you touched.
- When changing an algorithm, keep JS logic, UI, export, i18n, pseudocode, Python snippets, Python tests, complexity metadata, and insight metadata category-consistent.
- When changing visual step states, keep `soundEvents` and export audio cue tests aligned with the new visual behavior.
- Do not reintroduce controller/settings sounds; sound should come from visualization steps only.
- Treat silence as intentional: if a new step has no sound, make sure that is a deliberate choice rather than an omitted event mapping.
- For net-new graph algorithms, keep commits scoped to one completed algorithm at a time.
- If a shared helper is required, add it in the earliest commit that needs it.
- Prefer existing hooks, registries, helpers, and component patterns over one-off branches.
- Keep deterministic generators deterministic in tests by accepting/passing an `rng` where existing utilities do.

## Agent-Readiness Endpoints

### Static files (served from `public/`)

| File                                      | Content-Type               | Purpose                                                              |
| ----------------------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `/.well-known/api-catalog`                | `application/linkset+json` | RFC 9727 API catalog with `linkset` array                            |
| `/.well-known/mcp/server-card.json`       | `application/json`         | MCP Server Card (SEP-1649) with `serverInfo`, endpoint, capabilities |
| `/.well-known/oauth-authorization-server` | `application/json`         | OAuth discovery (Supabase issuer) with `agent_auth` block            |
| `/.well-known/oauth-protected-resource`   | `application/json`         | RFC 9728 Protected Resource Metadata                                 |
| `/.well-known/agent-card.json`            | `application/json`         | Agent card with capabilities and features                            |
| `/.well-known/agent-skills/index.json`    | `application/json`         | Agent skills catalog                                                 |
| `/auth.md`                                | `text/markdown`            | Agent registration / authentication guide                            |
| `/llms.txt`                               | `text/plain`               | Machine-readable site description for AI agents                      |

### Link headers (in `public/_headers`)

The `/*` section includes `Link` headers pointing to:

- `</.well-known/api-catalog>; rel="api-catalog"`
- `</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`
- `</.well-known/mcp/server-card.json>; rel="mcp-server-card"`
- `</auth.md>; rel="auth-md"`
- `</llms.txt>; rel="llms-txt"`

### CORS

All `/.well-known/*` paths include `Access-Control-Allow-Origin: *` for cross-origin agent discovery.
