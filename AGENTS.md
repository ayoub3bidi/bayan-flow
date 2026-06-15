# AGENTS

## Project Snapshot

- Product: `Bayan Flow` (Bayan / بيان = clarity in Arabic)
- Package name: `bayan-flow`
- App type: client-side React SPA with routes `/`, `/app`, `/roadmap`
- Version target in `package.json`: `0.5.0`
- License: `Elastic-2.0 OR Commercial` (see `LICENSE`, `COMMERCIAL_LICENSE.md`, `TRADEMARK.md`)
- Repository/homepage:
  - `https://github.com/ayoub3bidi/bayan-flow`
  - Production: `https://bayanflow.com` (`main`)
  - Dev/beta: `https://dev.bayanflow.com` (`develop`)
  - Contact: `contact@bayanflow.com`
- Tooling: React 19, React Router 7, Rolldown Vite 7, Tailwind CSS 4, Vitest 3, React Testing Library, Framer Motion, Remotion 4, i18next, Monaco Editor, Tone.js, @phosphor-icons/react, react-icons (SimpleIcons for brand logos), Octokit, Playwright (export SFX script only)
- Python execution: Pyodide `0.27.5` loaded client-side in a worker
- Engines: Node `>=24.11.1`, pnpm `>=8.15.9` (CI uses pnpm 9)
- Contribution flow: PRs target `develop`, not `main`; PRs to `main` are gated by `.github/workflows/ensure-pr-source-develop.yml`
- Algorithm inventory: **45** algorithms across **5** categories (14 sorting, 9 pathfinding, 9 searching, 6 tree traversal, 7 graph algorithms)
- Test surface: **98** `*.test.js` / `*.test.jsx` files under `src/`

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

- Playback: manual vs autoplay (`VISUALIZATION_MODES`), four speed presets (`ANIMATION_SPEEDS`)
- Mobile: horizontal swipe for manual step forward/back (`useSwipe`), one-time swipe tutorial (`SwipeTutorial`)
- Full-screen visualization mode (`useFullScreen`) reuses the same control panel and visualizer registry
- Light/dark theme with system preference fallback (`ThemeContext`, `ThemeToggle`, `useTheme`)
- i18n: English, French, Arabic with RTL (`rtlManager`, `LanguageSwitcher`)
- Optional visualization sound (Tone.js); persisted in `localStorage` under `bayan-flow:sound-enabled`
- Python code panel: Pyodide worker execution, editable custom test cases, predefined tests (`PythonCodePanel`, `TestCasesPanel`, `OutputConsole`)
- Algorithm insight panel with history, intuition, facts, optional YouTube embed (`AlgorithmInsightPanel`, `InsightFloatingActionButton`)
- Pseudocode panel with localized strings and syntax highlighting (`pseudocodeHighlight.js`, `pseudocode/localize.js`)
- Auto-hiding color legend on visualizers (`AutoHidingLegend`)
- Complexity panel after completion; exported video includes a complexity segment
- Video export: horizontal/vertical orientation, MP4/H.264 via `@remotion/web-renderer`, progress modal, watermark, export audio cues
- Landing page with hero, features, algorithm-type grid, GitHub repo badge (Octokit live stats)
- Roadmap page driven by `src/data/roadmapData.js`
- Document title syncs with route/i18n (`DocumentTitle`)

## Architecture Map

### App entry and providers

- `src/main.jsx` — router, `ThemeProvider`, RTL init
- `src/contexts/ThemeContext.jsx`, `src/contexts/ThemeContextDefinition.js`
- `src/i18n/index.js` — three locales, browser language detection, `localStorage` cache

### Pages

- `src/pages/LandingPage.jsx`
- `src/pages/VisualizerApp.jsx` — main visualizer shell and top-level state
- `src/pages/Roadmap.jsx`

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
- `src/components/LanguageSwitcher.jsx`, `src/components/ThemeToggle.jsx`, `src/components/DocumentTitle.jsx`
- `src/components/GitHubRepoBadge.jsx`

### Landing and roadmap components

