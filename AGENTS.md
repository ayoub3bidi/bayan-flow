# AGENTS

## Project Snapshot

- Product: `Bayan Flow`
- Package name: `bayan-flow`
- App type: client-side React SPA with routes `/`, `/app`, `/roadmap`
- Version target in `package.json`: `0.5.0`
- License: `Elastic-2.0 OR Commercial`
- Repository/homepage: `https://github.com/ayoub3bidi/bayan-flow`, `https://bayanflow.netlify.app`
- Tooling: React 19, React Router 7, Rolldown Vite 7, Tailwind CSS 4, Vitest 3, React Testing Library, Framer Motion, Remotion 4, i18next, Monaco Editor, Tone.js, D3, Octokit, Playwright
- Python execution: Pyodide `0.27.5` loaded client-side in a worker
- Engines: Node `>=24.11.1`, pnpm `>=8.15.9`
- Contribution flow: PRs target `develop`, not `main`

## Source Of Truth

- Treat runtime registries and config files as the source of truth when docs drift:
  - `src/constants/index.js`
  - `src/registry/categoryConfig.js`
  - `src/registry/visualizerRegistry.js`
  - `src/registry/extraVisualizerProps.js`
  - `src/registry/videoSceneRegistry.jsx`
  - `src/registry/complexityDatasetRegistry.js`
  - `src/registry/searchingSubstrate.js`
  - `src/registry/graphAlgorithmRegistry.js`
  - `src/config/algorithmConfig.js`
  - `src/config/settingsConfig.js`
