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
- **Full-screen Mode**: Toggle full-screen view for immersive experience
- **Audio Feedback**: Optional sound effects for algorithm operations and UI interactions
  - **Sorting**: Distinct sounds for comparing, swapping, pivot selection, and completion
  - **Pathfinding**: Audio cues for node exploration and path discovery
  - **UI Sounds**: Click feedback and array generation sounds
- **Customizable Settings**: 
  - Switch between Sorting and Pathfinding modes
  - Choose between Manual (default) and Autoplay control modes
  - Adjust animation speed (Slow, Medium, Fast, Very Fast)
  - Toggle sound effects on/off
- **Algorithm Analysis**: Interactive complexity panel with Big-O notation and performance graphs
- **Python Code Examples**: View Python implementations in Monaco editor with syntax highlighting
- **Internationalization**: Full support for English, French, and Arabic (with RTL layout)
- **Theme System**: Light/dark mode with system preference detection and persistence
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Real-time Description**: Step-by-step explanation of algorithm operations
- **Accessibility**: Skip navigation, ARIA labels, keyboard shortcuts, and screen reader support

## Installation

### Prerequisites

- Node.js (v24 or higher)
- pnpm (v8 or higher)
- Modern browser with Web Audio API support (for sound effects)

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
│   │   │   ├── bfs.py
│   │   │   ├── dijkstra.py
│   │   │   ├── astar.py
│   │   │   └── index.js
│   │   └── index.js
│   ├── components/        # React components
│   │   ├── landing/       # Landing page components
│   │   │   ├── Hero.jsx
│   │   │   ├── LearnYourWay.jsx
│   │   │   ├── AlgorithmTypes.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── ClaritySection.jsx
│   │   │   ├── RoadmapCTA.jsx
│   │   │   └── TechPattern.jsx
│   │   ├── roadmap/       # Roadmap page components
│   │   │   ├── RoadmapHero.jsx
│   │   │   ├── Timeline.jsx
│   │   │   └── TimelineItem.jsx
│   │   ├── ui/            # Reusable UI primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Container.jsx
│   │   │   └── Section.jsx
│   │   ├── ArrayBar.jsx
│   │   ├── ArrayVisualizer.jsx
│   │   ├── AutoHidingLegend.jsx
│   │   ├── ComplexityPanel.jsx
│   │   ├── ControlPanel.jsx
│   │   ├── FloatingActionButton.jsx
│   │   ├── Footer.jsx
│   │   ├── GridCell.jsx
│   │   ├── GridVisualizer.jsx
│   │   ├── Header.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   ├── PythonCodePanel.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── SwipeTutorial.jsx
│   │   └── ThemeToggle.jsx
│   ├── contexts/          # React contexts
│   │   ├── ThemeContext.jsx
│   │   └── ThemeContextDefinition.js
│   ├── data/              # Application data
│   │   └── roadmapData.js
│   ├── hooks/             # Custom React hooks
│   │   ├── useFullScreen.js
│   │   ├── usePathfindingVisualization.js
│   │   ├── useSortingVisualization.js
│   │   ├── useSwipe.js
│   │   └── useTheme.js
│   ├── i18n/              # Internationalization
│   │   ├── locales/
│   │   │   ├── en/translation.json
│   │   │   ├── fr/translation.json
│   │   │   └── ar/translation.json
│   │   └── index.js
│   ├── pages/             # Route pages
│   │   ├── LandingPage.jsx
│   │   ├── VisualizerApp.jsx
│   │   └── Roadmap.jsx
│   ├── utils/             # Utility functions
│   │   ├── algorithmTranslations.js
│   │   ├── arrayHelpers.js
│   │   ├── gridHelpers.js
│   │   ├── rtlManager.js
│   │   └── soundManager.js
│   ├── constants/         # App constants
│   │   └── index.js
│   ├── test/              # Test configuration
│   │   └── setup.js
│   ├── App.jsx            # Legacy (kept for compatibility)
│   ├── main.jsx           # App entry point with routing
│   └── index.css          # Global styles with CSS variables
├── .prettierrc            # Prettier configuration
├── eslint.config.js       # ESLint configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
├── vitest.config.js       # Vitest configuration
└── package.json           # Project dependencies
```

## How It Works

### Algorithm Implementation

Each algorithm is implemented in two versions:

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

The `useSortingVisualization` and `usePathfindingVisualization` custom hooks manage:
- Animation playback state (autoplay/manual modes)
- Step navigation (forward/backward)
- Speed control (autoplay mode only)
- Play/pause/stop functionality
- Mode-specific behavior and UI controls

### Component Architecture

- **Pages**: Route-level components (LandingPage, VisualizerApp, Roadmap)
- **Layout Components**: Header, Footer, Container, Section
- **Feature Components**: ArrayVisualizer, GridVisualizer, ControlPanel
- **UI Primitives**: Button, ThemeToggle, LanguageSwitcher
- **Contexts**: ThemeContext for global theme state

## Extending the Project

### Adding a New Sorting Algorithm

1. Create implementation in `src/algorithms/sorting/[algorithm].js`
2. Export in `src/algorithms/sorting/index.js`
3. Add to dropdown in `src/components/SettingsPanel.jsx`
4. Add complexity data in `src/constants/index.js`
5. Add Python implementation in `src/algorithms/python/[algorithm].py`
6. Write tests in `src/algorithms/sorting/algorithms.test.js`
7. Add translations in all language files

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed instructions.

### Adding a New Language

1. Create translation file: `src/i18n/locales/[lang]/translation.json`
2. Import in `src/i18n/index.js`
3. Add to `supportedLngs` array
4. Update `LanguageSwitcher.jsx` with language option
5. If RTL language, add to `RTL_LANGUAGES` in `src/utils/rtlManager.js`

### Customizing the Theme

Modify CSS variables in `src/index.css`:

```css
:root {
  --color-primary: #2b7fff;
  --color-bg: #f9fafb;
  /* ... other variables */
}