- `src/components/landing/` — `Hero`, `Features`, `AlgorithmTypes`, `ClaritySection`, `LearnYourWay`, `RoadmapCTA`, `TechPattern`
- `src/components/roadmap/` — `RoadmapHero`, `Timeline`, `TimelineItem`
- `src/components/ui/` — shared `Button`, `Container`, `Section`

### Visualizers

- `src/components/ArrayVisualizer.jsx`, `src/components/ArrayBar.jsx`
- `src/components/GridVisualizer.jsx`, `src/components/GridCell.jsx`
- `src/components/SearchingCategoryVisualizer.jsx`
- `src/components/GraphVisualizer.jsx`
- `src/components/TreeVisualizer.jsx`
- `src/components/GraphAlgorithmCategoryVisualizer.jsx`
- `src/components/GraphAlgorithmMatrixVisualizer.jsx`

### Video export

- `src/video/useVideoExporter.js`, `src/video/AlgorithmVideo.jsx`
- Scenes: `SortingScene`, `PathfindingScene`, `SearchingVideoScene`, `GraphSearchingScene`, `TreeTraversalScene`, `GraphAlgorithmVideoScene`, `GraphAlgorithmScene`, `GraphAlgorithmMatrixScene`, `ComplexityScene`
- `src/video/ExportAudioTracks.jsx`, `src/video/VideoWatermarkOverlay.jsx`
- `src/video/exportLanguage.js`, `src/video/videoExportTheme.js`, `src/video/constants.js`
- `src/video/audio/buildExportSoundCues.js`, `src/video/audio/exportAudioAssets.js`
- Static export SFX: `public/video-export/sfx/` (regenerated via `pnpm run generate:export-sfx`)

### Python and pseudocode

- `src/hooks/usePythonExecution.js`
- `src/workers/pyodide.worker.js`
- `src/algorithms/python/**`, `src/algorithms/python/index.js`, `src/algorithms/python/testCases.js`
- `src/algorithms/pseudocode/**` — `strings.en.js`, `strings.fr.js`, `strings.ar.js`, `localize.js`, `index.js`

### Audio

- `src/utils/soundEvents.js`, `src/utils/soundManager.js`
- `src/utils/soundFrequencies.js`, `src/utils/toneInstrumentPresets.js`

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

### Build and test config

- `vite.config.js`, `vitest.config.js` (`@/` alias, jsdom, sequential forks for memory)
- `eslint.config.js`, `netlify.toml`
- `scripts/render-tone-export-sfx.mjs` — Playwright + Tone.Offline WAV generation

## Runtime Pattern

- `VisualizerApp` owns top-level UI state:
  - active category (`algorithmType`)
  - selected algorithm per category (`selectedAlgorithms`)
  - size state: `arraySize`, `gridSize`, `searchGraphNodeCount`, `treeNodeCount`, `graphNodeCount`
  - graph scenario selection for graph algorithms
  - sorting order (`SORT_ORDERS`)
  - speed, playback mode (`VISUALIZATION_MODES`), sound preference, full-screen state
  - export flow, lazy panel visibility (`PythonCodePanel`, `AlgorithmInsightPanel`)
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
- Node-link searching uses `DEFAULT_SEARCH_GRAPH_NODE_COUNT` and `SEARCH_GRAPH_NODE_COUNT`, separate from pathfinding grid size and graph-algorithm node count.
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
- Swipe stepping applies only in manual playback mode on touch devices.

## Sound And Export Notes

