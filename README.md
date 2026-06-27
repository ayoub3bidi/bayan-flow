# Bayan Flow

<p align="center">
    <img src="./public/logo-white.png" alt="Bayan Flow Logo" width="120"/> <br/>
    <strong>Learn algorithms with clarity through interactive, real-time visualizations</strong><br/>
    <em>Bayan (بيان) means clarity in Arabic</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-Elastic--2.0-blue" alt="License" />
</p>

> **License**: Elastic License 2.0 OR Commercial — see [LICENSE](./LICENSE) and [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md)

**Live sites**

- **Production** (`main`): [bayanflow.com](https://bayanflow.com)
- **Dev** (`develop`): [dev.bayanflow.com](https://dev.bayanflow.com)

## What it is

Bayan Flow is a an open source educational tool with **45 algorithms** across five categories. Choose an algorithm and step through or autoplay the visualization. Optional **Python** implementations run in the browser (Pyodide `0.27.5`), with a **complexity** panel after completion and **video export** (horizontal or vertical MP4) when you want to share or study offline.

## Features (overview)

| Mode                 | Algorithms | What you get |
| -------------------- | ---------- | ------------ |
| **Sorting**          | 14         | Random array, color-coded bars, ascending/descending order, comparison and non-comparison families |
| **Pathfinding**      | 9          | Grid-based search on configurable presets; start/end, walls, open/closed/path highlighting |
| **Searching**        | 9          | **Array** search on sorted data (linear through Fibonacci) with target highlighting; **node–link graph** search (DFS, BFS-on-graph)—separate from the pathfinding grid |
| **Tree Traversals**  | 6          | Binary-tree traversals with visit order, queue/stack context, and Morris in-place walk |
| **Graph Algorithms** | 7          | Node–link and matrix views: topological sort, MST (Kruskal/Prim), SCC (Tarjan/Kosaraju), Floyd–Warshall; preset scenarios for edge cases |

**Shared**

- Manual vs autoplay, four speed presets, mobile swipe (manual), fullscreen, optional visualization sound
- Python editor + run, built-in and custom test cases, pseudocode, algorithm insight panel
- Internationalization (English, French, Arabic with RTL), light/dark theme
- In-browser video export with orientation choice, watermark, optional export audio, and a complexity segment at the end
- Landing page with live GitHub stats; public roadmap timeline

Details, stack notes, registry wiring, and contributor workflows live in the docs linked below—not duplicated here.

## Quick start

**Requirements:** match the **`engines`** field in [package.json](./package.json) (Node and pnpm).

```bash
git clone https://github.com/ayoub3bidi/bayan-flow.git
cd bayan-flow
pnpm install
pnpm dev
```

Then open the local URL printed in the terminal.

## Documentation

| Doc                                                | Use it when you…                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| **[AGENTS.md](./AGENTS.md)**                             | Lean agent guide: registries, contracts, ship-it ladder             |
| **[docs/AGENTS_REFERENCE.md](./docs/AGENTS_REFERENCE.md)** | Full agent lookup: inventories, architecture map, test catalog, checklists |
| **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)**   | Run lint/tests/build, follow patterns, add an algorithm or language |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Understand routes, hooks, data flow, video export, testing layout   |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)**           | Contribute: branch targets `develop`, CI, PR template, standards    |

## Contributing

Pull requests should target **`develop`**, not `main`. Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** and use **[.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md)** when you open a PR.

## License

Dual-licensed under **[Elastic License 2.0](./LICENSE)** (see file for terms) and a **commercial** option for hosted or OEM use — **[COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md)**. The Bayan Flow name and logo are covered in **[TRADEMARK.md](./TRADEMARK.md)**.
