# AGENTS

## Project Snapshot

- Product: `Bayan Flow`
- App type: client-side React SPA with routes `/`, `/app`, `/roadmap`
- Version target in `package.json`: `0.5.0`
- Tooling: React 19, React Router 7, Vite, Tailwind CSS 4, Vitest, Framer Motion, Remotion, i18next, Tone.js, Pyodide
- Engines: Node `>=24.11.1`, pnpm `>=8.15.9`
- Contribution flow: PRs target `develop`, not `main`

## Source Of Truth

- Treat runtime registries and config files as the source of truth when docs drift:
  - `src/constants/index.js`
  - `src/registry/categoryConfig.js`
  - `src/registry/visualizerRegistry.js`
  - `src/registry/videoSceneRegistry.jsx`
  - `src/registry/complexityDatasetRegistry.js`
  - `src/config/algorithmConfig.js`
- `docs/ARCHITECTURE.md` and `README.md` are useful, but they can lag behind the live category/runtime wiring.

## Current Feature Surface

- Categories:
  - `sorting`
  - `pathfinding`
  - `searching`
  - `treeTraversal`
  - `graphAlgorithm`
- Searching is split across two substrates:
  - array-based search visualizations
  - node-link graph search visualizations
- Graph algorithms currently include:
  - `topologicalSort`
  - `kahnAlgorithm`
  - `kruskalAlgorithm`
  - `primAlgorithm`
  - `tarjanAlgorithm`
  - `kosarajuAlgorithm`
  - `floydWarshallAlgorithm`
- Exported video supports all categories.
- Python code execution and test cases run client-side through Pyodide in a worker.

## Architecture Map

- App entry and providers:
  - `src/main.jsx`
  - `src/contexts/ThemeContext.jsx`
  - `src/i18n/index.js`
- Pages:
  - `src/pages/LandingPage.jsx`
  - `src/pages/VisualizerApp.jsx`
  - `src/pages/Roadmap.jsx`
- Category registry and runtime wiring:
  - `src/registry/categoryConfig.js`
  - `src/config/algorithmConfig.js`
  - `src/hooks/useCategoryVisualizations.js`
  - `src/registry/visualizerRegistry.js`
  - `src/registry/extraVisualizerProps.js`
  - `src/registry/videoSceneRegistry.jsx`
  - `src/registry/complexityDatasetRegistry.js`
- Shared playback engine:
  - `src/hooks/useVisualization.js`
- Category hooks:
  - `src/hooks/useSortingVisualization.js`
  - `src/hooks/usePathfindingVisualization.js`
  - `src/hooks/useSearchingVisualization.js`
  - `src/hooks/useTreeTraversalVisualization.js`
  - `src/hooks/useGraphAlgorithmVisualization.js`
- Main UI surfaces:
  - `src/components/SettingsPanel.jsx`
  - `src/components/ControlPanel.jsx`
  - `src/components/ComplexityPanel.jsx`
  - `src/components/PythonCodePanel.jsx`
  - `src/components/ExportProgressModal.jsx`
- Visualizers:
  - `src/components/ArrayVisualizer.jsx`
  - `src/components/GridVisualizer.jsx`
  - `src/components/SearchingCategoryVisualizer.jsx`
  - `src/components/TreeVisualizer.jsx`
  - `src/components/GraphVisualizer.jsx`
  - `src/components/GraphAlgorithmCategoryVisualizer.jsx`
  - `src/components/GraphAlgorithmMatrixVisualizer.jsx`
- Video export:
  - `src/video/useVideoExporter.js`
  - `src/video/AlgorithmVideo.jsx`
  - `src/video/SortingScene.jsx`
  - `src/video/PathfindingScene.jsx`
  - `src/video/SearchingVideoScene.jsx`
  - `src/video/TreeTraversalScene.jsx`
  - `src/video/GraphAlgorithmVideoScene.jsx`
  - `src/video/GraphAlgorithmScene.jsx`
  - `src/video/GraphAlgorithmMatrixScene.jsx`
- Python execution:
  - `src/hooks/usePythonExecution.js`
  - `src/workers/pyodide.worker.js`
  - `src/algorithms/python/**`
- Audio:
  - `src/utils/soundManager.js`
  - `src/utils/soundFrequencies.js`
  - `src/utils/toneInstrumentPresets.js`

## Runtime Pattern

- `VisualizerApp` owns top-level UI state such as category, selected algorithm per category, sizing controls, playback mode, export flow, and panel visibility.
- `CATEGORY_CONFIG` is the central registry for:
  - default algorithm
  - translation prefix
  - category tab label
  - icon
  - algorithm lookup
  - data generation
  - size control metadata
  - grouped dropdown definitions
  - complexity dataset key
- `useAlgorithmConfig()` derives translated dropdown data from `CATEGORY_CONFIG`.
- Each category hook computes steps and runtime state, then `useCategoryVisualizations()` exposes them as a map keyed by `ALGORITHM_TYPES`.
- `VISUALIZER_REGISTRY` selects the interactive renderer.
- `VIDEO_SCENE_RENDERERS` selects the Remotion scene.
- `COMPLEXITY_DATASETS` must stay aligned with `CATEGORY_CONFIG[category].complexityDataset`.

## Category-Specific Contracts

### Searching substrate contract

- Source of truth: `src/registry/searchingSubstrate.js`
- Array search algorithms use `ArrayVisualizer`.
- Node-link search algorithms use `GraphVisualizer`.
- Do not special-case searching substrate in unrelated components; branch through `getSearchingSubstrate()` / `isNodeLinkSearchingAlgorithm()`.

### Graph algorithm contract

- Registry: `src/registry/graphAlgorithmRegistry.js`
- Input shape for node-link graph algorithms:
  - `{ nodes, edges, adjacency, directed, weighted }`
