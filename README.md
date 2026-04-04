# Bayan Flow

<p align="center">
    <img src="./logo.png" alt="Bayan Flow Logo" width="120"/> <br/>
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

- **Production** (`main`): [bayanflow.netlify.app](https://bayanflow.netlify.app)
- **Dev** (`develop`): [dev-bayanflow.netlify.app](https://dev-bayanflow.netlify.app)

## What it is

Bayan Flow is a client-side SPA: pick a **mode** (sorting, pathfinding, or searching), choose an algorithm, then step through or autoplay the visualization. Optional **Python** implementations run in the browser (Pyodide), with a **complexity** panel and **video export** (including horizontal and vertical layouts) when you want to share or study offline.

## Features (overview)

| Mode | What you get |
|------|----------------|
| **Sorting** | A broad set of sorting algorithms on a configurable random array, color-coded bars, manual or autoplay |
| **Pathfinding** | Multiple grid-based algorithms, configurable grid sizes, start/end positions, step-by-step exploration |
| **Searching** | **Array** algorithms on sorted data (e.g. binary search) with bar visualization and target highlighting; **graph** algorithms (e.g. depth-first search) on a generated node–link tree with explicit vertices and edges—separate from the pathfinding grid |

**Shared**

- Manual vs autoplay, speed presets, mobile swipe (manual), fullscreen, optional sound  
- Python editor + run, test cases (built-in + custom), algorithm insight panel  
- Internationalization (English, French, Arabic with RTL), light/dark theme  
- In-browser video export (high resolution, orientation choice, short complexity segment at the end)  

Details, stack notes, and contributor workflows live in the docs linked below—not duplicated here.

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

| Doc | Use it when you… |
|-----|------------------|
| **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** | Run lint/tests/build, follow patterns, add an algorithm or language |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Understand routes, hooks, data flow, video export, testing layout |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contribute: branch targets `develop`, CI, PR template, standards |

## Contributing

Pull requests should target **`develop`**, not `main`. Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** and use **[.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md)** when you open a PR.

## License

Dual-licensed under **[Elastic License 2.0](./LICENSE)** (see file for terms) and a **commercial** option for hosted or OEM use — **[COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md)**. The Bayan Flow name and logo are covered in **[TRADEMARK.md](./TRADEMARK.md)**.

---

**By [Ayoub Abidi](https://github.com/ayoub3bidi)**
