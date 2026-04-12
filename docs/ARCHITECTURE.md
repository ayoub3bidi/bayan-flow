# Architecture Overview

This document provides an in-depth explanation of the Bayan Flow architecture, design patterns, and implementation details.

**Contributors:** Open PRs against **`develop`** (not `main`). Follow **[CONTRIBUTING.md](../CONTRIBUTING.md)**, **[DEVELOPMENT.md](./DEVELOPMENT.md)** for practical workflows, and complete **[.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)** when submitting changes.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Routing & Pages](#routing--pages)
3. [Component Hierarchy](#component-hierarchy)
4. [Data Flow](#data-flow)
5. [Theme System](#theme-system)
6. [Internationalization](#internationalization)
7. [Algorithm Implementation](#algorithm-implementation)
8. [Animation System](#animation-system)
9. [Audio System](#audio-system)
10. [Video Export](#video-export)
11. [State Management](#state-management)
12. [Testing Strategy](#testing-strategy)
13. [Performance Optimizations](#performance-optimizations)

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
- Feature highlights
- Algorithm type overview
- Roadmap CTA
- No visualizer functionality

**Components:**
- Hero, LearnYourWay, AlgorithmTypes, Features, ClaritySection, RoadmapCTA
- Footer, ThemeToggle, LanguageSwitcher
- TechPattern (animated background)

#### **VisualizerApp** (`/app`)
- Main algorithm visualization interface
- **Sorting**, **pathfinding**, and **searching** modes (mode tab + shared settings)
- Full control panel and settings
- Python code panel (edit, run, test cases)
- Complexity analysis

**Key State (conceptual):**
```javascript
- algorithmType: 'sorting' | 'pathfinding' | 'searching'
- array: 1D data for sorting and for array-substrate searching (sorted + target)
- searchGraphNodeCount: node count for node–link searching (e.g. DFS); independent of pathfinding gridSize
- gridSize / grid: pathfinding only
- selectedAlgorithm: Current algorithm key
- speed: Animation speed (autoplay)
- mode: 'manual' | 'autoplay'
- isFullScreen: Full-screen mode state
```

#### **Roadmap** (`/roadmap`)
- Public development timeline
- Completed/in-progress/planned features
- Video embeds for releases
- Status badges
- Animated timeline

**Data Source:** `src/data/roadmapData.js`

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
├── SettingsPanel (uses useAlgorithmConfig, useSettingsConfig, AlgorithmDropdown)
├── VISUALIZER_REGISTRY[mode]: ArrayVisualizer (sorting) | GridVisualizer (pathfinding) | SearchingCategoryVisualizer (searching → ArrayVisualizer or GraphVisualizer by substrate)
├── ControlPanel
├── FloatingActionButton
├── ExportProgressModal (orientation selection, progress, preview)
├── PythonCodePanel (lazy; Monaco editor, Output + Test Cases tabs)
├── ComplexityPanel (lazy)
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
- algorithmType: 'sorting' | 'pathfinding' | 'searching'
- array / grid / graph snapshot: Depends on mode; searching may be sorted array **or** explicit nodes+edges (see `searchingSubstrate.js`)
- speed: Animation speed
- selectedAlgorithm: Current algorithm key
- mode: manual / autoplay
- isPythonPanelOpen: Python panel visibility
```

#### **ArrayVisualizer / GridVisualizer / GraphVisualizer** (Presentation)
- **ArrayVisualizer**: sorting and array-substrate searching (bars, target ring when applicable)
- **GridVisualizer**: pathfinding only (cells, start/end, queue/path semantics)
- **GraphVisualizer**: node–link searching (SVG nodes and edges, `GRAPH_NODE_STATES`, optional stack hint)
- **SearchingCategoryVisualizer** routes by `getSearchingSubstrate(algorithm)` → `ARRAY` vs `NODE_LINK`
- Presentational: swipe, auto-hiding legend, step descriptions, Framer Motion where used

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
- Algorithm type toggle (**sorting / pathfinding / searching**)
- **AlgorithmDropdown**: Algorithm selection with grouped options (uses `useAlgorithmConfig`)
- Control mode toggle (manual/autoplay)
- Speed slider (autoplay only)
- Size control is **effective** per mode: array size (sorting + array searching), graph node count (node–link searching), grid size (pathfinding)—see `SettingsPanel` + `searchingSubstrate.js`
- Sound toggle

#### **Config Layer** (`src/config/`)
- **useAlgorithmConfig**: Returns sorting, pathfinding, and **searching** algorithm lists and groups (from `CATEGORY_CONFIG`, i18n-aware)
- **useSettingsConfig**: Returns gridSizeOptions, speedOptions from constants

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
Load into Visualization Hook
    ↓
User Action (Play/Step)
    ↓
Hook Updates Current Step
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

Registry helpers: `src/registry/searchingSubstrate.js` (`getSearchingSubstrate`, `isNodeLinkSearchingAlgorithm`). Extra visualizer props: `src/registry/extraVisualizerProps.js`.

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

### SoundManager Architecture

The audio system uses **Tone.js** for Web Audio API abstraction:

```javascript
class SoundManager {
  constructor() {
    this.isEnabled = false;
    this.softSynth = new Tone.Synth({...});      // UI sounds
    this.pluckSynth = new Tone.PluckSynth({...}); // Compare sounds
    this.metallicSynth = new Tone.MetalSynth({...}); // Swap sounds
    this.polySynth = new Tone.PolySynth({...});   // Chord sounds
    this.membrane = new Tone.MembraneSynth({...});
  }
  
  async enable() {
    await Tone.start();
    this.isEnabled = true;
  }
  
  playCompare(value) {
    if (!this.isEnabled) return;
    const freq = 150 + ((value - 5) / 95) * 200;
    this.pluckSynth.triggerAttackRelease(freq, '16n');
  }
}
```

### Sound Mapping Strategy

**Sorting Operations:**
- **Compare**: Pluck synth with frequency mapped to element value (150-350Hz)
- **Swap**: Metallic synth for distinct swap feedback
- **Pivot**: Soft synth with lower frequency range (100-200Hz)
- **Sorted**: Major chord (C-E-G) for completion celebration

**Pathfinding Operations:**
- **Node Visit**: Soft synth at 220Hz (A3 note)
- **Path Found**: Extended chord (C3-E3-G3-C4) for success
- **UI Interactions**: Brief G4 note for clicks

### Integration Pattern

```javascript
const executeStep = useCallback((step) => {
  setArray(step.array);
  setStates(step.states);
  
  // Trigger contextual audio
  if (step.states.includes(ELEMENT_STATES.SWAPPING)) {
    soundManager.playSwap();
  } else if (step.states.includes(ELEMENT_STATES.COMPARING)) {
    soundManager.playCompare(step.array[compareIndex]);
  }
}, []);
```

**Benefits:**
- **Non-blocking**: Audio failures don't affect visualization
- **User-controlled**: Easy enable/disable toggle
- **Performance**: Early returns when disabled
- **Contextual**: Sounds match visual operations

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
- **AlgorithmVideo** (`src/video/AlgorithmVideo.jsx`): Root Remotion composition; switches between main visualization and complexity segment.
- **SortingScene** / **PathfindingScene** / **GraphSearchingScene**: Frame-based Remotion scenes; use `interpolate()` / `interpolateColors()` for smooth transitions. **Searching** uses **`SearchingVideoScene`**: array-shaped steps → **SortingScene**; graph-shaped steps (`nodes` + `edges` + `nodeStates`) → **GraphSearchingScene** (not the pathfinding grid).
- **ComplexityScene**: Remotion-compatible complexity display (time/space, performance graph) shown for 10 seconds at the end.

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

### Custom Hooks Architecture

#### **useSortingVisualization**

```javascript
export function useSortingVisualization(initialArray, speed, mode) {
  const [array, setArray] = useState(initialArray);
  const [states, setStates] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);
  
  const stepsRef = useRef([]);
  const autoplayTimeoutRef = useRef(null);
  
  // Methods
  const loadSteps = useCallback(...);
  const play = useCallback(...);
  const pause = useCallback(...);
  const reset = useCallback(...);
  const stepForward = useCallback(...);
  const stepBackward = useCallback(...);
  
  return {
    array, states, isPlaying, currentStep, totalSteps,
    description, isComplete, mode,
    loadSteps, play, pause, reset, stepForward, stepBackward
  };
}
```

**Key Features:**
1. **Ref for Steps**: Uses `useRef` to avoid stale closures in async operations
2. **Async Playback**: Handles Promise-based delays with cleanup
3. **Cancellable**: Can interrupt animation mid-play
4. **Bidirectional**: Can step forward and backward
5. **Mode-Aware**: Different behavior for manual vs autoplay

#### **usePythonExecution**

Manages Python execution via Pyodide in a Web Worker:
- `runCode(code)` – Execute Python; lazy-loads Pyodide on first run
- `runTests(code, functionName, testCases)` – Run test harness, returns pass/fail per case
- `status`, `output`, `error` – Execution state
- `testResults`, `testStatus`, `testError` – Test run state
- `clearOutput`, `clearTestResults`, `cancelExecution`
- Timeout handling; worker cleanup on unmount

#### **usePathfindingVisualization**

Similar to sorting hook but manages:
- 2D grid state instead of 1D array
- Start/end position generation
- Grid size changes
- Grid regeneration

#### **useSearchingVisualization**

Same control surface as sorting (steps, play, step forward/back, autoplay) but **two internal paths**:

- **Array substrate**: sorted arrays; random **target** per load; steps with `array`, `states`, optional **`targetValue`** → `ArrayVisualizer` / **`SortingScene`**
- **Node–link substrate**: `generateRandomSearchTree`-style graph context; **`regenerateGraphStructure`** for new data; steps with **`nodes`**, **`edges`**, **`nodeStates`**, **`stackOrder`** → `GraphVisualizer` / **`GraphSearchingScene`** via `getExtraVisualizerProps`

`VisualizerApp` passes **`searchGraphNodeCount`** (not `gridSize`) for graph searching. `VisualizerApp` selects this hook (with sorting and pathfinding) via `useCategoryVisualizations`.

#### **useTheme**

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
const ComplexityPanel = lazy(() => import('./components/ComplexityPanel'));

<Suspense fallback={<LoadingSpinner />}>
  <PythonCodePanel {...} />
</Suspense>
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

### Planned Features

1. **Additional Algorithms**
   - 14 sorting algorithms; 9 pathfinding algorithms; **searching** with array algorithms (linear, binary, …) and **node–link** graph traversal (DFS today; room for BFS-on-graph, tree walks, etc. without reusing the pathfinding grid UI)

2. **Richer graph searching**
   - DAG / non-tree generators, directed edges, optional force-directed or editable layouts while keeping the same step schema

3. **Advanced Features**
   - Algorithm comparison mode
   - Custom array/grid input
   - Collaborative mode

4. **Educational Enhancements**
   - Step-by-step tutorials
   - Quiz mode
   - Code playground
   - Performance benchmarking

5. **Recently Completed** (representative; see repo for current scope)
   - In-browser MP4 export via Remotion (orientation choice, preview, complexity segment)
   - Broad sorting and pathfinding catalogs; **searching** with sorted-array UI and **node–link graph** DFS (`GraphVisualizer`, `GraphSearchingScene`, `searchingSubstrate`)
   - Vitest-based test suite and CI aligned with `package.json` engines
   - Centralized category config (`CATEGORY_CONFIG`) feeding `useAlgorithmConfig` and `useSettingsConfig`
   - DocumentTitle for SEO; grouped algorithm dropdown

## Conclusion

Bayan Flow is built with:
- **Modularity**: Three visualization categories (sorting, pathfinding, searching), each driven by `CATEGORY_CONFIG` and shared patterns
- **Maintainability**: Dual implementation (visualization steps + pure functions) for algorithms
- **Testability**: Broad unit/integration coverage via Vitest
- **Performance**: Optimized for smooth UI animations and lazy-loaded heavy panels
- **Extensibility**: New algorithms plug into registries (`searchingSubstrate` for searching substrate), constants, i18n, and Python/test harness
- **Accessibility**: Keyboard, ARIA, skip links, reduced-motion awareness
- **Internationalization**: Multi-language support with RTL
- **Theming**: CSS-variable-based light/dark system

The architecture is designed to add modes and algorithms without forking the core visualizer flow.
