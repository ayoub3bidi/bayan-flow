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
animate={{ scale: 1.1 }}  // GPU accelerated ✓
animate={{ width: 200 }}   // Forces layout ✗
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
│   ├── landing/        # Landing page specific
│   ├── roadmap/        # Roadmap page specific
│   ├── ui/            # Reusable primitives
│   └── [feature].jsx  # Feature components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── algorithms/        # Algorithm implementations
├── utils/             # Pure utilities
├── data/              # Static data
└── constants/         # App constants
```

### 9. Testing Approach

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

**Step 3: Add to UI**

In `src/components/SettingsPanel.jsx`:
```javascript
const sortingAlgorithms = [
  // ... existing
  { 
    value: 'insertionSort', 
    label: t('algorithms.sorting.insertionSort'),
    complexity: t('complexity.insertionSort')
  },
];
```

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

**Step 8: Test & Verify**
```bash
pnpm test:run
pnpm dev
```

### Adding a New Pathfinding Algorithm

Follow similar steps but use `src/algorithms/pathfinding/` directory and:
- Use 2D grid state instead of 1D array
- Implement grid-based visualization
- Add to `PATHFINDING_COMPLEXITY` in constants
- Update pathfinding test suite

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
  { code: 'en', name: t('languages.en'), flag: '🇬🇧' },
  { code: 'fr', name: t('languages.fr'), flag: '🇫🇷' },
  { code: 'ar', name: t('languages.ar'), flag: '🇸🇦' },
  { code: '[lang]', name: t('languages.[lang]'), flag: '🏳️' },
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

## Best Practices Checklist

### Before Committing

- [ ] Run `pnpm lint:fix`
- [ ] Run `pnpm format`
- [ ] Run `pnpm test:run`
- [ ] Check console for warnings/errors
- [ ] Test in light and dark mode
- [ ] Test in all supported languages
- [ ] Test on mobile (responsive design)
- [ ] Verify accessibility (keyboard navigation, ARIA labels)
- [ ] Check performance (no janky animations)
- [ ] Update relevant documentation

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
- [ ] Tests for new features
- [ ] Documentation updated

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