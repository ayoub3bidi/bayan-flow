# Bayan Flow

<p align="center">
    <img src="./logo.png" alt="Bayan Flow Logo" width="120"/> <br/>
    <strong>Learn algorithms with clarity through interactive, real-time visualizations</strong><br/>
    <em>Bayan (بيان) means clarity in Arabic</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-blue" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.1-purple" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4.1-cyan" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-Elastic--2.0-blue" alt="License" />
</p>

> **License**: Elastic License 2.0 OR Commercial — see [LICENSE](./LICENSE) and [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md)

- **Production (main)**: [bayanflow.netlify.app](https://bayanflow.netlify.app) (permanent production site connected to the `main` branch)
- **Dev (develop)**: [dev-bayanflow.netlify.app](https://dev-bayanflow.netlify.app) (permanent dev site connected to the `develop` branch)

## Features

### Sorting Mode
- **Multiple Sorting Algorithms**: Visualize Bubble Sort, Quick Sort, and Merge Sort
- **Array Customization**: Adjust array size (5-100 elements) and generate new random arrays
- **Visual Feedback**: Color-coded states for comparing, swapping, sorted elements

### Pathfinding Mode
- **Multiple Pathfinding Algorithms**: Visualize BFS, Dijkstra's Algorithm, and A* Search
- **Grid Visualization**: Interactive grid-based pathfinding with configurable sizes (15×15, 25×25, 35×35)
- **Random Start/End**: Automatically generates random start and end positions for each grid
- **Visual States**: Color-coded cells showing open (queue), closed (visited), and final path
- **Step-by-Step Animation**: Watch algorithms explore the grid in real-time

### Common Features
- **Dual Control Modes**: 
  - **Manual**: User-controlled step advancement for detailed analysis (default)
  - **Autoplay**: Automatic step-by-step animation with play/pause/stop controls
- **Interactive Controls**: Play, pause, step forward/backward through algorithm execution
- **Mobile Swipe Gestures**: Swipe left/right on mobile devices to navigate steps in manual mode with an attractive tutorial overlay
- **Customizable Settings**: 
  - Switch between Sorting and Pathfinding modes
  - Choose between Manual (default) and Autoplay control modes
  - Adjust animation speed (Slow, Medium, Fast, Very Fast)
- **Algorithm Analysis**: Interactive complexity panel with Big-O notation and performance graphs
- **Python Code Examples**: View Python implementations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Real-time Description**: Step-by-step explanation of algorithm operations

## Installation

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

### Setup

1. Clone the repository:

```bash
git clone https://github.com/ayoub3bidi/bayan-flow.git
cd bayan-flow
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Running the Application

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check
```

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Project Structure

```
bayan-flow/
├── public/                 # Static assets
├── src/
│   ├── algorithms/        # Algorithm implementations
│   │   ├── sorting/       # Sorting algorithms
│   │   │   ├── bubbleSort.js
│   │   │   ├── quickSort.js
│   │   │   ├── mergeSort.js
│   │   │   ├── index.js
│   │   │   └── algorithms.test.js
│   │   ├── pathfinding/   # Pathfinding algorithms
│   │   │   ├── bfs.js
│   │   │   ├── dijkstra.js
│   │   │   ├── aStar.js
│   │   │   ├── index.js
│   │   │   └── pathfinding.test.js
│   │   ├── python/        # Python code examples
│   │   │   ├── bubble_sort.py
│   │   │   ├── quick_sort.py
│   │   │   ├── merge_sort.py
│   │   │   └── ... other algorithms (soon)
│   │   └── index.js
│   ├── components/        # React components
│   │   ├── ArrayBar.jsx
│   │   ├── ArrayVisualizer.jsx
│   │   ├── GridCell.jsx
│   │   ├── GridVisualizer.jsx
│   │   ├── ComplexityPanel.jsx
│   │   ├── ControlPanel.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── InfoPanel.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   │   └── FloatingActionButton.jsx
│   │   └── PythonCodePanel.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useSortingVisualization.js
│   │   └── usePathfindingVisualization.js
│   ├── utils/            # Utility functions
│   │   ├── arrayHelpers.js
│   │   ├── arrayHelpers.test.js
│   │   ├── gridHelpers.js
│   │   └── gridHelpers.test.js
│   ├── constants/        # App constants
│   │   └── index.js
│   ├── test/            # Test configuration
│   │   └── setup.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
├── .prettierrc          # Prettier configuration
├── eslint.config.js     # ESLint configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
├── vitest.config.js     # Vitest configuration
└── package.json         # Project dependencies
```

## How It Works

### Algorithm Implementation

Each sorting algorithm is implemented in two versions:

1. **Visualization Version**: Generates step-by-step animation frames
2. **Pure Version**: Standard implementation for testing

Example (Bubble Sort):

```javascript
// Generates animation steps
export function bubbleSort(array) {
  const steps = [];
  // ... algorithm with step recording
  return steps;
}

// Pure implementation for testing
export function bubbleSortPure(array) {
  // ... standard bubble sort
  return sortedArray;
}
```

### Visualization Hook

The `useSortingVisualization` custom hook manages:
- Animation playback state (autoplay/manual modes)
- Step navigation (forward/backward)
- Speed control (autoplay mode only)
- Play/pause/stop functionality
- Mode-specific behavior and UI controls

### Component Architecture

- **App.jsx**: Main orchestrator, manages global state
- **ArrayVisualizer**: Renders the bar chart visualization
- **ControlPanel**: Mode-aware playback controls (play, pause, step)
- **SettingsPanel**: Algorithm selection, mode toggle, and speed configuration
- **InfoPanel**: Displays current step description
- **ComplexityPanel**: Interactive algorithm analysis with performance graphs

## Extending the Project

### Adding a New Sorting Algorithm

1. Create a new file in `src/algorithms/` (e.g., `insertionSort.js`):

```javascript
import { ELEMENT_STATES } from '../constants';

export function insertionSort(array) {
  const steps = [];
  const arr = [...array];
  
  // Implement algorithm with step recording
  // Each step should include: { array, states, description }
  
  return steps;
}

export function insertionSortPure(array) {
  // Pure implementation for testing
  return sortedArray;
}
```

2. Export it in `src/algorithms/index.js`:

```javascript
import { insertionSort, insertionSortPure } from './insertionSort';

export const algorithms = {
  // ... existing algorithms
  insertionSort,
};
```

3. Add it to the SettingsPanel dropdown in `src/components/SettingsPanel.jsx`:

```javascript
const algorithms = [
  // ... existing algorithms
  { value: 'insertionSort', label: 'Insertion Sort', complexity: 'O(n²)' },
];
```

4. Write tests in `src/algorithms/algorithms.test.js`

5. Add complexity metadata in `src/constants/index.js`:

```javascript
export const ALGORITHM_COMPLEXITY = {
  // ... existing algorithms
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
      'As a subroutine in hybrid algorithms like Timsort',
      'When simplicity and low overhead are priorities',
    ],
    description: 'Builds the final sorted array one item at a time...',
  },
};
```

### Using the ComplexityPanel

The ComplexityPanel automatically appears when a visualization completes:

```javascript
// Subscribe to visualization completion
useEffect(() => {
  if (visualization.isComplete && !visualization.isPlaying) {
    setShowComplexityPanel(true);
  }
}, [visualization.isComplete, visualization.isPlaying]);

// Manual control
const openComplexityPanel = () => setShowComplexityPanel(true);
const closeComplexityPanel = () => setShowComplexityPanel(false);
```

**Features:**
- Interactive performance graph with hover tooltips
- Keyboard navigation (arrow keys to move between data points)
- Copy complexity analysis to clipboard
- Expandable details with use cases and descriptions
- Linear/logarithmic scale toggle for the graph

### Adding More Pathfinding Algorithms

To add a new pathfinding algorithm:

1. Create a new file in `src/algorithms/pathfinding/` (e.g., `dfs.js`):

```javascript
import { GRID_ELEMENT_STATES } from '../../constants';

export function dfs(grid, start, end, rows, cols) {
  const steps = [];
  // Implement algorithm with step recording
  // Each step should include: { grid, states, description }
  return steps;
}

export function dfsPure(start, end, rows, cols) {
  // Pure implementation for testing
  return path;
}
```

2. Export it in `src/algorithms/pathfinding/index.js`:

```javascript
import { dfs, dfsPure } from './dfs';

export const pathfindingAlgorithms = {
  // ... existing algorithms
  dfs,
};
```

3. Add it to the SettingsPanel dropdown in `src/components/SettingsPanel.jsx`:

```javascript
const pathfindingAlgorithms = [
  // ... existing algorithms
  { value: 'dfs', label: 'Depth-First Search', complexity: 'O(V + E)' },
];
```

4. Write tests in `src/algorithms/pathfinding/pathfinding.test.js`

5. Add complexity metadata in `src/constants/index.js`:

```javascript
export const PATHFINDING_COMPLEXITY = {
  // ... existing algorithms
  dfs: {
    name: 'Depth-First Search',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description: 'DFS explores as far as possible along each branch...',
    useCases: [
      'Maze solving',
      'Topological sorting',
      'Detecting cycles in graphs',
    ],
  },
};
```

### Customizing Colors

Modify `src/constants/index.js`:

```javascript
export const STATE_COLORS = {
  [ELEMENT_STATES.DEFAULT]: '#yourColor',
  [ELEMENT_STATES.COMPARING]: '#yourColor',
  // ... other states
};
```

## Testing Philosophy

The project includes comprehensive tests for:

- **Algorithm correctness**: Verify sorting produces correct results
- **Edge cases**: Empty arrays, single elements, duplicates
- **Consistency**: All algorithms produce identical results
- **Utility functions**: Array generation and validation
- **Visualization hook**: Autoplay/manual mode behavior, timing, and controls

Run tests with:

```bash
pnpm test
```

## License

This project is dual-licensed:

### Elastic License 2.0
Licensed under the [Elastic License 2.0](./LICENSE).

- ✅ Free to use, modify, and distribute
- ✅ Suitable for educational and development use
- ❌ Cannot be provided as a hosted/managed service
- ✅ Can be used internally within organizations

### Commercial License
For organizations requiring rights to host as a paid service, white-labeling, custom terms, or indemnity, contact:
**[contact@ayoub3bidi.me](mailto:contact@ayoub3bidi.me)**

See [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md) for more information.

### Trademark
The "Bayan Flow" name and logo are trademarks. See [TRADEMARK.md](./TRADEMARK.md) for usage guidelines.

---

**Made with ❤️ by [Ayoub Abidi](https://github.com/ayoub3bidi)**
