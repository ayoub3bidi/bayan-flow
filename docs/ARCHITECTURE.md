# Architecture Overview

This document provides an in-depth explanation of the Bayan Flow architecture, design patterns, and implementation details.

**Contributors:** Open PRs against **`develop`** (not `main`). Follow **[CONTRIBUTING.md](../CONTRIBUTING.md)**, **[DEVELOPMENT.md](./DEVELOPMENT.md)** for practical workflows, and complete **[.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)** when submitting changes.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Routing & Pages](#routing--pages)
3. [Registry Layer](#registry-layer)
4. [Component Hierarchy](#component-hierarchy)
5. [Data Flow](#data-flow)
6. [Theme System](#theme-system)
7. [Internationalization](#internationalization)
8. [Algorithm Implementation](#algorithm-implementation)
9. [Animation System](#animation-system)
10. [Audio System](#audio-system)
11. [Video Export](#video-export)
12. [State Management](#state-management)
13. [Testing Strategy](#testing-strategy)
14. [CI & Deployment](#ci--deployment)
15. [Performance Optimizations](#performance-optimizations)

## System Architecture

### Application Structure

Bayan Flow is built as a single-page application (SPA) with multiple routes:

```
┌─────────────────────────────────────┐
│         React Router (BrowserRouter)│
├─────────────────────────────────────┤
│  /          → LandingPage           │
│  /roadmap   → Roadmap               │
│  /app       → VisualizerApp         │
└─────────────────────────────────────┘
```

### Global Providers

```javascript
<ThemeProvider>
  <BrowserRouter>
    <Routes>
      {/* Routes */}
    </Routes>
  </BrowserRouter>
</ThemeProvider>
```

**Provider Hierarchy:**
1. **ThemeProvider**: Global theme state (light/dark mode)
2. **BrowserRouter**: Client-side routing; **DocumentTitle** (sibling to Routes) updates `document.title` and og/twitter meta tags for SEO
3. **i18next**: Internationalization (initialized in main.jsx)

## Routing & Pages

### Route Structure

```javascript
// main.jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/app" element={<VisualizerApp />} />
  <Route path="/roadmap" element={<Roadmap />} />
</Routes>
```

### Page Responsibilities

#### **LandingPage** (`/`)
- Marketing homepage
- Hero section with CTA
- Feature highlights and algorithm-type overview
- GitHub repo badge (Octokit live stars/forks/releases)
- Roadmap CTA
- No visualizer functionality

**Components:**
- Hero, LearnYourWay, AlgorithmTypes, Features, ClaritySection, RoadmapCTA, GitHubRepoBadge
- Footer, ThemeToggle, LanguageSwitcher
- TechPattern (animated background)

#### **VisualizerApp** (`/app`)
- Main algorithm visualization interface
- All **five** categories: sorting, pathfinding, searching, tree traversal, graph algorithms
- Full control panel and settings
- Python code panel and algorithm insight panel (lazy-loaded overlays)
- Complexity analysis shown inside each visualizer after completion

**Key State (conceptual):**
```javascript
- algorithmType: 'sorting' | 'pathfinding' | 'searching' | 'treeTraversal' | 'graphAlgorithm'
- selectedAlgorithms: per-category algorithm key map
- arraySize: sorting + array-substrate searching
- searchGraphNodeCount: node–link searching (independent of pathfinding grid)
- gridSize / grid: pathfinding only
- treeNodeCount: tree traversal (3–31)
- graphNodeCount: graph algorithms (3–18; Floyd–Warshall capped lower)
- graphScenarioId: preset graph scenario for graph algorithms (when supported)
- sortOrder: ascending | descending (sorting only)
- speed, mode: manual | autoplay
- soundEnabled: persisted in localStorage
- isFullScreen, export flow, lazy panel visibility
```

#### **Roadmap** (`/roadmap`)
- Public development timeline
- Completed/in-progress/planned features
- Video embeds for releases
- Status badges
- Animated timeline

**Data Source:** `src/data/roadmapData.js`

## Registry Layer

Runtime behavior is driven by synchronized registries. Treat these as the source of truth (see also **[AGENTS.md](../AGENTS.md)** and **[AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md)**):

| Registry | Role |
| -------- | ---- |
| `src/constants/index.js` | Category keys, algorithm keys, complexity maps, visual state enums |
| `src/registry/categoryConfig.js` | Per-category defaults, i18n prefixes, size bindings, groups, features |
| `src/config/algorithmConfig.js` | `useAlgorithmConfig()` — translated dropdown data from `CATEGORY_CONFIG` |
| `src/registry/visualizerRegistry.js` | `VISUALIZER_REGISTRY` — category → React visualizer |
| `src/registry/extraVisualizerProps.js` | Category-specific props for visualizer components |
| `src/registry/videoSceneRegistry.jsx` | Remotion scene renderers + export title fallbacks |
| `src/registry/complexityDatasetRegistry.js` | Maps dataset keys to static complexity metadata |
| `src/registry/searchingSubstrate.js` | Array vs node–link searching branch point |
| `src/registry/graphAlgorithmRegistry.js` | Profiles, scenarios, groups, node-count clamps |

**Category hooks** (each called unconditionally in `VisualizerApp`):

- `useSortingVisualization`, `usePathfindingVisualization`, `useSearchingVisualization`
- `useTreeTraversalVisualization`, `useGraphAlgorithmVisualization`

**Shared playback:** `useVisualization` owns step navigation and sound emission; category hooks supply `executeStep` and domain state.

**Merged lookup:** `useCategoryVisualizations()` exposes all five controllers keyed by `ALGORITHM_TYPES`.

## Component Hierarchy

### Page-Level Components

```
LandingPage
├── ThemeToggle
├── LanguageSwitcher
├── TechPattern (background)
├── Hero
├── LearnYourWay
├── AlgorithmTypes
├── Features
├── ClaritySection
├── RoadmapCTA
└── Footer

VisualizerApp
├── Header
├── SettingsPanel (category tabs, useAlgorithmConfig, useSettingsConfig, AlgorithmDropdown, GraphScenarioDropdown)
├── VISUALIZER_REGISTRY[category]:
│     ArrayVisualizer (sorting)
│   | GridVisualizer (pathfinding)
│   | SearchingCategoryVisualizer → ArrayVisualizer | GraphVisualizer (by substrate)
│   | TreeVisualizer (treeTraversal)
│   | GraphAlgorithmCategoryVisualizer → node-link | GraphAlgorithmMatrixVisualizer (Floyd–Warshall)
├── ControlPanel (playback, shuffle, sort order, sound, export, fullscreen)
├── FloatingActionButton (Python panel)
├── InsightFloatingActionButton
├── ExportProgressModal
├── PythonCodePanel (lazy)
├── AlgorithmInsightPanel (lazy)
└── Footer

Roadmap
├── ThemeToggle
├── LanguageSwitcher
├── Back to Home Link
├── RoadmapHero
├── Timeline
│   └── TimelineItem (multiple)
└── Footer
```

### Component Responsibilities

#### **VisualizerApp** (Orchestrator)
- Manages global visualization state
- Coordinates data flow between components
- Handles algorithm selection and generation
- Manages full-screen mode
- Lazy loads heavy components

**Key State:**
```javascript
- algorithmType + selectedAlgorithms (per category)
- Size state: arraySize, gridSize, searchGraphNodeCount, treeNodeCount, graphNodeCount
- graphScenarioId for preset graph-algorithm datasets
- speed, mode, soundEnabled, isFullScreen, export + panel visibility
```

#### **ArrayVisualizer / GridVisualizer / GraphVisualizer / TreeVisualizer** (Presentation)
- **ArrayVisualizer**: sorting; shows **ComplexityPanel** after completion delay
- **GridVisualizer**: pathfinding; grid cells with start/end/wall/path semantics
- **GraphVisualizer**: node–link searching and shared graph rendering primitives
- **TreeVisualizer**: binary-tree traversals with visit order and optional queue/level direction
- **SearchingCategoryVisualizer**: routes by `getSearchingSubstrate(algorithm)` → array bars or graph
- **GraphAlgorithmCategoryVisualizer**: node–link graph algorithms; matrix handoff for Floyd–Warshall
- Presentational: swipe (`useSwipe`), auto-hiding legend, step descriptions, Framer Motion

#### **ArrayBar/GridCell** (Atomic Components)
- Individual visualization elements
- Color-coded based on element state
- Animated using Framer Motion

#### **ControlPanel** (Interaction)
- Mode-aware playback controls
- Progress tracking
- Full-screen toggle
- Generate new array/grid button
- Export video button (triggers orientation selection flow)

#### **SettingsPanel** (Configuration)
- Category tabs for all five modes
- **AlgorithmDropdown**: grouped algorithm selection (`useAlgorithmConfig`)
- **GraphScenarioDropdown**: preset scenarios for supported graph algorithms
- Control mode toggle (manual/autoplay)
- Speed presets (autoplay only)
- Size control per `CATEGORY_CONFIG.sizeBinding`:
  - `array` — array size slider (sorting + array searching)
  - `grid` — preset buttons (pathfinding)
  - `tree` — tree node count slider
  - `graph` — graph node count slider (Floyd–Warshall uses a lower max)
- Sort order toggle (sorting only)

Sound toggle lives in **ControlPanel** (not SettingsPanel).

#### **Config Layer** (`src/config/`)
- **useAlgorithmConfig**: Returns algorithm lists and groups for all five categories (from `CATEGORY_CONFIG`, i18n-aware)
- **useSettingsConfig**: Returns `gridSizeOptions`, `speedOptions` from constants

#### **PythonCodePanel** (Interactive Code & Testing)
- Monaco editor: editable Python code, syntax highlighting, theme-aware (light/dark)
- Run/Rerun button; Ctrl+Enter to execute
- Output tab: stdout/stderr from Pyodide execution
- Test Cases tab: pre-defined + custom test cases, LeetCode-style pass/fail, add/edit/delete custom cases (persisted in localStorage)
- Resizable editor/output split
- Side panel (desktop) / Bottom sheet (mobile)
- Lazy loaded; Pyodide runs in Web Worker (`pyodide.worker.js`)

#### **ExportProgressModal** (Video Export)
- Orientation selection: Horizontal (16:9) or Vertical (9:16)
- Progress bar and Stop button during render
- Video preview with Download and Close (RTL-aware)
- Phases: `orientation` → `checking` → `rendering` → `preview`

#### **ComplexityPanel** (Analysis)
- Algorithm complexity visualization
- Big-O notation display
- Interactive performance graph
- Linear/logarithmic scale toggle
- Use cases and descriptions
- Shown after algorithm completion

## Data Flow

### Algorithm Execution Flow

```
User Action (Select Algorithm)
    ↓
VisualizerApp Component
    ↓
Algorithm Function (e.g., bubbleSort)
    ↓
Generate Animation Steps[]
    ↓
Load into Category Hook (useSortingVisualization, etc.)
    ↓
useVisualization (shared playback + sound via getSoundEventsForStep)
    ↓
User Action (Play/Step/Swipe)
    ↓
Trigger React Re-render
    ↓
Visualizer Updates
    ↓
Framer Motion Animates
    ↓
Sound Manager Plays Audio
```

### Step Generation Pattern

Each algorithm generates an array of step objects:

```javascript
{
  array: [5, 2, 8, 1, 9],        // Array state at this step
  states: [                       // Element states at this step
    'default',                    // Blue
    'comparing',                  // Yellow
    'comparing',                  // Yellow
    'default',                    // Blue
    'sorted'                      // Green
  ],
  description: 'Comparing 2 and 8'  // Human-readable description
}
```

For pathfinding:

```javascript
{
  grid: [[0, 0, ...], ...],      // Grid state
  states: [['default', ...], ...], // Cell states
  description: 'Exploring cell (2, 3)'
}
```

For searching — **array** substrate (sorted bars):

```javascript
{
  array: [1, 3, 5, 7, 9],
  states: ['default', 'comparing', ...], // includes auxiliary for “out of range”
  description: '…',                       // i18n step string
  targetValue: 5                          // UI: target chip + ring on bar
}
```

For searching — **node–link graph** substrate (e.g. DFS):

```javascript
{
  nodes: [{ id: '0', x: 0.5, y: 0.2, label: '0' }, ...], // layout: normalized 0–1
  edges: [{ from: '0', to: '1' }, ...],
  nodeStates: { '0': 'root', '1': 'frontier', ... },     // GRAPH_NODE_STATES
  stackOrder: ['0', '1'],                                 // optional; top = last element
  description: '…',
  goalNodeId: '3'                                         // optional metadata
}
```

Registry helpers: `src/registry/searchingSubstrate.js`, `src/registry/graphAlgorithmRegistry.js`, `src/registry/extraVisualizerProps.js`.

For **tree traversal**:

```javascript
{
  nodes: [{ id, x, y, label, value? }, ...],
  edges: [{ from, to }, ...],
  nodeStates: { '2': 'current', ... },
  visitOrder: ['0', '1', ...],
  queueOrder?: ['3', '4'],           // BFS-style traversals
  levelScanDirection?: 'left' | 'right', // zigzag level order
  description: '…'
}
```

For **graph algorithms** (node–link):

```javascript
{
  nodes, edges, nodeStates, edgeStates,
  stackOrder?, outputOrder?,
  graphArtifacts?, description,
  representation: 'nodeLink', directed, weighted
}
```

For **Floyd–Warshall** (matrix):

```javascript
{
  matrix: { rowLabels, columnLabels, cells, cellStates },
  description, representation: 'matrix', directed, weighted, graphArtifacts?
}
```

## Theme System

### Architecture

```javascript
// Context Definition
ThemeContext = createContext(undefined)

// Provider Implementation
<ThemeProvider>
  - Manages theme state ('light' | 'dark')
  - Persists to localStorage
  - Detects system preference
  - Listens for system changes
  - Applies CSS classes to document root
</ThemeProvider>

// Hook Usage
const { theme, toggleTheme, isDark, isLight } = useTheme()
```

### CSS Variable System

```css
/* Light Mode (default) */
:root {
  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-text-primary: #364153;
  --color-primary: #2b7fff;
  /* ... 50+ variables */
}

/* Dark Mode */
.dark {
  --color-bg: #0a0f1a;
  --color-surface: #1a2332;
  --color-text-primary: #f9fafb;
  --color-primary: #60a5fa;
  /* ... matching variables */
}
```

**Benefits:**
- Instant theme switching (no re-render needed for styled components)
- Consistent theming across all components
- Easy to customize
- Smooth transitions

### Theme Detection Flow

```
App Initialization
    ↓
Check localStorage for saved theme
    ↓
If no saved theme → Check system preference
    ↓
Apply theme to document root
    ↓
Listen for system preference changes
    ↓
Auto-update only if no user preference saved
```

## Internationalization

### i18n Architecture

```javascript
// Configuration
i18n
  .use(LanguageDetector)      // Auto-detect language
  .use(initReactI18next)       // React integration
  .init({
    resources: { en, fr, ar }, // Translation files
    fallbackLng: 'en',         // Fallback language
    supportedLngs: ['en', 'fr', 'ar'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })
```

### RTL Support

```javascript
// rtlManager.js
RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur']

initRTL(i18n) → {
  - Set document dir attribute
  - Listen for language changes
  - Update dir on change
}

// Automatic layout flipping for Arabic
<div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
```

### Translation Structure

```json
{
  "header": { "title": "...", "subtitle": "..." },
  "settings": { "algorithm": "...", "speed": "..." },
  "controls": { "play": "...", "pause": "..." },
  "algorithms": {
    "sorting": { "bubbleSort": "..." },
    "pathfinding": { "bfs": "..." },
    "searching": { "binarySearch": "..." }
  }
}
```

**Usage:**
```javascript
const { t, i18n } = useTranslation()
const isRTL = i18n.dir() === 'rtl'

// Simple translation
<h1>{t('header.title')}</h1>

// With interpolation
<p>{t('info.step', { current: 5, total: 10 })}</p>
```

## Algorithm Implementation

### Dual Implementation Pattern

Each algorithm has two versions:

1. **Visualization Version**: Records every step for animation
2. **Pure Version**: Standard implementation for testing

**Example: Bubble Sort**

```javascript
// Visualization version - generates steps
export function bubbleSort(array) {
  const steps = [];
  const arr = [...array];
  
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      // Record comparison step
      steps.push({
        array: [...arr],
        states: createStates(j, j+1, 'comparing'),
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.COMPARING,
          { a: arr[j], b: arr[j+1] }
        )
      });
      
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        
        // Record swap step
        steps.push({
          array: [...arr],
          states: createStates(j, j+1, 'swapping'),
          description: getAlgorithmDescription(
            ALGORITHM_STEPS.SWAPPING,
            { a: arr[j+1], b: arr[j] }
          )
        });
      }
    }
  }
  
  return steps;
}

// Pure version - just sorts
export function bubbleSortPure(array) {
  const arr = [...array];
  
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
      }
    }
  }
  
  return arr;
}
```

### Why This Pattern?

- **Separation of Concerns**: Business logic separate from visualization
- **Testability**: Pure functions easy to test
- **Maintainability**: Changes to algorithm don't affect animation
- **Debuggability**: Can test algorithm correctness independently
- **Internationalization**: Description keys enable multi-language support

### Algorithm Translation System

```javascript
// algorithmTranslations.js
export const ALGORITHM_STEPS = {
  COMPARING: 'comparing',
  SWAPPING: 'swapping',
  PIVOT_SELECTED: 'pivotSelected',
  // ... more step types
}

// Usage in algorithms
import { getAlgorithmDescription, ALGORITHM_STEPS } from '../utils/algorithmTranslations'

description: getAlgorithmDescription(
  ALGORITHM_STEPS.COMPARING,
  { a: arr[j], b: arr[j+1] }
)

// Translation files
{
  "algorithmSteps": {
    "comparing": "Comparing {{a}} and {{b}}",
    "swapping": "Swapped {{a}} and {{b}}"
  }
}
```

## Animation System

### Framer Motion Integration

**ArrayBar Component Animation:**

```javascript
<motion.div
  animate={{
    backgroundColor: color,           // Smooth color transitions
    scale: isActive ? 1.05 : 1,      // Pulse effect when active
  }}
  transition={{
    duration: 0.3,
    ease: 'easeInOut',
  }}
/>
```

**Page Transitions:**

```javascript
<AnimatePresence mode="wait">
  {isFullScreen ? (
    <motion.div
      key="fullscreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fullscreen content */}
    </motion.div>
  ) : (
    <motion.div key="normal" {...}>
      {/* Normal content */}
    </motion.div>
  )}
</AnimatePresence>
```

**Benefits:**
- Hardware-accelerated (uses GPU)
- Declarative syntax
- Automatic interpolation
- Built-in spring physics
- AnimatePresence for enter/exit animations

### State Color Mapping

```javascript
const STATE_COLORS = {
  'default':    '#3b82f6',  // Blue - Normal state
  'comparing':  '#fbbf24',  // Yellow - Being compared
  'swapping':   '#ef4444',  // Red - Being swapped
  'sorted':     '#10b981',  // Green - In final position
  'pivot':      '#8b5cf6',  // Purple - Pivot element
  'auxiliary':  '#6b7280',  // Gray - Helper position
};
```

### Animation Speed Control

Speed is user-configurable via constants:

```javascript
export const ANIMATION_SPEEDS = {
  SLOW: 8000,
  MEDIUM: 4800,
  FAST: 2400,
  VERY_FAST: 1200,
};
```

**Autoplay Mode:**
```javascript
const runAutoplay = (stepIndex) => {
  if (stepIndex >= steps.length) return;
  
  executeStep(steps[stepIndex]);
  
  autoplayTimeoutRef.current = setTimeout(() => {
    runAutoplay(stepIndex + 1);
  }, speed); // User-selected speed
};
```

## Audio System

### Architecture

Sound is **visualization-only** and derived from semantic step metadata, not localized description text.

1. **`getSoundEventsForStep()`** (`src/utils/soundEvents.js`) — maps a step's visual state to zero or more sound event kinds
2. **`useVisualization`** — calls `getSoundEventsForStep` during intentional forward playback and manual stepping; initial load, reset, step-back, algorithm changes, and passive regeneration stay silent
3. **`soundManager`** (`src/utils/soundManager.js`) — singleton Tone.js playback; instruments created lazily after sound is enabled
4. **Export audio** — `buildExportSoundCues()` schedules the same events for Remotion export (`public/video-export/sfx/` pre-rendered WAV assets)

User toggle: **ControlPanel** → persisted in `localStorage` as `bayan-flow:sound-enabled`.

Regenerate export WAV assets after changing presets or event kinds:

```bash
pnpm run generate:export-sfx
```

### Integration Pattern

```javascript
// useVisualization.applyStep (simplified)
if (emitSound && soundContext) {
  const events = getSoundEventsForStep(step, soundContext);
  for (const event of events) {
    soundManager.playEvent(event);
  }
}
```

Interactive playback and export must stay aligned — both consume `getSoundEventsForStep()`.

## Video Export

### Overview

Video export uses **Remotion** (`@remotion/web-renderer`) to render algorithm visualizations as MP4 files directly in the browser. No server-side rendering is required.

### Export Flow

```
User clicks Export → Orientation selection (Horizontal / Vertical)
    → User selects format
    → Browser capability check (canRenderMediaOnWeb)
    → Render (renderMediaOnWeb) with progress
    → Preview modal with video player
    → User downloads or closes
```

### Architecture

- **useVideoExporter** (`src/video/useVideoExporter.js`): Hook managing export state (`idle` | `orientation` | `checking` | `rendering` | `preview` | `error`), blob storage, and download.
- **ExportProgressModal** (`src/components/ExportProgressModal.jsx`): Single modal with phases—orientation choice, progress bar, video preview. RTL-aware close button.
- **AlgorithmVideo** (`src/video/AlgorithmVideo.jsx`): Root Remotion composition; title, step counter, localized description, watermark, optional export audio, complexity segment.
- **Scene routing** (`src/registry/videoSceneRegistry.jsx`):
  - Sorting → `SortingScene`
  - Pathfinding → `PathfindingScene`
  - Searching → `SearchingVideoScene` (array steps → `SortingScene`; graph steps → `GraphSearchingScene`)
  - Tree traversal → `TreeTraversalScene`
  - Graph algorithms → `GraphAlgorithmVideoScene` (node–link → `GraphAlgorithmScene`; matrix → `GraphAlgorithmMatrixScene`)
- **ComplexityScene**: Remotion-compatible complexity display shown for 10 seconds at the end.

### Orientations

| Format   | Dimensions   | Use case                         |
|----------|--------------|----------------------------------|
| Horizontal | 1920×1080  | YouTube, presentations           |
| Vertical   | 1080×1920  | Shorts, Reels, TikTok            |

### Key Constants (`src/video/constants.js`)

- `VIDEO_FPS`: 30
- `VIDEO_EXPORT_FRAMES_PER_STEP`: 45 (~1.5 s per step)
- `COMPLEXITY_DURATION_FRAMES`: 300 (10 seconds)

## State Management

### Shared Playback: `useVisualization`

Category hooks delegate step navigation to this generic engine:

```javascript
export function useVisualization({ executeStep, speed, mode, soundContext }) {
  // Owns: steps, currentStep, isPlaying, isComplete, description
  // Methods: loadSteps, play, pause, reset, stepForward, stepBackward
  // Emits sound via getSoundEventsForStep when advancing intentionally
}
```

Each category hook provides `executeStep(step)` to apply domain state (array, grid, tree, graph, matrix).

### Category Hooks

#### **useSortingVisualization**

Wraps `useVisualization` with array state, sort-order handling, and step loading from sorting algorithms.

#### **usePathfindingVisualization**

Manages 2D grid state, start/end generation, wall placement, and grid regeneration.

#### **useSearchingVisualization**

Two internal paths (array vs node–link) selected by `searchingSubstrate.js`. Passes `searchGraphNodeCount` for graph searching — not `gridSize`.

#### **useTreeTraversalVisualization**

Tree snapshots from `generateTreeForTraversal()`; visit order, queue, and level-direction metadata.

#### **useGraphAlgorithmVisualization**

Node–link and matrix representations via `graphAlgorithmRegistry.js` profiles; scenario-aware input generation.

#### **useCategoryVisualizations**

Merges all five hook results into a map keyed by `ALGORITHM_TYPES` for `VisualizerApp` to index by active category.

Manages Python execution via Pyodide in a Web Worker:
- `runCode(code)` – Execute Python; lazy-loads Pyodide on first run
- `runTests(code, functionName, testCases)` – Run test harness, returns pass/fail per case
- `status`, `output`, `error` – Execution state
- `testResults`, `testStatus`, `testError` – Test run state
- `clearOutput`, `clearTestResults`, `cancelExecution`
- Timeout handling; worker cleanup on unmount

#### **usePythonExecution**

```javascript
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

Returns:
```javascript
{
  theme: 'light' | 'dark',
  setTheme: (theme) => void,
  toggleTheme: () => void,
  isSystemDark: boolean,
  isDark: boolean,
  isLight: boolean
}
```

#### **useFullScreen**

```javascript
export function useFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState(() => 
    localStorage.getItem('flowModeEnabled') === 'true'
  );
  
  const toggleFullScreen = useCallback(...);
  const exitFullScreen = useCallback(...);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f') toggleFullScreen();
      if (e.key === 'Escape') exitFullScreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return { isFullScreen, toggleFullScreen, exitFullScreen };
}
```

#### **useSwipe**

```javascript
export function useSwipe({ onLeft, onRight, threshold = 30 }) {
  const startX = useRef(null);
  const startY = useRef(null);
  
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    
    // Ignore vertical swipes (prioritize scrolling)
    if (Math.abs(dy) > Math.abs(dx)) return;
    
    if (Math.abs(dx) >= threshold) {
      dx > 0 ? onRight() : onLeft();
    }
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
}
```

## Testing Strategy

The suite contains **98** test files under `src/`. Vitest runs in jsdom with `@/` path alias; tests use sequential forks to reduce memory pressure (`vitest.config.js`).

### Registry Completeness Tests

Critical for this codebase — verify synchronized wiring:

- `src/registry/categoryConfig.test.js`
- `src/registry/categoryRuntimeCompleteness.test.js`
- `src/registry/visualizerRegistry.test.js`
- `src/registry/videoSceneRegistry.test.jsx`
- `src/registry/complexityDatasetRegistry.test.js`
- `src/registry/graphAlgorithmRegistry.test.js`
- `src/registry/searchingSubstrate.test.js`

See **[AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md)** for the full targeted test command list. **[AGENTS.md](../AGENTS.md)** covers the ship-it test ladder and non-negotiable contracts.

### Unit Tests

**Algorithm Tests** (`algorithms.test.js`):
```javascript
describe('Sorting Algorithms', () => {
  const testCases = [
    { name: 'empty array', input: [], expected: [] },
    { name: 'single element', input: [42], expected: [42] },
    { name: 'already sorted', input: [1,2,3], expected: [1,2,3] },
    { name: 'reverse sorted', input: [3,2,1], expected: [1,2,3] },
  ];

  describe('Bubble Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        expect(bubbleSortPure(input)).toEqual(expected);
      });
    });
  });
});
```

**Hook Tests** (`useTheme.test.js`):
```javascript
describe('useTheme', () => {
  it('should initialize with system preference', () => {
    matchMedia.mockReturnValue({ matches: true });
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    });
    expect(result.current.theme).toBe('dark');
  });
  
  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    });
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });
});
```

**Component Tests** (`ThemeToggle.test.jsx`):
```javascript
describe('ThemeToggle', () => {
  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    
    fireEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
pnpm test              # Watch mode
pnpm test:run          # Single run (full suite)
pnpm test:ui           # Visual UI
pnpm test:coverage     # Coverage report (Codecov patch threshold 70%)
```

**Test Setup:** `src/test/setup.js` mocks constants, tone, soundManager, gridHelpers. The constants test uses `vi.unmock()` to test the real module.

## CI & Deployment

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main` and `develop`:

1. **Quality** — ESLint + Prettier check
2. **Test** — Vitest with coverage (Codecov upload; PR lcov comment)
3. **Build** — production build with `VITE_GIT_BRANCH` embedded
4. **Deploy** — Cloudflare Workers (`main` → production, `develop` → staging); PR previews via `preview-cloudflare.yml`

Build-time env:

- `VITE_GIT_BRANCH` — branch name for deploy context (`src/utils/deployContext.js`)
- `VITE_DEV_SITE_URL` — optional dev site link in CI builds
- `VITE_PYODIDE_CDN_BASE` — optional Pyodide CDN base URL override; defaults to jsDelivr

Cloudflare config: `wrangler.jsonc` (static Vite SPA on Workers assets).

PRs to `main` must originate from `develop` (or allowed mergers) via `ensure-pr-source-develop.yml`.

## Performance Optimizations

### React Optimizations

1. **useMemo for Expensive Calculations**
```javascript
const maxValue = useMemo(() => Math.max(...array), [array]);
```

2. **useCallback for Event Handlers**
```javascript
const handlePlay = useCallback(() => {
  visualization.play();
}, [visualization]);
```

3. **Key Props for List Items**
```javascript
{array.map((value, index) => (
  <ArrayBar key={`${index}-${value}`} {...} />
))}
```

4. **Code Splitting with Lazy Loading**
```javascript
const PythonCodePanel = lazy(() => import('./components/PythonCodePanel'));
const AlgorithmInsightPanel = lazy(() => import('./components/AlgorithmInsightPanel'));
// ComplexityPanel is embedded inside visualizers (not app-level lazy)
```

### Animation Optimizations

1. **Framer Motion**: Uses transform/opacity (GPU-accelerated)
2. **Conditional Rendering**: Only animate visible elements
3. **Debounced Controls**: Prevent rapid state changes

### Build Optimizations

1. **Vite Code Splitting**: Automatic chunking
2. **Tree Shaking**: Dead code elimination
3. **CSS Purging**: Tailwind removes unused styles
4. **Minification**: Production builds are compressed
5. **Asset Optimization**: Image and SVG optimization

### Memory Management

- **Cleanup in useEffect**: Remove event listeners on unmount
- **Ref Usage**: Avoid stale closures in async operations
- **Timeout Cleanup**: Clear timeouts on component unmount

```javascript
useEffect(() => {
  return () => {
    clearAutoplayTimeout();
    animationRef.current = null;
  };
}, [clearAutoplayTimeout]);
```

## Future Enhancements

Representative ideas (see `src/data/roadmapData.js` and open issues for current priorities):

- Algorithm comparison mode side-by-side
- Custom user-provided inputs (arrays, grids, graphs)
- Richer editable graph layouts for searching and graph algorithms
- Step-by-step tutorials and quiz mode
- Performance benchmarking against input size

## Conclusion

Bayan Flow is built with:

- **Registry-driven modularity**: Five categories wired through `CATEGORY_CONFIG`, visualizer/video/complexity registries, and unconditional category hooks
- **Shared playback**: `useVisualization` + semantic `soundEvents` keep categories consistent
- **Maintainability**: Dual implementation (visualization steps + pure functions) for algorithms
- **Testability**: 98 test files including registry completeness coverage
- **Performance**: Lazy heavy panels, GPU-friendly Framer Motion, sequential Vitest forks
- **Extensibility**: New algorithms plug into registries, constants, i18n, Python, pseudocode, and insight metadata
- **Accessibility**: Keyboard shortcuts, ARIA, skip links, reduced-motion awareness
- **Internationalization**: EN/FR/AR with RTL
- **Theming**: CSS-variable-based light/dark system

The architecture is designed to add modes and algorithms without forking the core visualizer flow.
