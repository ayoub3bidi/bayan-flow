/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ArrayVisualizer from './components/ArrayVisualizer';
import GridVisualizer from './components/GridVisualizer';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';
import FloatingActionButton from './components/FloatingActionButton';

const PythonCodePanel = lazy(() => import('./components/PythonCodePanel'));
const ComplexityPanel = lazy(() => import('./components/ComplexityPanel'));
import { useSortingVisualization } from './hooks/useSortingVisualization';
import { usePathfindingVisualization } from './hooks/usePathfindingVisualization';
import { useFullScreen } from './hooks/useFullScreen';
import { generateRandomArray } from './utils/arrayHelpers';
import { createEmptyGrid } from './utils/gridHelpers';
import { algorithms } from './algorithms';
import { pathfindingAlgorithms } from './algorithms/pathfinding';
import {
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRID_SIZE,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
} from './constants';

function App() {
  const [algorithmType, setAlgorithmType] = useState(ALGORITHM_TYPES.SORTING);
  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [array, setArray] = useState(() =>
    generateRandomArray(DEFAULT_ARRAY_SIZE)
  );
  const [speed, setSpeed] = useState(ANIMATION_SPEEDS.MEDIUM);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [selectedPathfindingAlgorithm, setSelectedPathfindingAlgorithm] =
    useState('bfs');
  const [mode, setMode] = useState(VISUALIZATION_MODES.MANUAL);
  const [isPythonPanelOpen, setIsPythonPanelOpen] = useState(false);

  const { isFullScreen, toggleFullScreen } = useFullScreen();

  const sortingVisualization = useSortingVisualization(array, speed, mode);
  const pathfindingVisualization = usePathfindingVisualization(
    gridSize,
    speed,
    mode
  );

  const visualization =
    algorithmType === ALGORITHM_TYPES.SORTING
      ? sortingVisualization
      : pathfindingVisualization;
  const handleGenerateArray = () => {
    if (algorithmType === ALGORITHM_TYPES.SORTING) {
      const newArray = generateRandomArray(arraySize);
      setArray(newArray);
    } else {
      pathfindingVisualization.generateNewGrid();
    }
  };
  const handleAlgorithmChange = algorithmName => {
    if (algorithmType === ALGORITHM_TYPES.SORTING) {
      setSelectedAlgorithm(algorithmName);
      sortingVisualization.reset();
    } else {
      setSelectedPathfindingAlgorithm(algorithmName);
      pathfindingVisualization.reset();
    }
  };
  const handleArraySizeChange = newSize => {
    setArraySize(newSize);
    const newArray = generateRandomArray(newSize);
    setArray(newArray);
  };

  const handleGridSizeChange = newSize => {
    setGridSize(newSize);
  };

  const handleAlgorithmTypeChange = newType => {
    setAlgorithmType(newType);
    // Reset visualizations when switching types
    if (newType === ALGORITHM_TYPES.SORTING) {
      sortingVisualization.reset();
    } else {
      pathfindingVisualization.reset();
    }
  };
  useEffect(() => {
    if (algorithmType === ALGORITHM_TYPES.SORTING) {
      const algorithmFunction = algorithms[selectedAlgorithm];
      if (algorithmFunction) {
        const steps = algorithmFunction(array);
        sortingVisualization.loadSteps(steps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithm, array, algorithmType]);

  useEffect(() => {
    if (
      algorithmType === ALGORITHM_TYPES.PATHFINDING &&
      pathfindingVisualization.start &&
      pathfindingVisualization.end
    ) {
      const algorithmFunction =
        pathfindingAlgorithms[selectedPathfindingAlgorithm];
      if (algorithmFunction) {
        const grid = createEmptyGrid(gridSize, gridSize);
        const steps = algorithmFunction(
          grid,
          pathfindingVisualization.start,
          pathfindingVisualization.end,
          gridSize,
          gridSize
        );
        pathfindingVisualization.loadSteps(steps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPathfindingAlgorithm,
    algorithmType,
    pathfindingVisualization.start,
    pathfindingVisualization.end,
    gridSize,
  ]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <AnimatePresence mode="wait">
        {isFullScreen ? (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-screen h-screen bg-gray-900 flex flex-col p-4"
            role="main"
            id="main-content"
          >
            {/* Full Screen Visualizer */}
            <div className="flex-1 mb-4">
              {algorithmType === ALGORITHM_TYPES.SORTING ? (
                <ArrayVisualizer
                  array={sortingVisualization.array}
                  states={sortingVisualization.states}
                  description={sortingVisualization.description}
                  isComplete={sortingVisualization.isComplete}
                  algorithm={selectedAlgorithm}
                  onStepForward={sortingVisualization.stepForward}
                  onStepBackward={sortingVisualization.stepBackward}
                  mode={mode}
                />
              ) : (
                <GridVisualizer
                  states={pathfindingVisualization.states}
                  description={pathfindingVisualization.description}
                  isComplete={pathfindingVisualization.isComplete}
                  algorithm={selectedPathfindingAlgorithm}
                  gridSize={gridSize}
                  onStepForward={pathfindingVisualization.stepForward}
                  onStepBackward={pathfindingVisualization.stepBackward}
                  mode={mode}
                />
              )}
            </div>

            {/* Full Screen Control Panel */}
            <ControlPanel
              isPlaying={visualization.isPlaying}
              isComplete={visualization.isComplete}
              mode={mode}
              onPlay={visualization.play}
              onPause={visualization.pause}
              onReset={visualization.reset}
              onStepForward={visualization.stepForward}
              onStepBackward={visualization.stepBackward}
              currentStep={visualization.currentStep}
              totalSteps={visualization.totalSteps}
              onGenerateArray={handleGenerateArray}
              algorithmType={algorithmType}
              isFullScreen={isFullScreen}
              onToggleFullScreen={toggleFullScreen}
            />
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col min-h-screen"
          >
            <Header />
            <main
              className="flex-1 pt-20 p-6 pb-32"
              role="main"
              id="main-content"
            >
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Settings Panel */}
                  <aside
                    className="lg:col-span-1"
                    role="complementary"
                    aria-label="Algorithm settings"
                  >
                    <SettingsPanel
                      algorithmType={algorithmType}
                      onAlgorithmTypeChange={handleAlgorithmTypeChange}
                      selectedAlgorithm={
                        algorithmType === ALGORITHM_TYPES.SORTING
                          ? selectedAlgorithm
                          : selectedPathfindingAlgorithm
                      }
                      onAlgorithmChange={handleAlgorithmChange}
                      speed={speed}
                      onSpeedChange={setSpeed}
                      arraySize={arraySize}
                      onArraySizeChange={handleArraySizeChange}
                      gridSize={gridSize}
                      onGridSizeChange={handleGridSizeChange}
                      isPlaying={visualization.isPlaying}
                      mode={mode}
                      onModeChange={setMode}
                    />
                  </aside>

                  {/* Visualization Area */}
                  <section
                    className="lg:col-span-3 space-y-6"
                    role="region"
                    aria-label="Algorithm visualization"
                  >
                    {/* Visualizer */}
                    <div
                      className="h-[650px]"
                      role="img"
                      aria-label={`${algorithmType === ALGORITHM_TYPES.SORTING ? selectedAlgorithm : selectedPathfindingAlgorithm} algorithm visualization`}
                    >
                      {algorithmType === ALGORITHM_TYPES.SORTING ? (
                        <ArrayVisualizer
                          array={sortingVisualization.array}
                          states={sortingVisualization.states}
                          description={sortingVisualization.description}
                          isComplete={sortingVisualization.isComplete}
                          algorithm={selectedAlgorithm}
                          onStepForward={sortingVisualization.stepForward}
                          onStepBackward={sortingVisualization.stepBackward}
                          mode={mode}
                        />
                      ) : (
                        <GridVisualizer
                          states={pathfindingVisualization.states}
                          description={pathfindingVisualization.description}
                          isComplete={pathfindingVisualization.isComplete}
                          algorithm={selectedPathfindingAlgorithm}
                          gridSize={gridSize}
                          onStepForward={pathfindingVisualization.stepForward}
                          onStepBackward={pathfindingVisualization.stepBackward}
                          mode={mode}
                        />
                      )}
                    </div>

                    {/* Control Panel */}
                    <ControlPanel
                      isPlaying={visualization.isPlaying}
                      isComplete={visualization.isComplete}
                      mode={mode}
                      onPlay={visualization.play}
                      onPause={visualization.pause}
                      onReset={visualization.reset}
                      onStepForward={visualization.stepForward}
                      onStepBackward={visualization.stepBackward}
                      currentStep={visualization.currentStep}
                      totalSteps={visualization.totalSteps}
                      onGenerateArray={handleGenerateArray}
                      algorithmType={algorithmType}
                      isFullScreen={isFullScreen}
                      onToggleFullScreen={toggleFullScreen}
                    />
                  </section>
                </div>
              </div>
            </main>
            <Footer />

            {/* Floating Action Button - Only show when panel is closed */}
            {!isPythonPanelOpen && (
              <FloatingActionButton
                onClick={() => setIsPythonPanelOpen(true)}
                disabled={!selectedAlgorithm}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Python Code Panel - Always available */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-white">Loading...</div>
          </div>
        }
      >
        <PythonCodePanel
          isOpen={isPythonPanelOpen}
          onClose={() => setIsPythonPanelOpen(false)}
          algorithm={
            algorithmType === ALGORITHM_TYPES.SORTING
              ? selectedAlgorithm
              : selectedPathfindingAlgorithm
          }
        />
      </Suspense>
    </div>
  );
}

export default App;
