# Development Guide

## For contributors

- **Pull requests** must target the **`develop`** branch, not **`main`**.
- Read **[CONTRIBUTING.md](../CONTRIBUTING.md)** for contribution rules, CI expectations, and the PR workflow.
- Read **[AGENTS.md](../AGENTS.md)** for always-on agent rules (registries, contracts, ship-it ladder).
- Use **[docs/AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md)** for the full test command catalog, architecture map, and add-algorithm checklists.
- Use this guide for implementation patterns; use **[ARCHITECTURE.md](./ARCHITECTURE.md)** for how the app is structured end to end.
- New PRs should follow **[.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)** (GitHub loads it automatically—fill it in, do not strip required sections).

## Quick Start

### Prerequisites
- Node.js v24.11.1+
- pnpm v8.15.9+

### Setup
```bash
pnpm install
pnpm dev
```

Visit `http://localhost:5173`

## Project Commands

### Development
```bash
pnpm dev              # Start dev server with HMR
```

### Build
```bash
pnpm build           # Production build
pnpm preview         # Preview production build locally
```

### Code Quality
```bash
pnpm lint            # Run ESLint
pnpm lint:fix        # Auto-fix ESLint issues
pnpm format          # Format code with Prettier
pnpm format:check    # Check formatting
```

### Testing
```bash
pnpm test            # Run tests in watch mode
pnpm test:run        # Run tests once (98 test files under src/)
pnpm test:ui         # Open Vitest UI
pnpm test:coverage   # Generate coverage report (CI uses this)
```

### Maintenance scripts
```bash
pnpm run generate:export-sfx   # Regenerate public/video-export/sfx WAV assets (Playwright + Tone)
```

## Design Patterns & Best Practices

### 1. Component Design

#### Presentational vs Container Components

**Presentational (Dumb):**
```javascript
// ArrayBar.jsx - Just renders, no logic
function ArrayBar({ value, state, maxValue }) {
  return (
    <motion.div style={{ height: `${value/maxValue * 100}%` }}>
      {value}
    </motion.div>
  );
}
```

**Container (Smart):**
```javascript
// VisualizerApp.jsx - Manages state, coordinates
function VisualizerApp() {
  const [array, setArray] = useState([]);
  const visualization = useSortingVisualization(array);
  
  return <ArrayVisualizer array={visualization.array} />;
}
```

### 2. Custom Hooks Pattern

Extract reusable logic into hooks:

```javascript
// useSortingVisualization.js
export function useSortingVisualization(initialArray, speed, mode) {
  const [array, setArray] = useState(initialArray);
  // ... complex visualization logic
  
  return {
    array,
    play,
    pause,
    reset,
    // ... other methods
  };
}
```

**Benefits:**
- Logic reuse across components
- Easier testing
- Cleaner component code
- State encapsulation

### 3. Algorithm Implementation Pattern

**Two-Function Approach:**

```javascript
// bubbleSort.js

// 1. Visualization version - generates steps
export function bubbleSort(array) {
  const steps = [];
  // ... record each operation as a step with translations
  steps.push({
    array: [...arr],
    states: [...],
    description: getAlgorithmDescription(
      ALGORITHM_STEPS.COMPARING,
      { a: arr[j], b: arr[j+1] }
    )
  });
  return steps;
}

// 2. Pure version - for testing
export function bubbleSortPure(array) {
  // ... standard implementation
  return sortedArray;
}
```

**Why?**
- Separation of concerns
- Easy to test pure logic
- Visualization code doesn't clutter algorithm
- Can verify correctness independently
- Internationalization support through translation keys

### 4. State Management Strategy

**Local State for UI:**
```javascript
const [isOpen, setIsOpen] = useState(false);
```

**Lifted State for Shared Data:**
```javascript
// In VisualizerApp.jsx
const [array, setArray] = useState([]);
// Pass down to children
```

**Context for Global State:**
```javascript
// Theme state
<ThemeProvider>
  <App />
</ThemeProvider>

// Usage
const { theme, toggleTheme } = useTheme();
```

**Custom Hooks for Complex Logic:**
```javascript
const visualization = useSortingVisualization(array, speed, mode);
```

### 5. Animation Best Practices

**Use Framer Motion Declaratively:**
```javascript
// Good
<motion.div
  animate={{ scale: isActive ? 1.1 : 1 }}
  transition={{ duration: 0.3 }}
/>

// Avoid imperative animations
```

