# AGENTS

## Project Snapshot

- App type: client-side React SPA with routes `/`, `/app`, `/roadmap`
- Tooling: Vite, Tailwind CSS 4, Vitest, Remotion, i18next, Pyodide
- Algorithm categories: `sorting`, `pathfinding`, `searching`, `treeTraversal`, `graphAlgorithm`
- Current branch focus: stabilize and polish the implemented `graphAlgorithm` category for the 0.5.0 line

## Architecture Map

- Category registry: `src/registry/categoryConfig.js`
- Graph algorithm registry: `src/registry/graphAlgorithmRegistry.js`
- Visualizer registry: `src/registry/visualizerRegistry.js`
- Extra visualizer props: `src/registry/extraVisualizerProps.js`
- Video scene registry: `src/registry/videoSceneRegistry.jsx`
- Main page orchestration: `src/pages/VisualizerApp.jsx`
- Graph input generators: `src/utils/graphAlgorithmGenerators.js`
- Graph preset scenarios: `src/utils/graphTestScenarios.js`

- Category hooks:
  - `src/hooks/useSortingVisualization.js`
  - `src/hooks/usePathfindingVisualization.js`
  - `src/hooks/useSearchingVisualization.js`
  - `src/hooks/useTreeTraversalVisualization.js`
  - `src/hooks/useGraphAlgorithmVisualization.js`

- Visualizer components:
  - `src/components/ArrayVisualizer.jsx`
  - `src/components/GridVisualizer.jsx`
  - `src/components/SearchingCategoryVisualizer.jsx`
  - `src/components/TreeVisualizer.jsx`
  - `src/components/GraphVisualizer.jsx`
  - `src/components/GraphAlgorithmCategoryVisualizer.jsx`
  - `src/components/GraphAlgorithmMatrixVisualizer.jsx`

- Graph algorithm video scenes:
  - `src/video/GraphAlgorithmVideoScene.jsx`
  - `src/video/GraphAlgorithmScene.jsx`
  - `src/video/GraphAlgorithmMatrixScene.jsx`

- Algorithm sources:
  - JS visualization + pure functions: `src/algorithms/**`
  - Python sources: `src/algorithms/python/**`
  - Pseudocode sources: `src/algorithms/pseudocode/**`

- Metadata and content:
  - Complexity metadata: `src/constants/index.js`
  - Insight metadata: `src/constants/algorithmKnowledge.js`
  - UI translations: `src/i18n/locales/en/translation.json`, `fr/translation.json`, `ar/translation.json`

## Graph Algorithm Contract

- Node-link graph input shape:
  - `{ nodes, edges, adjacency, directed, weighted }`
- Node-link step shape:
  - `{ nodes, edges, nodeStates, edgeStates, stackOrder, outputOrder, graphArtifacts, description, representation, directed, weighted }`
- Matrix step shape:
  - `{ matrix, description, representation, directed, weighted }`
  - `matrix` is `{ rowLabels, columnLabels, cells, cellStates }`
- Use `GRAPH_REPRESENTATIONS.NODE_LINK` for graph drawings and `GRAPH_REPRESENTATIONS.MATRIX` for matrix algorithms such as Floyd-Warshall.
- Keep algorithm functions deterministic where tests depend on ordering. Sort node ids and equal-weight ties explicitly.
- Preset graph scenarios are fixed datasets; when a scenario is selected, UI controls should not imply that `graphNodeCount` still changes the active graph.

## Adding A New Algorithm

1. Add the algorithm implementation in `src/algorithms/graphAlgorithm/`.
2. Export it from `src/algorithms/graphAlgorithm/index.js`.
3. Register its profile in `src/registry/graphAlgorithmRegistry.js`.
4. Add its constant and complexity entry in `src/constants/index.js`.
5. Add insight metadata in `src/constants/algorithmKnowledge.js`.
6. Add i18n entries in all three locale files.
7. Add pseudocode in `src/algorithms/pseudocode/strings.en.js`, `strings.fr.js`, `strings.ar.js`.
8. Add Python code in `src/algorithms/python/` and register it in `src/algorithms/python/index.js`.
9. Add Python test cases in `src/algorithms/python/testCases.js`.
10. Add or extend tests for algorithm logic, graph hook behavior, registry wiring, pseudocode, Python index, and insight metadata.

## Testing Workflow

- Fast targeted checks while iterating:
  - `pnpm vitest run src/algorithms/graphAlgorithm/*.test.js`
  - `pnpm vitest run src/registry/graphAlgorithmRegistry.test.js`
  - `pnpm vitest run src/hooks/useGraphAlgorithmVisualization.test.js`
  - `pnpm vitest run src/components/GraphAlgorithmCategoryVisualizer.test.jsx`
  - `pnpm vitest run src/video/GraphAlgorithmVideoScene.test.jsx`
  - `pnpm vitest run src/algorithms/python/index.test.js`
  - `pnpm vitest run src/constants/algorithmKnowledge.test.js`

- Before handing off a branch:
  - `pnpm test:run`
  - `pnpm build`

## Current Review Notes

- Floyd-Warshall uses the matrix visualizer and matrix Remotion scene, so parity checks with node-link graph algorithms must include both interactive UI and export paths.
- Completion UX should preserve the final algorithm state briefly before showing complexity analysis; do not swap to `ComplexityPanel` immediately on completion.
- Export theme handling must stay aligned between `GraphAlgorithmScene` and `GraphAlgorithmMatrixScene`.
- Preset scenario UX should stay truthful about fixed node counts and other locked graph properties.

## Workflow Rules For This Repo

- Do not rewrite user-authored changes.
- Prefer extending the existing registry-driven architecture over special-case logic in `VisualizerApp`.
- Keep graph algorithm changes category-consistent across JS logic, UI, Remotion export, i18n, Python snippets, and tests when the touched behavior spans those surfaces.
- For net-new graph algorithms, keep commits scoped to one completed algorithm at a time.
- A completed algorithm addition must include:
  - JS implementation
  - registry wiring
  - translations
  - complexity and insight metadata
  - pseudocode
  - Python implementation and test cases
  - tests
- If a shared helper is required, add it in the earliest algorithm commit that needs it.