- Step shape for node-link graph algorithms:
  - `{ nodes, edges, nodeStates, edgeStates, stackOrder, outputOrder, graphArtifacts, description, representation, directed, weighted }`
- Step shape for matrix graph algorithms:
  - `{ matrix, description, representation, directed, weighted, graphArtifacts }`
- `matrix` shape:
  - `{ rowLabels, columnLabels, cells, cellStates }`
- Use:
  - `GRAPH_REPRESENTATIONS.NODE_LINK` for graph drawings
  - `GRAPH_REPRESENTATIONS.MATRIX` for matrix algorithms like Floyd-Warshall
- Keep graph algorithms deterministic where tests depend on ordering:
  - sort node ids
  - sort equal-weight ties explicitly
- Preset scenarios are fixed datasets. When a scenario is selected, UI must not imply that `graphNodeCount` still changes the active graph.

## Visualizer UX Rules

- Preserve the existing registry-driven architecture. Prefer extending config/registry files over adding special-case branches in `VisualizerApp`.
- Completion UX should preserve the final visualization state briefly before showing `ComplexityPanel`.
- Graph algorithm parity must cover both:
  - interactive visualization
  - Remotion export
- Floyd-Warshall is the matrix-path exception and must remain aligned across:
  - `GraphAlgorithmCategoryVisualizer`
  - `GraphAlgorithmVideoScene`
  - `GraphAlgorithmMatrixScene`
- User-facing category labels are reused in multiple places. If you rename one, audit:
  - `src/i18n/locales/en/translation.json`
  - `src/i18n/locales/fr/translation.json`
  - `src/i18n/locales/ar/translation.json`
  - `src/registry/videoSceneRegistry.jsx`
  - landing/roadmap/README copy that mentions the category by name

## Sound Notes

- Sound enable/disable UI currently lives in `src/components/ControlPanel.jsx`.
- Persisted sound preference and shared sound toggle state live in `src/pages/VisualizerApp.jsx`.
- Actual audio state lives in the singleton `soundManager`.
- If you touch sound UX, prefer lifting the enabled state into shared app state or exposing a reliable source of truth from `soundManager`.
- Avoid duplicating sound effects across nested handlers; centralize the trigger in one layer per action.

## Control Panel Notes

- The shared regenerate action is category-neutral and should stay described as input regeneration, not array regeneration.
- The shared control uses `Generate New Input` copy and a refresh-style icon because the same action regenerates arrays, grids, trees, and graphs depending on the active category.

## Adding Or Changing A Category

1. Add/update the category key in `src/constants/index.js`.
2. Add/update the `CATEGORY_CONFIG` entry in `src/registry/categoryConfig.js`.
3. Wire the hook in `src/pages/VisualizerApp.jsx`.
4. Add the hook result in `src/hooks/useCategoryVisualizations.js`.
5. Register the visualizer in `src/registry/visualizerRegistry.js`.
6. Register extra props in `src/registry/extraVisualizerProps.js`.
7. Register the Remotion scene in `src/registry/videoSceneRegistry.jsx`.
8. Ensure `src/registry/complexityDatasetRegistry.js` contains the dataset key.
9. Add translations and tests.

## Adding A New Graph Algorithm

1. Add the algorithm implementation in `src/algorithms/graphAlgorithm/`.
2. Export it from `src/algorithms/graphAlgorithm/index.js`.
3. Register its profile in `src/registry/graphAlgorithmRegistry.js`.
4. Add its constant and complexity entry in `src/constants/index.js`.
5. Add insight metadata in `src/constants/algorithmKnowledge.js`.
6. Add i18n entries in all three locale files.
7. Add pseudocode in:
  - `src/algorithms/pseudocode/strings.en.js`
  - `src/algorithms/pseudocode/strings.fr.js`
  - `src/algorithms/pseudocode/strings.ar.js`
8. Add Python code in `src/algorithms/python/` and register it in `src/algorithms/python/index.js`.
9. Add Python test cases in `src/algorithms/python/testCases.js`.
10. Add or extend tests for algorithm logic, registry wiring, hook behavior, visualizers, export scenes, Python index, complexity metadata, and insight metadata.

## Testing Workflow

- Fast targeted checks while iterating:
  - `pnpm vitest run src/registry/categoryConfig.test.js`
  - `pnpm vitest run src/registry/categoryRuntimeCompleteness.test.js`
  - `pnpm vitest run src/components/SettingsPanel.test.jsx`
  - `pnpm vitest run src/components/ControlPanel.test.jsx`
  - `pnpm vitest run src/video/GraphAlgorithmVideoScene.test.jsx`
  - `pnpm vitest run src/video/GraphAlgorithmMatrixScene.test.jsx`
  - `pnpm vitest run src/hooks/useGraphAlgorithmVisualization.test.js`
  - `pnpm vitest run src/algorithms/graphAlgorithm/*.test.js`
  - `pnpm vitest run src/algorithms/python/index.test.js`
  - `pnpm vitest run src/constants/algorithmKnowledge.test.js`
- Before handing off a branch:
  - `pnpm test:run`
  - `pnpm build`
  - `pnpm lint`

## Workflow Rules For This Repo

- Do not rewrite user-authored changes.
- Keep shared registries synchronized; this codebase relies on configuration completeness more than ad hoc branching.
- When changing a user-facing label or category concept, audit all locales and export fallbacks, not just the visible screen you touched.
- When changing graph algorithms, keep JS logic, UI, export, i18n, Python snippets, and tests category-consistent.
- For net-new graph algorithms, keep commits scoped to one completed algorithm at a time.
- If a shared helper is required, add it in the earliest commit that needs it.
