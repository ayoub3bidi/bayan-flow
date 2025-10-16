# Algorithm Visualizer

<p align="center">
    <img src="./logo.png" alt="Algorithm Visualizer Logo" width="80"/> <br/>
    <strong>An interactive, educational web application for visualizing sorting algorithms in real-time</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-blue" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.1-purple" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4.1-cyan" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

## Features

- **Multiple Sorting Algorithms**: Visualize Bubble Sort, Quick Sort, and Merge Sort
- **Python Code Examples**: View, copy, and download Python implementations of each algorithm
- **Dual Control Modes**: 
  - **Autoplay**: Automatic step-by-step animation with play/pause/stop controls
  - **Manual**: User-controlled step advancement for detailed analysis
- **Interactive Controls**: Play, pause, step forward/backward through algorithm execution
- **Customizable Settings**: 
  - Choose between Autoplay and Manual control modes
  - Adjust animation speed (Slow, Medium, Fast, Very Fast)
  - Change array size (5-100 elements)
  - Generate new random arrays
- **Visual Feedback**: Color-coded states for comparing, swapping, sorted elements
- **Algorithm Analysis**: Interactive complexity panel with Big-O notation and performance graphs
- **Educational Content**: Real-world use cases and detailed algorithm descriptions
- **Code Learning**: Floating action button for easy access to Python implementations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Real-time Description**: Step-by-step explanation of algorithm operations
- **Accessibility**: Full keyboard navigation and screen reader support

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
git clone https://github.com/ayoub3bidi/algorithm-visualizer.git
cd algorithm-visualizer
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
algorithm-visualizer/
├── public/                 # Static assets
├── src/
│   ├── algorithms/        # Algorithm implementations
│   │   ├── python/        # Python code examples
│   │   │   ├── bubble_sort.py
│   │   │   ├── quick_sort.py
│   │   │   ├── merge_sort.py
│   │   │   └── ... other algorithms (soon)
│   │   ├── bubbleSort.js
│   │   ├── quickSort.js
│   │   ├── mergeSort.js
│   │   ├── index.js
│   │   └── algorithms.test.js
│   │   └── ... other algorithms (soon)
│   ├── components/        # React components
│   │   ├── ArrayBar.jsx
│   │   ├── ArrayVisualizer.jsx
│   │   ├── ComplexityPanel.jsx
│   │   ├── ControlPanel.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── InfoPanel.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   │   └── FloatingActionButton.jsx
│   │   └── PythonCodePanel.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useVisualization.js
│   ├── utils/            # Utility functions
│   │   ├── arrayHelpers.js
│   │   └── arrayHelpers.test.js
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

The `useVisualization` custom hook manages:
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

### Adding Pathfinding Algorithms

The project is structured to support pathfinding visualizations using D3.js:

1. Create a new component for grid visualization
2. Implement pathfinding algorithms (Dijkstra, A*, BFS, DFS)
3. Use D3.js for graph layout and rendering
4. Follow the same step-based animation pattern

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