- Sound enable/disable UI lives in `src/components/ControlPanel.jsx`.
- Persisted sound preference and shared sound toggle state live in `src/pages/VisualizerApp.jsx` (`bayan-flow:sound-enabled`).
- Semantic sound event derivation lives in `src/utils/soundEvents.js`.
- Actual Tone.js playback state lives in the singleton `soundManager`.
- If you touch sound UX, keep the enabled state synchronized with `soundManager.getIsEnabled()` and local storage.
- Sound is visualization-only: do not add click, settings, panel, export-button, fullscreen, or regeneration sounds.
- Do not infer sound from localized `description` text. Use stable visual state or explicit semantic step metadata.
- `useVisualization` is responsible for emitting sound during intentional forward playback/manual stepping. Initial load, reset, step-back, algorithm changes, and passive regeneration should stay silent.
- `soundManager` should create Tone instruments lazily after sound is enabled, not at module import.
- Interactive playback and export audio should consume the same sound events so they do not drift.
- Pre-rendered export WAV assets live under `public/video-export/sfx/`; regenerate with `pnpm run generate:export-sfx` after changing instrument presets or event kinds.
- Graph algorithm and Floyd-Warshall matrix sound parity must cover both interactive visualization and Remotion export.
- Export uses `@remotion/web-renderer`, supports horizontal and vertical orientations, and renders MP4/H.264 when the browser supports it.
- `AlgorithmVideo` adds title, step counter, localized description, watermark, optional export audio, and final complexity scene.
- `buildExportSoundCues()` should schedule cues from `getSoundEventsForStep()` and must not special-case translated copy.
- Export descriptions use `resolveStepDescription()` and normalized export language (`exportLanguage.js`). Keep description keys localizable.

## CI, Deployment, And Build-Time Env

- CI (`.github/workflows/ci.yml`) on push/PR to `main` and `develop`:
  1. **Quality** — `pnpm lint`, `pnpm format:check`
  2. **Test** — `pnpm test:coverage` (Codecov upload, PR lcov comment)
  3. **Build** — `pnpm build` with `VITE_GIT_BRANCH`, `VITE_DEV_SITE_URL`
  4. **Deploy** — Netlify (`main` → production site, `develop` → dev site, PRs → preview)
- Netlify SPA redirects in `netlify.toml`; branch context sets `VITE_GIT_BRANCH`.
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
- Setup: `src/test/setup.js`.
- Fast targeted checks while iterating:
  - `pnpm vitest run src/registry/categoryConfig.test.js`
  - `pnpm vitest run src/registry/categoryRuntimeCompleteness.test.js`
  - `pnpm vitest run src/registry/visualizerRegistry.test.js`
  - `pnpm vitest run src/registry/extraVisualizerProps.test.js`
  - `pnpm vitest run src/registry/videoSceneRegistry.test.jsx`
  - `pnpm vitest run src/registry/complexityDatasetRegistry.test.js`
  - `pnpm vitest run src/registry/graphAlgorithmRegistry.test.js`
  - `pnpm vitest run src/registry/searchingSubstrate.test.js`
  - `pnpm vitest run src/components/SettingsPanel.test.jsx`
  - `pnpm vitest run src/components/ControlPanel.test.jsx`
  - `pnpm vitest run src/components/PythonCodePanel.test.jsx`
  - `pnpm vitest run src/pages/VisualizerApp.test.jsx`
  - `pnpm vitest run src/video/AlgorithmVideo.test.jsx`
  - `pnpm vitest run src/video/GraphAlgorithmVideoScene.test.jsx`
  - `pnpm vitest run src/video/GraphAlgorithmMatrixScene.test.jsx`
  - `pnpm vitest run src/hooks/useCategoryVisualizations.test.js`
  - `pnpm vitest run src/hooks/useVisualization.test.js`
  - `pnpm vitest run src/hooks/useGraphAlgorithmVisualization.test.js`
  - `pnpm vitest run src/utils/soundEvents.test.js`
  - `pnpm vitest run src/utils/soundManager.test.js`
  - `pnpm vitest run src/video/audio/buildExportSoundCues.test.js`
  - `pnpm vitest run src/algorithms/graphAlgorithm/*.test.js`
  - `pnpm vitest run src/algorithms/python/index.test.js`
  - `pnpm vitest run src/algorithms/pseudocode/index.test.js`
  - `pnpm vitest run src/constants/algorithmKnowledge.test.js`
- Before handing off a branch:
  - `pnpm test:run`
  - `pnpm build`
  - `pnpm lint`
  - `pnpm format:check`
- Use focused tests first for registry/category changes, then broaden to the full suite before handoff when the change touches shared runtime behavior.

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