**Optimize for Performance:**
```javascript
// Use transform instead of width/height
animate={{ scale: 1.1 }}  // GPU-accelerated (preferred)
animate={{ width: 200 }}   // Triggers layout (avoid when possible)
```

**AnimatePresence for Enter/Exit:**
```javascript
<AnimatePresence mode="wait">
  {isFullScreen ? (
    <motion.div key="fullscreen" {...}>
      {/* Content */}
    </motion.div>
  ) : (
    <motion.div key="normal" {...}>
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 6. Theme Implementation

**Using CSS Variables:**
```javascript
// Define in index.css
:root {
  --color-primary: #2b7fff;
  --color-bg: #f9fafb;
}

.dark {
  --color-primary: #60a5fa;
  --color-bg: #0a0f1a;
}

// Use in Tailwind config or inline styles
<div className="bg-[var(--color-bg)]">
```

**Theme Context:**
```javascript
// Provider
<ThemeProvider>
  <App />
</ThemeProvider>

// Consumer
const { theme, toggleTheme, isDark } = useTheme();
```

### 7. Internationalization Pattern

**Translation Usage:**
```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
      <h1>{t('header.title')}</h1>
      <p>{t('info.step', { current: 5, total: 10 })}</p>
    </div>
  );
}
```

**Algorithm Translations:**
```javascript
import { 
  getAlgorithmDescription, 
  ALGORITHM_STEPS 
} from '../utils/algorithmTranslations';

description: getAlgorithmDescription(
  ALGORITHM_STEPS.COMPARING,
  { a: arr[j], b: arr[j+1] }
)
```

### 8. Code Organization

**File Structure:**
```
src/
├── pages/              # Route-level components
├── components/
│   ├── landing/       # Landing page specific
│   ├── roadmap/       # Roadmap page specific
│   ├── ui/            # Reusable primitives
│   └── [feature].jsx  # Feature components
├── registry/          # categoryConfig, visualizerRegistry, videoSceneRegistry, …
├── config/            # useAlgorithmConfig, useSettingsConfig
├── contexts/          # React contexts
├── hooks/             # Custom hooks (category hooks + useVisualization)
├── video/             # Remotion video export (useVideoExporter, scenes)
├── algorithms/        # sorting/, pathfinding/, searching/, treeTraversal/, graphAlgorithm/, python/, pseudocode/
├── utils/             # Pure utilities and generators
├── data/              # Static data (roadmapData.js)
├── constants/         # App constants + algorithmKnowledge.js + githubRepo.js
└── workers/           # pyodide.worker.js
```

### 9. Config Hooks Pattern

Algorithm and settings configuration is centralized in `src/config/`:

```javascript
// algorithmConfig.js - useAlgorithmConfig()
// Returns (from CATEGORY_CONFIG + i18n): algorithm lists and groups for all five categories
// sorting, pathfinding, searching, treeTraversal, graphAlgorithm