.dark {
  --color-primary: #60a5fa;
  --color-bg: #0a0f1a;
  /* ... other variables */
}
```

## Internationalization

Bayan Flow supports multiple languages with automatic browser language detection and manual language switching.

### Supported Languages

- **English** (default)
- **French** (Français)
- **Arabic** (العربية) with RTL support

### Features

- **Automatic Detection**: Detects browser language on first visit
- **Manual Switching**: Language switcher in header
- **Persistent Selection**: Saves preference in localStorage
- **RTL Layout**: Automatic layout flip for Arabic
- **Fallback**: Falls back to English for unsupported languages

### Adding Translations

All translatable strings use the `t()` function from react-i18next:

```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('header.title')}</h1>;
}
```

Translation files are located in `src/i18n/locales/[lang]/translation.json`.

## Testing Philosophy

The project includes comprehensive tests for:

- **Algorithm correctness**: Verify sorting produces correct results
- **Edge cases**: Empty arrays, single elements, duplicates
- **Consistency**: All algorithms produce identical results
- **Utility functions**: Array generation, grid helpers, sound manager
- **Visualization hooks**: Autoplay/manual mode behavior, timing
- **Theme system**: Light/dark mode switching, persistence
- **Internationalization**: Translation loading, language switching
- **Components**: UI components, accessibility features

Run tests with:

```bash
pnpm test
```

## Accessibility

Bayan Flow is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support (F for fullscreen, Esc to exit)
- **Screen Reader Support**: ARIA labels, roles, and live regions
- **Skip Navigation**: Skip to main content link
- **High Contrast**: Theme-aware colors with sufficient contrast ratios
- **Touch-Friendly**: 44px minimum touch targets on mobile
- **Motion Preferences**: Respects `prefers-reduced-motion`
- **Semantic HTML**: Proper heading hierarchy and landmarks

## Performance

- **Code Splitting**: Lazy loading for Python code panel and complexity panel
- **Optimized Animations**: GPU-accelerated transforms
- **Efficient Re-renders**: React.memo, useMemo, useCallback
- **Asset Optimization**: Vite build optimization
- **Tree Shaking**: Dead code elimination
- **CSS Purging**: Unused Tailwind classes removed

**Note**: Web Audio API support required for sound features.

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
