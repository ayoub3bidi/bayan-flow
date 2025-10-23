# Architecture Overview

This document provides an in-depth explanation of the Algorithm Visualizer architecture, design patterns, and implementation details.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow](#data-flow)
4. [Algorithm Implementation](#algorithm-implementation)
5. [Animation System](#animation-system)
6. [State Management](#state-management)
7. [Testing Strategy](#testing-strategy)
8. [Performance Optimizations](#performance-optimizations)

## System Architecture

### Component Responsibilities

#### **App.jsx** (Orchestrator)
- Manages global application state
- Coordinates data flow between components
- Handles user interactions (algorithm selection, array generation)
- Loads algorithm steps into visualization hook

**Key State:**
```javascript
- arraySize: Current array size (5-100)
- array: The array being visualized
- speed: Animation speed (10-1000ms)
- selectedAlgorithm: Current algorithm name
```

#### **ArrayVisualizer** (Presentation)
- Renders the array as animated bars
- Receives array and state data as props
- Purely presentational, no business logic

#### **ArrayBar** (Atomic Component)
- Individual bar visualization
- Color-coded based on element state
- Animated using Framer Motion

#### **ControlPanel** (Interaction)
- Playback controls (play, pause, step)
- Progress tracking
- Communicates with visualization hook via callbacks

#### **SettingsPanel** (Configuration)
- Algorithm selection dropdown
- Speed and size sliders
- Array generation trigger

#### **InfoPanel** (Information Display)
- Shows current algorithm step description
- Real-time updates during animation

## Data Flow

### Algorithm Execution Flow

```
User Action (Play Button)
    ↓
App Component
    ↓
useSortingVisualization Hook
    ↓
Algorithm Function (e.g., bubbleSort)
    ↓
Generate Animation Steps[]
    ↓
Load into Hook State
    ↓
Playback Loop (with speed delay)
    ↓
Update Current Step State
    ↓
Trigger React Re-render
    ↓
ArrayVisualizer Updates
    ↓
Framer Motion Animates Transitions
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
        description: `Comparing ${arr[j]} and ${arr[j+1]}`
      });
      
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        
        // Record swap step
        steps.push({
          array: [...arr],
          states: createStates(j, j+1, 'swapping'),
          description: `Swapped ${arr[j+1]} and ${arr[j]}`
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

**Benefits:**
- Hardware-accelerated (uses GPU)
- Declarative syntax
- Automatic interpolation
- Built-in spring physics

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

The `delay()` utility creates async pauses:

```javascript
export const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Usage in playback loop
for (let step of steps) {
  updateVisualization(step);
  await delay(speed);  // Configurable delay
}
```

## State Management

### Custom Hook: useSortingVisualization

This hook encapsulates all visualization logic:

**State Variables:**
```javascript
- array: Current array state
- states: Element state array (colors)
- isPlaying: Animation playing?
- currentStep: Current step index
- steps: All animation steps
- description: Current step description
- isComplete: Animation finished?
```

**Methods:**
```javascript
- loadSteps(steps): Load algorithm steps
- play(): Start animation
- pause(): Stop animation
- reset(): Go back to start
- stepForward(): Next step
- stepBackward(): Previous step
```

**Key Features:**
1. **Ref for Steps**: Uses `useRef` to avoid stale closures
2. **Async Playback**: Handles Promise-based delays
3. **Cancellable**: Can interrupt animation mid-play
4. **Bidirectional**: Can step forward and backward

## Testing Strategy

### Unit Tests

**Algorithm Tests** (`algorithms.test.js`):
- Verify sorting correctness
- Test edge cases (empty, single element, duplicates)
- Ensure all algorithms produce same result
- Performance testing on large arrays

**Utility Tests** (`arrayHelpers.test.js`):
- Array generation functions
- Validation functions (isSorted)
- Helper utilities (cloneArray)

### Test Structure

```javascript
describe('Sorting Algorithms', () => {
  const testCases = [
    { name: 'empty array', input: [], expected: [] },
    { name: 'single element', input: [42], expected: [42] },
    // ... more cases
  ];

  describe('Bubble Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = bubbleSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });
  });
});
```

### Running Tests

```bash
pnpm test        # Watch mode (development)
pnpm test:run    # Single run (CI/CD)
pnpm test:ui     # Visual test UI
pnpm test:coverage  # Coverage report
```

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
  <ArrayBar key={`${index}-${value}`} ... />
))}
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

## Future Enhancements

### Algorithm Organization

**Current Structure:**
```
src/
  algorithms/
    sorting/
      bubbleSort.js
      quickSort.js
      mergeSort.js
      index.js
      algorithms.test.js
    pathfinding/
      dijkstra.js
      aStar.js
      bfs.js
      index.js
      pathfinding.test.js
    python/
      bubble_sort.py
      quick_sort.py
      merge_sort.py
    index.js
  components/
    ArrayVisualizer.jsx
    GridVisualizer.jsx
    ControlPanel.jsx
```

**D3.js Integration:**
- Force-directed graph layouts
- Node/edge visualization
- Interactive graph editing
- Animated path traversal

### Additional Sorting Algorithms

- Insertion Sort
- Selection Sort
- Heap Sort
- Radix Sort
- Counting Sort

### Advanced Features

- Algorithm comparison mode
- Time complexity visualization
- Space complexity tracking
- Custom array input
- Export visualization as video
- Share visualization links

## Conclusion

The Algorithm Visualizer is built with:
- **Modularity**: Easy to add new algorithms
- **Maintainability**: Clean separation of concerns
- **Testability**: Comprehensive test coverage
- **Performance**: Optimized for smooth animations
- **Extensibility**: Ready for future enhancements

The architecture supports scaling to include more algorithm types, more complex visualizations, and advanced features while maintaining code quality and performance.