// settingsConfig.js - useSettingsConfig()
// Returns: gridSizeOptions, speedOptions
// Uses GRID_SIZES, ANIMATION_SPEEDS from constants
```

`SettingsPanel` uses these hooks; `AlgorithmDropdown` receives algorithms and groups as props. **Searching** has two substrates (see `src/registry/searchingSubstrate.js`): **array** algorithms use `ArrayVisualizer` plus extras such as **`targetValue`**; **node–link graph** algorithms (e.g. DFS) use `GraphVisualizer` with **`graphNodes`**, **`graphEdges`**, **`graphNodeStates`**, **`graphStackOrder`** from `getExtraVisualizerProps` (`src/registry/extraVisualizerProps.js`). The category router is `SearchingCategoryVisualizer`.

### 10. Video Export

Video export uses **Remotion** (`@remotion/web-renderer`) to render MP4 files in-browser.

**Flow:**
1. User clicks Export → `beginExportFlow()` opens modal with orientation choice
2. User selects Horizontal (16:9) or Vertical (9:16)
3. `exportVideo({ ..., orientation })` runs: capability check → render → preview
4. User previews video, then downloads or closes

**Key files:**
- `src/video/useVideoExporter.js` – Hook: `beginExportFlow`, `exportVideo`, `closePreview`, `downloadVideo`
- `src/video/AlgorithmVideo.jsx` – Root Remotion composition
- `src/registry/videoSceneRegistry.jsx` – Category → scene routing
- Scenes: `SortingScene`, `PathfindingScene`, `SearchingVideoScene`, `GraphSearchingScene`, `TreeTraversalScene`, `GraphAlgorithmVideoScene`, `GraphAlgorithmScene`, `GraphAlgorithmMatrixScene`, `ComplexityScene`
- `src/components/ExportProgressModal.jsx` – Orientation, progress, preview (RTL-aware)
- `src/video/audio/buildExportSoundCues.js` – Schedules cues from `getSoundEventsForStep()`

**Constants** (`src/video/constants.js`): dimensions, `VIDEO_FPS`, `VIDEO_EXPORT_FRAMES_PER_STEP`, `COMPLEXITY_DURATION_FRAMES`

### 11. Testing Approach

**Test Pure Functions:**
```javascript
describe('bubbleSortPure', () => {
  it('should sort array correctly', () => {
    expect(bubbleSortPure([3,1,2])).toEqual([1,2,3]);
  });
});
```

**Test Custom Hooks:**
```javascript
describe('useTheme', () => {
  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    });
    
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });
});
```

**Test Components:**
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

**Test Setup (`src/test/setup.js`):**
- Mocks: constants, tone, soundManager, gridHelpers (global)
- Use `vi.unmock('../constants')` in constants tests to test the real module
- `renderWithI18n` from `testUtils.jsx` wraps components with I18nextProvider

## Adding New Features

### Adding a New Sorting Algorithm

**Step 1: Implement Algorithm**

Create `src/algorithms/sorting/insertionSort.js`:
```javascript
import { ELEMENT_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';

export function insertionSort(array) {
  const steps = [];
  const arr = [...array];
  
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > key) {
      // Record comparison
      steps.push({
        array: [...arr],
        states: createStates(j, i),
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.COMPARING,
          { a: arr[j], b: key }
        )
      });
      
      arr[j + 1] = arr[j];
      j--;
    }
    
    arr[j + 1] = key;
  }
  
  return steps;
}

export function insertionSortPure(array) {
  // Standard insertion sort
  return sortedArray;
}
```

**Step 2: Export from Index**

In `src/algorithms/sorting/index.js`:
```javascript
import { insertionSort, insertionSortPure } from './insertionSort';

export const sortingAlgorithms = {
  // ... existing
  insertionSort,
};