- `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, and `README.md` are useful, but they can lag behind the live category/runtime wiring.
- Runtime completeness tests are important because the app depends heavily on synchronized registries.

## Current Feature Surface

- Categories:
  - `sorting`
  - `pathfinding`
  - `searching`
  - `treeTraversal`
  - `graphAlgorithm`
- Sorting algorithms:
  - `bubbleSort`
  - `quickSort`
  - `mergeSort`
  - `selectionSort`
  - `insertionSort`
  - `heapSort`
  - `shellSort`
  - `radixSort`
  - `countingSort`
  - `bucketSort`
  - `cycleSort`
  - `combSort`
  - `timSort`
  - `bogoSort`
- Pathfinding algorithms:
  - `bfs`
  - `dijkstra`
  - `aStar`
  - `bidirectionalSearch`
  - `greedyBestFirstSearch`
  - `jumpPointSearch`
  - `bellmanFord`
  - `idaStar`
  - `dStarLite`
- Searching algorithms:
  - array substrate: `linearSearch`, `binarySearch`, `ternarySearch`, `jumpSearch`, `interpolationSearch`, `exponentialSearch`, `fibonacciSearch`
  - node-link substrate: `depthFirstSearch`, `breadthFirstSearchGraph`
- Tree traversal algorithms:
  - `inorderTraversal`
  - `preorderTraversal`
  - `postorderTraversal`
  - `levelOrderTraversal`
  - `zigzagLevelOrderTraversal`
  - `morrisTraversal`
- Graph algorithms:
  - `topologicalSort`
  - `kahnAlgorithm`
  - `kruskalAlgorithm`
  - `primAlgorithm`
  - `tarjanAlgorithm`
  - `kosarajuAlgorithm`
  - `floydWarshallAlgorithm`
- Exported video supports all categories and includes a complexity segment.
- Python code, pseudocode, editable custom test cases, and predefined tests are available from `PythonCodePanel`.
- Algorithm insight metadata lives in `src/constants/algorithmKnowledge.js`; translated insight copy lives in locale files.
- Audio exists in interactive playback and export audio cue generation.

## Architecture Map

- App entry and providers:
  - `src/main.jsx`
  - `src/contexts/ThemeContext.jsx`
  - `src/contexts/ThemeContextDefinition.js`
  - `src/i18n/index.js`
- Pages:
  - `src/pages/LandingPage.jsx`
  - `src/pages/VisualizerApp.jsx`
  - `src/pages/Roadmap.jsx`
- Category registry and runtime wiring:
  - `src/registry/categoryConfig.js`
  - `src/config/algorithmConfig.js`
  - `src/config/settingsConfig.js`
  - `src/hooks/useCategoryVisualizations.js`
  - `src/registry/visualizerRegistry.js`
  - `src/registry/extraVisualizerProps.js`
  - `src/registry/videoSceneRegistry.jsx`
  - `src/registry/complexityDatasetRegistry.js`
- Category hooks:
  - `src/hooks/useSortingVisualization.js`
  - `src/hooks/usePathfindingVisualization.js`
  - `src/hooks/useSearchingVisualization.js`
  - `src/hooks/useTreeTraversalVisualization.js`
  - `src/hooks/useGraphAlgorithmVisualization.js`
- Shared playback engine:
  - `src/hooks/useVisualization.js`
- Main UI surfaces:
  - `src/components/Header.jsx`
  - `src/components/Footer.jsx`
  - `src/components/SettingsPanel.jsx`
  - `src/components/ControlPanel.jsx`
  - `src/components/ComplexityPanel.jsx`
  - `src/components/FloatingActionButton.jsx`
  - `src/components/InsightFloatingActionButton.jsx`
  - `src/components/PythonCodePanel.jsx`
  - `src/components/AlgorithmInsightPanel.jsx`
  - `src/components/ExportProgressModal.jsx`
  - `src/components/OutputConsole.jsx`
  - `src/components/TestCasesPanel.jsx`
- Visualizers:
  - `src/components/ArrayVisualizer.jsx`
  - `src/components/GridVisualizer.jsx`
  - `src/components/SearchingCategoryVisualizer.jsx`
  - `src/components/GraphVisualizer.jsx`
  - `src/components/TreeVisualizer.jsx`
  - `src/components/GraphAlgorithmCategoryVisualizer.jsx`
  - `src/components/GraphAlgorithmMatrixVisualizer.jsx`
- Video export:
  - `src/video/useVideoExporter.js`
  - `src/video/AlgorithmVideo.jsx`
  - `src/video/SortingScene.jsx`
  - `src/video/PathfindingScene.jsx`
  - `src/video/SearchingVideoScene.jsx`
  - `src/video/GraphSearchingScene.jsx`
  - `src/video/TreeTraversalScene.jsx`
  - `src/video/GraphAlgorithmVideoScene.jsx`
  - `src/video/GraphAlgorithmScene.jsx`
  - `src/video/GraphAlgorithmMatrixScene.jsx`
  - `src/video/ComplexityScene.jsx`
  - `src/video/ExportAudioTracks.jsx`
  - `src/video/audio/buildExportSoundCues.js`
  - `src/video/audio/exportAudioAssets.js`
- Python and pseudocode:
  - `src/hooks/usePythonExecution.js`
  - `src/workers/pyodide.worker.js`
  - `src/algorithms/python/**`
  - `src/algorithms/pseudocode/**`
- Audio:
  - `src/utils/soundEvents.js`
  - `src/utils/soundManager.js`
  - `src/utils/soundFrequencies.js`
  - `src/utils/toneInstrumentPresets.js`
- Utility generators and helpers:
  - `src/utils/arrayHelpers.js`
  - `src/utils/gridHelpers.js`
  - `src/utils/treeGenerators.js`
  - `src/utils/graphSearchGenerators.js`
  - `src/utils/graphAlgorithmGenerators.js`
  - `src/utils/graphTestScenarios.js`
  - `src/utils/graphMatrixLayout.js`
  - `src/utils/resolveStepDescription.js`
  - `src/utils/pseudocodeHighlight.js`

## Runtime Pattern

- `VisualizerApp` owns top-level UI state: active category, selected algorithm per category, array/grid/tree/search-graph/graph sizes, graph scenario, sorting order, speed, playback mode, sound preference, full-screen state, export flow, and lazy panels.
- All category hooks are called unconditionally in `VisualizerApp` to preserve React Rules of Hooks.
- `CATEGORY_CONFIG` is the central registry for:
  - default algorithm
  - translation prefix
  - category tab label
  - icon
  - size binding
  - algorithm lookup
  - data generation
  - feature flags
  - size control metadata
  - grouped dropdown definitions
  - complexity dataset key
- `useAlgorithmConfig()` derives translated dropdown data from `CATEGORY_CONFIG`.
- Each category hook computes steps and runtime state, then `useCategoryVisualizations()` exposes them as a map keyed by `ALGORITHM_TYPES`.
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
- Input shape for node-link graph algorithms:
  - `{ nodes, edges, adjacency, directed, weighted }`
- Step shape for node-link graph algorithms:
  - `{ nodes, edges, nodeStates, edgeStates, stackOrder, outputOrder, graphArtifacts, description, representation, directed, weighted }`
- Step shape for matrix graph algorithms:
  - `{ matrix, description, representation, directed, weighted, graphArtifacts }`
- `matrix` shape:
  - `{ rowLabels, columnLabels, cells, cellStates }`
- Floyd-Warshall is the matrix-path exception and has a smaller max node-count range.
- Graph profiles define directed/weighted flags, representation, scenario support, and deterministic input generation strategy.
- Keep graph algorithms deterministic where tests depend on ordering:
  - sort node ids
  - sort equal-weight ties explicitly
  - preserve stable traversal/edge ordering when adding scenarios
- Preset scenarios are fixed datasets. When a scenario is selected, UI must not imply that `graphNodeCount` still changes the active graph.

### Pathfinding Contract

- Pathfinding algorithms operate on grid steps and are rendered by `GridVisualizer` / `PathfindingScene`.
- `CATEGORY_CONFIG[PATHFINDING].generateData()` creates an empty grid template; randomized start/end and walls are owned by `usePathfindingVisualization`.
- `gridSize` uses named presets from `GRID_SIZES`, not the array-size slider.

### Tree Traversal Contract

- Tree traversal data comes from `generateTreeForTraversal()`.
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

## Sound And Export Notes

- Sound enable/disable UI lives in `src/components/ControlPanel.jsx`.
- Persisted sound preference and shared sound toggle state live in `src/pages/VisualizerApp.jsx`.
- Semantic sound event derivation lives in `src/utils/soundEvents.js`.
- Actual Tone.js playback state lives in the singleton `soundManager`.
- If you touch sound UX, keep the enabled state synchronized with `soundManager.getIsEnabled()` and local storage.
- Sound is visualization-only: do not add click, settings, panel, export-button, fullscreen, or regeneration sounds.
- Do not infer sound from localized `description` text. Use stable visual state or explicit semantic step metadata.
- `useVisualization` is responsible for emitting sound during intentional forward playback/manual stepping. Initial load, reset, step-back, algorithm changes, and passive regeneration should stay silent.
- `soundManager` should create Tone instruments lazily after sound is enabled, not at module import.
- Interactive playback and export audio should consume the same sound events so they do not drift.
- Graph algorithm and Floyd-Warshall matrix sound parity must cover both interactive visualization and Remotion export.
- Export uses `@remotion/web-renderer`, supports horizontal and vertical orientations, and renders MP4/H.264 when the browser supports it.
- `AlgorithmVideo` adds title, step counter, localized description, watermark, optional export audio, and final complexity scene.
- `buildExportSoundCues()` should schedule cues from `getSoundEventsForStep()` and must not special-case translated copy.
- Export descriptions use `resolveStepDescription()` and normalized export language. Keep description keys localizable.

## Adding Or Changing A Category

1. Add/update the category key in `src/constants/index.js`.
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
4. Add insight metadata in `src/constants/algorithmKnowledge.js`.
5. Add i18n entries in all three locale files.
6. Add pseudocode in all three pseudocode string files.
7. Add Python code in `src/algorithms/python/` and register it in `src/algorithms/python/index.js`.
8. Add Python test cases in `src/algorithms/python/testCases.js`.
9. Add/update semantic sound-event coverage in `src/utils/soundEvents.js` when the algorithm introduces new visual action states.
10. Add or extend tests for algorithm logic, registry wiring, hook behavior, visualizers, export scenes, Python index, complexity metadata, pseudocode, sound events, and insight metadata.

## Adding A New Graph Algorithm

1. Add the algorithm implementation in `src/algorithms/graphAlgorithm/`.
2. Export it from `src/algorithms/graphAlgorithm/index.js`.
3. Register its profile in `src/registry/graphAlgorithmRegistry.js`.
4. Add its constant and complexity entry in `src/constants/index.js`.
5. Add insight metadata in `src/constants/algorithmKnowledge.js`.
6. Add i18n entries in all three locale files.
7. Add pseudocode in all three pseudocode string files.
8. Add Python code in `src/algorithms/python/` and register it in `src/algorithms/python/index.js`.
9. Add Python test cases in `src/algorithms/python/testCases.js`.
10. Add/update graph or matrix sound-event coverage in `src/utils/soundEvents.js`.
11. Add or extend tests for JS logic, graph profile/scenario wiring, hook behavior, visualizers, export scenes, Python index, complexity metadata, pseudocode, sound events, and insight metadata.

## Testing Workflow

- Current test surface is broad; there are roughly one hundred `*.test.js` / `*.test.jsx` files under `src`.
- Fast targeted checks while iterating:
  - `pnpm vitest run src/registry/categoryConfig.test.js`
  - `pnpm vitest run src/registry/categoryRuntimeCompleteness.test.js`
  - `pnpm vitest run src/registry/visualizerRegistry.test.js`
  - `pnpm vitest run src/registry/extraVisualizerProps.test.js`
  - `pnpm vitest run src/registry/videoSceneRegistry.test.jsx`
  - `pnpm vitest run src/registry/complexityDatasetRegistry.test.js`
  - `pnpm vitest run src/components/SettingsPanel.test.jsx`
  - `pnpm vitest run src/components/ControlPanel.test.jsx`
  - `pnpm vitest run src/components/PythonCodePanel.test.jsx`
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
