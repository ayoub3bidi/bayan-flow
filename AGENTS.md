# AGENTS

> Algorithm inventories, architecture map, and full test command catalog: [`docs/AGENTS_REFERENCE.md`](docs/AGENTS_REFERENCE.md)
>
> **Doc maintenance:** When counts, file paths, or test commands change, update the reference doc only. Update this file only for new non-negotiable rules or contracts.

## Project Snapshot

- Product: **Bayan Flow** · client-side React SPA (`/`, `/app`, `/roadmap`)
- Repo: `https://github.com/ayoub3bidi/bayan-flow` · prod `main` → bayanflow.com · dev `develop` → dev.bayanflow.com
- Tooling: React 19, Vite 7, Tailwind 4, Vitest 3, Remotion 4, i18next (en/fr/ar RTL), Pyodide 0.27.5 in worker
- Engines: Node `>=24.11.1`, pnpm `>=8.15.9` · alias `@/` → `src/`
- **PRs target `develop`**, not `main` (gated by `ensure-pr-source-develop.yml`)

## Source Of Truth (registries)

When docs drift, trust runtime config:

- `src/constants/index.js` — categories, algorithm keys, complexity, visual enums
- `src/registry/categoryConfig.js` — category wiring, groups, size controls
- `src/registry/visualizerRegistry.js`, `extraVisualizerProps.js`, `videoSceneRegistry.jsx`
- `src/registry/complexityDatasetRegistry.js`, `searchingSubstrate.js`, `graphAlgorithmRegistry.js`
- `src/config/algorithmConfig.js`, `settingsConfig.js`
- `categoryRuntimeCompleteness.test.js` must stay green when registries change

## Category contracts (non-negotiable)

- **Searching:** array vs node-link via `getSearchingSubstrate()` — do not special-case elsewhere
- **Graph algorithms:** node-link vs matrix profiles; Floyd-Warshall matrix max 6 nodes; scenarios from `graphTestScenarios.js`
- **Pathfinding:** grid steps; walls/start/end in `usePathfindingVisualization`
- **Tree:** `generateTreeForTraversal()`; `treeNodeCount` 3–31
- **Sound:** semantic events in `soundEvents.js` only — not from localized descriptions; visualization-only (no UI click sounds)
- **Export:** interactive + Remotion parity; `buildExportSoundCues()` from same sound events

## Visualizer UX

- Registry-driven architecture — extend config/registries, not `VisualizerApp` one-offs
- Completion: brief final state before `ComplexityPanel`
- Regenerate control is category-neutral ("Generate New Input")
- Sorting only category with sort-order controls
- Lazy panels (`PythonCodePanel`, `AlgorithmInsightPanel`) stay optional overlays

## Ship It test ladder

| Phase | Command |
|-------|---------|
| Iterate | `pnpm vitest run <touched tests>` |
| Gate | `pnpm lint` → `pnpm format:check` → `pnpm test:coverage` → `pnpm build` |

Follow `~/.cursor/skills/ship-it/SKILL.md` when user says "ship it".

## i18n / user-facing changes

Audit all three locales + pseudocode strings + export fallbacks when renaming categories or algorithms. Arabic is RTL — check app UI and Remotion export.

## Adding algorithms or categories

See reference doc for full checklists (JS, Python, pseudocode, sound, insight, tests, registries). Keep graph algorithm commits scoped to one algorithm when possible.

## Workflow rules

- Minimal diff; no unrelated edits; preserve user-authored changes
- Sync registries across JS, Python, pseudocode, sound, export, and tests
- Run focused tests while iterating; full gate before Ship It handoff
