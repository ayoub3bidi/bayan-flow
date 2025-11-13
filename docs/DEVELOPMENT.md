# Development Guide

## Quick Start

### Prerequisites
- Node.js v18+
- pnpm v8+

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
pnpm test:run        # Run tests once
pnpm test:ui         # Open Vitest UI
pnpm test:coverage   # Generate coverage report
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
// App.jsx - Manages state, coordinates
function App() {
  const [array, setArray] = useState([]);
  const visualization = useSortingVisualization(array);
  
  return <ArrayVisualizer array={visualization.array} />;
}
```

### 2. Custom Hooks Pattern

Extract reusable logic into hooks:

```javascript
// useSortingVisualization.js
export function useSortingVisualization(initialArray, speed) {
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
  // ... record each operation as a step
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

### 4. State Management Strategy

**Local State for UI:**
```javascript
const [isOpen, setIsOpen] = useState(false);
```

**Lifted State for Shared Data:**
```javascript
// In App.jsx
const [array, setArray] = useState([]);
// Pass down to children
```

**Custom Hooks for Complex Logic:**
```javascript
const visualization = useSortingVisualization(array, speed);
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
animate={{ scale: 1.1 }}  // GPU accelerated ✓
animate={{ width: 200 }}   // Forces layout ✗
```

### 6. Code Organization

**File Structure:**
```
components/
  ├── ArrayBar.jsx         # Atomic component
  ├── ArrayVisualizer.jsx  # Composite component
  └── ControlPanel.jsx     # Feature component

hooks/
  └── useSortingVisualization.js  # Shared logic

algorithms/
  ├── bubbleSort.js        # Algorithm + tests
  └── index.js             # Exports

utils/
  └── arrayHelpers.js      # Pure utilities
```

### 7. Testing Approach

**Test Pure Functions:**
```javascript
describe('bubbleSortPure', () => {
  it('should sort array correctly', () => {
    expect(bubbleSortPure([3,1,2])).toEqual([1,2,3]);
  });
});
```

**Test Edge Cases:**
```javascript
it('handles empty array', () => {
  expect(bubbleSortPure([])).toEqual([]);
});
```

**Test Algorithm Consistency:**
```javascript
it('all algorithms produce same result', () => {
  const input = [5,2,8,1];
  expect(bubbleSort(input)).toEqual(quickSort(input));
});
```

## Adding New Features

### Adding a New Sorting Algorithm

**Step 1: Implement Algorithm**

Create `src/algorithms/insertionSort.js`:
```javascript
import { ELEMENT_STATES } from '../constants';

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
        description: `Comparing ${arr[j]} with ${key}`
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

In `src/algorithms/index.js`:
```javascript
import { insertionSort, insertionSortPure } from './insertionSort';

export const algorithms = {
  // ... existing
  insertionSort,
};
```

**Step 3: Add to UI**

In `src/components/SettingsPanel.jsx`:
```javascript
const algorithms = [
  // ... existing
  { 
    value: 'insertionSort', 
    label: 'Insertion Sort', 
    complexity: 'O(n²)' 
  },
];
```

**Step 4: Write Tests**

In `src/algorithms/algorithms.test.js`:
```javascript
describe('Insertion Sort', () => {
  testCases.forEach(({ name, input, expected }) => {
    it(`should sort ${name}`, () => {
      const result = insertionSortPure(input);
      expect(result).toEqual(expected);
    });
  });
});
```

**Step 5: Test & Verify**
```bash
pnpm test:run
pnpm dev
```

### Adding a New Visualization Type

**For Pathfinding:**

1. Create grid state management
2. Implement pathfinding algorithms
3. Create GridVisualizer component
4. Use D3.js for graph rendering
5. Add node interaction handlers

**Example Structure:**
```javascript
// usePathfinding.js
export function usePathfinding(grid, algorithm) {
  const [path, setPath] = useState([]);
  const [visited, setVisited] = useState([]);
  
  return { path, visited, runAlgorithm };
}

// GridVisualizer.jsx
function GridVisualizer({ grid, path, visited }) {
  // D3.js visualization
}
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
// Add console.log in useSortingVisualization
const play = useCallback(async () => {
  for (let step of steps) {
    console.log('Step:', step);  // Debug
    await delay(speed);
  }
}, [steps, speed]);
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
// Future: Split code
const PathfindingView = lazy(() => 
  import('./PathfindingView')
);
```

### 3. Virtual Scrolling
For very large arrays (100+), consider react-window

### 4. Debounce Inputs
```javascript
const debouncedSize = useDebounce(arraySize, 300);
```

## Common Issues & Solutions

### Issue: Tests Fail Randomly
**Solution:** Test is flaky, use more lenient assertions

### Issue: Animation Stutters
**Solution:** Reduce array size or increase speed

### Issue: Build Fails
**Solution:** Check Tailwind v4 configuration

### Issue: Types Not Working
**Solution:** Restart TypeScript server

### Issue: Audio Not Working
**Solution:** Check browser autoplay policy, ensure user interaction before enabling

## Sound System Integration

### Adding Sound to New Algorithms

**Step 1: Identify Sound Events**
```javascript
// In your algorithm implementation
if (hasSwapping) {
  soundManager.playSwap(elementValue);
} else if (hasComparing) {
  soundManager.playCompare(elementValue);
}
```

**Step 2: Update Hook Integration**
```javascript
const executeStep = useCallback((step) => {
  // Update visual state
  setArray(step.array);
  setStates(step.states);
  
  // Add sound logic
  const hasNewState = step.states.includes(NEW_STATE);
  if (hasNewState) {
    soundManager.playNewSound();
  }
}, []);
```

**Step 3: Add New Sound Methods**
```javascript
// In soundManager.js
playNewSound() {
  if (!this.isEnabled) return;
  this.synth.triggerAttackRelease('C4', '8n');
}
```

### Sound Design Guidelines

- **Frequency Mapping**: Map element values to frequencies for intuitive audio feedback
- **Duration**: Keep sounds brief (64n to 8n note values) to avoid overlap
- **Volume**: Use moderate levels to prevent fatigue
- **Fallback**: Always check `isEnabled` before playing sounds

## Conclusion

This project follows modern React best practices:
- Functional components & hooks
- Composition over inheritance
- Separation of concerns
- Test-driven development
- Performance optimization
- Clean code principles
- Accessible audio feedback

All contributions are welcome!