export const pureSortingAlgorithms = {
  // ... existing
  insertionSort: insertionSortPure,
};
```

**Step 3: Add to category config**

In `src/registry/categoryConfig.js`, under `ALGORITHM_TYPES.SORTING`:

- Append the algorithm key to `algorithmKeys`
- Add it to the correct entry in `groupDefs[].algorithms`

`useAlgorithmConfig` builds dropdown data from this file (no manual list in `algorithmConfig.js`).

**Step 4: Add Complexity Metadata**

In `src/constants/index.js`:
```javascript
export const ALGORITHM_COMPLEXITY = {
  // ... existing
  insertionSort: {
    name: 'Insertion Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Small datasets or nearly sorted arrays',
      'Online algorithms where data arrives sequentially',
    ],
    description: 'Builds the final sorted array one item at a time...',
  },
};
```

**Step 5: Add Python Implementation**

Create `src/algorithms/python/insertion_sort.py`:
```python
def insertion_sort(arr):
    """
    Insertion Sort Algorithm
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    array = arr.copy()
    
    for i in range(1, len(array)):
        key = array[i]
        j = i - 1
        
        while j >= 0 and array[j] > key:
            array[j + 1] = array[j]
            j -= 1
        
        array[j + 1] = key
    
    return array
```

Import in `src/algorithms/python/index.js`:
```javascript
import insertionSortPython from './insertion_sort.py?raw';

export const pythonAlgorithms = {
  // ... existing
  insertionSort: insertionSortPython,
};
```

Add test cases in `src/algorithms/python/testCases.js`:
```javascript
insertionSort: {
  functionName: 'insertion_sort',
  testCases: SORTING_TEST_CASES,  // or custom cases
},
```

**Step 6: Add Translations**

In all language files (`src/i18n/locales/*/translation.json`):
```json
{
  "algorithms": {
    "sorting": {
      "insertionSort": "Insertion Sort"
    }
  },
  "complexity": {
    "insertionSort": "O(n²)"
  }
}
```

**Step 6b: Add pseudocode strings**

In `src/algorithms/pseudocode/strings.en.js`, `strings.fr.js`, and `strings.ar.js`.

**Step 6c: Add insight metadata (optional but recommended)**

In `src/constants/algorithmKnowledge.js` plus `insight_panel.algorithms.<key>.*` keys in all locale files.

**Step 7: Write Tests**

In `src/algorithms/sorting/algorithms.test.js`:
```javascript
describe('Insertion Sort', () => {
  testCases.forEach(({ name, input, expected }) => {
    it(`should sort ${name}`, () => {
      const result = insertionSortPure(input);
      expect(result).toEqual(expected);
      expect(isSorted(result)).toBe(true);
    });
  });
});
```

**Step 8: Add Algorithm Step Constants**

In `src/utils/algorithmTranslations.js`:
```javascript
export const ALGORITHM_STEPS = {
  // Existing steps...
  
  // Add your algorithm-specific steps
  YOUR_ALGORITHM_STEP: 'yourAlgorithmStep',
  YOUR_OTHER_STEP: 'yourOtherStep',
};
```

Add translations in all language files:
```json
{
  "algorithmSteps": {
    "yourAlgorithmStep": "Your step description with {{variables}}",
    "yourOtherStep": "Another step description"
  }
}
```

**Step 9: Test & Verify**
```bash
pnpm test:run
pnpm dev
```

**Example: Recently Added Algorithms**

The following algorithms were recently added using this pattern:
- **Counting Sort**: Non-comparison, O(n+k) time complexity
- **Bucket Sort**: Distribution-based, optimal for uniform data
- **Cycle Sort**: Write-optimal, minimizes memory writes
- **Comb Sort**: Gap-based improvement over Bubble Sort
- **Tim Sort**: Hybrid algorithm (Python/Java default)
- **Bogo Sort**: Educational algorithm with shuffle limit

### Adding a New Pathfinding Algorithm

Follow similar steps but use `src/algorithms/pathfinding/` directory. Lists and groups come from **`src/registry/categoryConfig.js`** (via `useAlgorithmConfig`). Also:

- Use 2D grid state instead of 1D array
- Implement grid-based visualization
- Add to `PATHFINDING_COMPLEXITY` in `src/constants/index.js`
- Register in `src/algorithms/pathfinding/index.js` and Python / `testCases.js` / i18n as needed
- Update pathfinding tests

### Adding a Searching Algorithm

Searching is **one category** with two **substrates** (`SEARCHING_SUBSTRATES` in `src/registry/searchingSubstrate.js`):

| Substrate | Visualizer | Typical step shape | Settings size |
|-----------|------------|--------------------|----------------|
| **Array** (`ARRAY`) | `ArrayVisualizer` | `array`, `states`, `description`, optional `targetValue` | Array size slider |
| **Node–link graph** (`NODE_LINK`) | `GraphVisualizer` | `nodes`, `edges`, `nodeStates`, `stackOrder?`, `description`, optional `goalNodeId` | Graph node count (`searchGraphNodeCount`; not pathfinding grid size) |

#### Array-based searching (sorted bars)

1. **Implement** `src/algorithms/searching/yourSearch.js`: export a `*Pure` function for tests and a visualization function that returns steps with `array`, `states`, `description`, and (if applicable) **`targetValue`**.
2. **Register** in `src/algorithms/searching/index.js` (`searchingAlgorithms` + `pureSearchingAlgorithms`).
3. **Category config** — `src/registry/categoryConfig.js`: add the key under `ALGORITHM_TYPES.SEARCHING`. `generateData` stays **sorted** (existing helper).
4. **Substrate** — ensure `getSearchingSubstrate(key)` returns **`ARRAY`** (default for keys not listed in the node–link set inside `searchingSubstrate.js`).
5. **Constants** — `SEARCHING_ALGORITHMS`, `SEARCHING_COMPLEXITY` in `src/constants/index.js`.
6. **Translations**, **`algorithmTranslations.js`**, **Python** + **`testCases.js`** (e.g. `(arr, target)`), **insight panel** metadata — same spirit as other searching algos.
7. **Video** — steps go through **`SearchingVideoScene`** → **`SortingScene`** (same bar layout as sorting).
8. **Tests** — unit + hook tests for 1D `states` / `targetValue` behavior.

#### Node–link graph searching (e.g. DFS)

1. **Implement** steps as full snapshots: cloned **`nodes`**, **`edges`**, **`nodeStates`** (`GRAPH_NODE_STATES` in `src/constants/index.js`), optional **`stackOrder`** (stack top = last element). Reuse or extend **`generateRandomSearchTree`** in `src/utils/graphSearchGenerators.js` for reproducible graphs.
2. **Register** in `searching/index.js` and add the key to the **node–link** set in **`searchingSubstrate.js`** so `isNodeLinkSearchingAlgorithm` is true.
3. **`useSearchingVisualization`** — graph branch: `regenerateGraphStructure`, load steps from `fn({ adjacency, rootId, goalId, nodes, edges })` (or the agreed signature). **`VisualizerApp`** passes **`searchGraphNodeCount`**, not **`gridSize`**.
4. **`getExtraVisualizerProps`** — for node–link keys, pass **`graphNodes`**, **`graphEdges`**, **`graphNodeStates`**, **`graphStackOrder`** (see existing DFS wiring).
5. **`SearchingCategoryVisualizer`** — branch to **`GraphVisualizer`**; do not use **`GridVisualizer`** for searching graphs.
6. **Video** — **`SearchingVideoScene`** detects graph steps and renders **`GraphSearchingScene`**.
7. **Python** — adjacency-dict style inputs if applicable; align **`testCases.js`** with the harness.
8. **Tests** — pure graph DFS, substrate registry, hook graph payload, Remotion routing if you add coverage.

**Shared for any searching algorithm:** `complexityDataset: 'searching'`, **`videoSceneRegistry`** still points at the searching entry (internal router handles array vs graph). Run **`pnpm lint`**, **`format:check`**, **`test:run`**, **`build`** before merge.

### Adding a Tree Traversal Algorithm

1. **Implement** in `src/algorithms/treeTraversal/yourTraversal.js` with visualization steps and a `*Pure` test function.
2. **Register** in `src/algorithms/treeTraversal/index.js`.
3. **Category config** — add key to `algorithmKeys` and appropriate `groupDefs` in `categoryConfig.js` under `TREE_TRAVERSAL`.
4. **Constants** — `TREE_TRAVERSAL_ALGORITHMS`, `TREE_TRAVERSAL_COMPLEXITY` in `src/constants/index.js`.
5. **Translations**, **pseudocode** (all three string files), **Python** + **`testCases.js`**, **insight metadata** in `algorithmKnowledge.js`.
6. **Sound** — update `src/utils/soundEvents.js` if new visual states are introduced.
7. **Video** — `TreeTraversalScene` (registered in `videoSceneRegistry.jsx`).
8. **Tests** — algorithm logic, hook behavior, visualizer, export scene.

Tree data comes from `generateTreeForTraversal()`; size is controlled via `treeNodeCount` (`sizeBinding: 'tree'`).

### Adding a Graph Algorithm

Graph algorithms use `src/registry/graphAlgorithmRegistry.js` profiles:

1. **Implement** in `src/algorithms/graphAlgorithm/yourAlgorithm.js`.
2. **Export** from `src/algorithms/graphAlgorithm/index.js`.
3. **Profile** — add to `GRAPH_ALGORITHM_PROFILES` with representation (`nodeLink` or `matrix`), directed/weighted flags, scenario IDs, and `createInput()`.
4. **Groups** — ensure the key appears in `GRAPH_ALGORITHM_GROUPS` (or is picked up by `buildGroupDefs()`).
5. **Category config** — `algorithmKeys` uses `GRAPH_ALGORITHM_KEYS`; no manual list duplication needed if profile is registered.
6. **Constants**, **i18n**, **pseudocode**, **Python**, **insight**, **sound events** — same checklist as other categories.
7. **Video** — `GraphAlgorithmVideoScene` routes node–link steps to `GraphAlgorithmScene` and matrix steps to `GraphAlgorithmMatrixScene`.
8. **Tests** — JS logic, profile/scenario wiring, hook, visualizers (both representations if matrix), export, sound events.

Keep generators deterministic in tests (pass `rng`). Preset scenarios in `graphTestScenarios.js` are fixed — when a scenario is active, `graphNodeCount` must not change the graph.

### CI and deployment

Pull requests and pushes to `develop`/`main` run `.github/workflows/ci.yml`:

| Job | Command |
| --- | ------- |
| Quality | `pnpm lint`, `pnpm format:check` |
| Test | `pnpm test:coverage` |
| Build | `pnpm build` |
| Deploy | Cloudflare Workers (`main` → production, `develop` → staging); PR previews via `preview-cloudflare.yml` |

Before opening a PR, run locally:

```bash
pnpm test:run && pnpm build && pnpm lint && pnpm format:check
```

Registry changes should also pass targeted tests listed in **[AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md)** (Testing Workflow section).

### Adding a New Language

**Step 1: Create Translation File**

Create `src/i18n/locales/[lang]/translation.json`:
```json
{
  "header": {
    "title": "Bayan Flow",
    "subtitle": "Your translated subtitle"
  },
  "settings": {
    "algorithm": "Your translation",
    "speed": "Your translation"
  }
  // ... all other translations
}
```

**Step 2: Import in i18n Config**

In `src/i18n/index.js`:
```javascript
import newLang from './locales/[lang]/translation.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  [lang]: { translation: newLang }, // Add your language
};

i18n.init({
  resources,
  supportedLngs: ['en', 'fr', 'ar', '[lang]'],
  // ...
});
```

**Step 3: Add to Language Switcher**

In `src/components/LanguageSwitcher.jsx`:
```javascript
const allLanguages = [
  { code: 'en', name: t('languages.en'), flag: 'EN' },
  { code: 'fr', name: t('languages.fr'), flag: 'FR' },
  { code: 'ar', name: t('languages.ar'), flag: 'AR' },
  { code: '[lang]', name: t('languages.[lang]'), flag: '?' },
];
```

**Step 4: Add RTL Support (if needed)**

If the language is RTL, add to `src/utils/rtlManager.js`:
```javascript
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', '[your-rtl-lang]'];
```

**Step 5: Add Language Name Translations**

In all existing translation files:
```json
{
  "languages": {
    "en": "English",
    "fr": "Français",
    "ar": "العربية",
    "[lang]": "Your Language Name"
  }
}
```

**Step 6: Test**

```bash
pnpm test src/i18n/i18n.test.js
```

### Adding a New Page/Route

**Step 1: Create Page Component**

Create `src/pages/NewPage.jsx`:
```javascript
import Header from '../components/Header';
import Footer from '../components/Footer';

function NewPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Your content */}
      </main>
      <Footer />
    </div>
  );
}

export default NewPage;
```

**Step 2: Add Route**

In `src/main.jsx`:
```javascript
import NewPage from './pages/NewPage.jsx';

<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/app" element={<VisualizerApp />} />
  <Route path="/roadmap" element={<Roadmap />} />
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

**Step 3: Add Navigation Link**

Add link in relevant components (Header, Footer, etc.):
```javascript
<Link to="/new-page">New Page</Link>
```

### Customizing the Theme

**Step 1: Update CSS Variables**

In `src/index.css`:
```css
:root {
  --color-primary: #your-color;
  --color-bg: #your-color;
  /* ... other variables */
}

.dark {
  --color-primary: #your-dark-color;
  --color-bg: #your-dark-color;
  /* ... other variables */
}
```

**Step 2: Use in Components**

```javascript
// Direct CSS class
<div className="bg-[var(--color-bg)]" />

// Inline style
<div style={{ backgroundColor: 'var(--color-bg)' }} />

// Tailwind with CSS variable
// Add to tailwind.config.js first
```

## Debugging Tips

### React DevTools
1. Install React DevTools browser extension
2. Inspect component hierarchy
3. Check props and state
4. Profile performance

### Vitest Debugging
```javascript
// Add .only to run single test
it.only('debugs this test', () => {
  console.log('Debug info');
  expect(result).toBe(expected);
});
```

### Animation Debugging
```javascript
// Add console.log in visualization hook
const play = useCallback(async () => {
  for (let step of steps) {
    console.log('Step:', step);  // Debug
    await delay(speed);
  }
}, [steps, speed]);
```

### Theme Debugging
```javascript
// Check theme state in DevTools
const { theme, isDark, isLight, isSystemDark } = useTheme();
console.log({ theme, isDark, isLight, isSystemDark });
```

### i18n Debugging
```javascript
// Check current language and direction
const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
console.log('Direction:', i18n.dir());
console.log('Is RTL:', i18n.dir() === 'rtl');
```

## Performance Tips

### 1. Memoization
```javascript
// Expensive calculation
const maxValue = useMemo(() => 
  Math.max(...array), 
  [array]
);

// Callbacks
const handleClick = useCallback(() => {
  doSomething(array);
}, [array]);
```

### 2. Lazy Loading
```javascript
// Split heavy components
const PythonCodePanel = lazy(() => 
  import('./components/PythonCodePanel')
);

<Suspense fallback={<LoadingSpinner />}>
  <PythonCodePanel />
</Suspense>
```

Pyodide is lazy-loaded on first run; `usePythonExecution` manages execution and test validation.

### 3. Code Splitting
```javascript
// Automatic code splitting with React Router
const LandingPage = lazy(() => import('./pages/LandingPage'));
const VisualizerApp = lazy(() => import('./pages/VisualizerApp'));
```

### 4. Debounce Inputs
```javascript
const debouncedSize = useDebounce(arraySize, 300);
```

### 5. Optimize Re-renders
```javascript
// Prevent unnecessary re-renders
export default React.memo(Component);

// Or with custom comparison
export default React.memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

## Common Issues & Solutions

### Issue: Tests Fail Randomly
**Solution:** Test is flaky, use more lenient assertions or mock timers

### Issue: Animation Stutters
**Solution:** Reduce array/grid size or increase speed setting

### Issue: Build Fails
**Solution:** Check Tailwind v4 configuration and CSS syntax

### Issue: Types Not Working
**Solution:** Restart TypeScript server in your IDE

### Issue: Audio Not Working
**Solution:** 
- Check browser autoplay policy
- Ensure user interaction before enabling
- Verify Web Audio API support

### Issue: Theme Not Persisting
**Solution:**
- Check localStorage availability
- Verify ThemeProvider is wrapping app
- Check console for errors

### Issue: RTL Layout Issues
**Solution:**
- Verify language is in RTL_LANGUAGES array
- Check dir attribute on html element
- Use RTL-aware Tailwind classes or flexbox

### Issue: Translation Missing
**Solution:**
- Verify translation key exists in all language files
- Check i18n configuration
- Use fallback text with default parameter

## Sound System Integration

Sound is derived from **`getSoundEventsForStep()`** in `src/utils/soundEvents.js`, not from localized step descriptions. **`useVisualization`** emits events during forward playback and manual stepping only.

### Adding Sound for New Visual States

**Step 1:** Map the new state in `getSoundEventsForStep()` (and add a kind to `SOUND_EVENT_KINDS` if needed).

**Step 2:** Ensure `soundManager.playEvent()` handles the kind (see `toneInstrumentPresets.js`).

**Step 3:** Update `src/utils/soundEvents.test.js` and `src/video/audio/buildExportSoundCues.test.js`.

**Step 4:** If export WAV assets change, run `pnpm run generate:export-sfx`.

Do not add sounds for UI clicks, panel toggles, export buttons, or regeneration — visualization steps only.

## Best Practices Checklist

### Before Committing

- [ ] Run `pnpm lint:fix`
- [ ] Run `pnpm format`
- [ ] Run `pnpm format:check`
- [ ] Run `pnpm test:run` (full suite green)
- [ ] Check console for warnings/errors
- [ ] Test in light and dark mode
- [ ] Test in all supported languages (EN/FR/AR)
- [ ] Test on mobile (responsive design)
- [ ] Verify accessibility (keyboard navigation, ARIA labels)
- [ ] Check performance (no janky animations)
- [ ] Update relevant documentation
- [ ] For new algorithms: Verify step translations, pseudocode, Python index, insight metadata, and sound events
- [ ] For registry changes: Run targeted tests from [AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md) (`categoryRuntimeCompleteness`, etc.)

### Code Review Checklist

- [ ] Pure functions used where possible
- [ ] Custom hooks for reusable logic
- [ ] Proper error handling
- [ ] Loading states for async operations
- [ ] Accessibility attributes (ARIA, roles)
- [ ] Responsive design (mobile-first)
- [ ] Theme-aware styling
- [ ] Internationalization support
- [ ] Performance optimizations (memo, callback)
- [ ] Tests for new features (aim for 100% coverage)
- [ ] Documentation updated
- [ ] Algorithm step constants added for new algorithms
- [ ] Python implementations and test cases included
- [ ] Sound integration considered

## Supabase Edge Functions

The repo includes edge functions under `supabase/functions/`:

| Function | JWT | Purpose |
|----------|-----|---------|
| `delete-account` | yes | Self-service account deletion |
| `before-signup` | no | Auth hook: signup rate limits + IP checks |
| `post-signup` | no | Database webhook: record signup IP + progressive IP ban |
| `platform-access` | yes | Account ban gate for signed-in users |
| `waitlist-welcome` | no | Pro waitlist confirmation email (Resend; fail-open) |

### Deploy (CI or manual)

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Apply migrations: `supabase db push` (includes `20260710120000_platform_security_foundation.sql`).
3. Add GitHub secret `SUPABASE_ACCESS_TOKEN` (personal access token from Supabase Account → Tokens). Project ref is derived from existing `VITE_SUPABASE_URL` in CI.
4. Set project secrets (once per environment):

   ```bash
   supabase secrets set BEFORE_USER_CREATED_HOOK_SECRET="<openssl rand -hex 32>"
   supabase secrets set POST_SIGNUP_WEBHOOK_SECRET="<openssl rand -hex 32>"
   # Pro waitlist welcome email (Resend)
   supabase secrets set RESEND_API_KEY="re_..."
   supabase secrets set FROM_EMAIL="Bayan Flow <contact@bayanflow.com>"
   # optional alerts
   supabase secrets set TELEGRAM_BOT_TOKEN="..."
   supabase secrets set TELEGRAM_CHAT_ID="..."
   ```

5. Deploy functions:

   ```bash
   supabase link --project-ref qketsapzqpzmccljfjcm
   supabase functions deploy before-signup --no-verify-jwt
   supabase functions deploy post-signup --no-verify-jwt
   supabase functions deploy platform-access
   supabase functions deploy delete-account
   supabase functions deploy waitlist-welcome --no-verify-jwt
   ```

6. Wire dashboard integrations (one-time):
   - **Auth → Hooks → Before user created** → `https://qketsapzqpzmccljfjcm.supabase.co/functions/v1/before-signup` with the same `BEFORE_USER_CREATED_HOOK_SECRET` (`v1,whsec_<base64>` format).
   - **Post-signup:** migration `20260710130000_post_signup_webhook_trigger.sql` installs a `pg_net` trigger on `profiles` INSERT. After first deploy, store the shared secret in Vault (must match `POST_SIGNUP_WEBHOOK_SECRET`):

     ```sql
     select vault.create_secret(
       '<POST_SIGNUP_WEBHOOK_SECRET>',
       'post_signup_webhook_secret',
       'Shared secret for post-signup edge function webhook'
     );
     ```

7. Enable **Integrations → Cron** if pg_cron jobs from the security migration do not appear.

### IP spike (before production cutover)

1. Deploy `before-signup` and wire the auth hook.
2. Perform one first-time Google sign-in on dev (or use Dashboard hook tester).
3. Confirm logs show non-null `metadata.ip_address` for production-like sign-ins. Localhost may be null (allowed; IP rules skipped).

### Security admin runbook

**Manual account ban (two-step):**

```sql
-- 1) Mark profile banned (blocks RLS writes + client gate)
update public.profiles
set is_banned = true, banned_at = now()
where email = 'badactor@example.com';

-- 2) Ban in Supabase Auth (Dashboard → Authentication → Users → Ban user)
--    Or via Admin API: ban_duration on the user
```

**Unban (reverse both steps):**

```sql
update public.profiles
set is_banned = false, banned_at = null
where email = 'badactor@example.com';
```

Then remove Auth ban in Dashboard (or set `ban_duration` to `none`).

**Block new signups from an IP (optional):**

```sql
insert into public.banned_ips (ip, reason, banned_by, expires_at)
values ('203.0.113.10', 'manual', 'admin', now() + interval '7 days');
```

**Trusted IP (bootcamp / shared NAT false positive):**

```sql
insert into public.trusted_ips (ip, reason, added_by)
values ('203.0.113.50', 'bootcamp wifi', 'admin');
```

**Notes:**

- `banned_ips` blocks **new signups only** (before-user-created hook). Anonymous app use is unaffected.
- `profiles.is_banned` is **manual admin only** — never auto-set from IP rules.
- `signup_ip` is anonymized after 90 days; removed on account delete.
- Client `platform-access` errors **fail open**; auth hook errors **fail closed** (signups blocked).

Manual smoke tests:

- Sign in → Profile Settings → Danger zone → delete account (CORS allowlist includes dev + prod).
- Banned account sees suspension screen; sign-out still works.
- Signup from banned IP shows generic “temporarily unavailable” message.

## Conclusion

This project follows modern React best practices:
- Functional components & hooks
- Composition over inheritance
- Separation of concerns
- Test-driven development
- Performance optimization
- Clean code principles
- Accessible design
- Internationalization
- Responsive layouts
- Theme support

All contributions are welcome! Follow these guidelines to maintain code quality and consistency.