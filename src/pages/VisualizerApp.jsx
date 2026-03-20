/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArrayVisualizer from '../components/ArrayVisualizer';
import GridVisualizer from '../components/GridVisualizer';
import ControlPanel from '../components/ControlPanel';
import SettingsPanel from '../components/SettingsPanel';
import FloatingActionButton from '../components/FloatingActionButton';
import ExportProgressModal from '../components/ExportProgressModal';

const PythonCodePanel = lazy(() => import('../components/PythonCodePanel'));
const AlgorithmInsightPanel = lazy(
  () => import('../components/AlgorithmInsightPanel')
);
import { useSortingVisualization } from '../hooks/useSortingVisualization';
import { usePathfindingVisualization } from '../hooks/usePathfindingVisualization';
import { useFullScreen } from '../hooks/useFullScreen';
import { useVideoExporter } from '../video/useVideoExporter';
import { generateRandomArray } from '../utils/arrayHelpers';
import { createEmptyGrid } from '../utils/gridHelpers';
import { algorithms } from '../algorithms';
import { pathfindingAlgorithms } from '../algorithms/pathfinding';
import { soundManager } from '../utils/soundManager';
import {
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRID_SIZE,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
} from '../constants';

function App() {
  const { t } = useTranslation();
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
  const [isInsightPanelOpen, setIsInsightPanelOpen] = useState(false);

  const activeAlgorithmKey =
    algorithmType === ALGORITHM_TYPES.SORTING
      ? selectedAlgorithm
      : selectedPathfindingAlgorithm;

  const activeAlgorithmName = t(
    algorithmType === ALGORITHM_TYPES.SORTING
      ? `algorithms.sorting.${selectedAlgorithm}`
      : `algorithms.pathfinding.${selectedPathfindingAlgorithm}`,
    { defaultValue: activeAlgorithmKey }
  );

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const {
    beginExportFlow,
    exportVideo,
    exportState,
    exportProgress,
    exportBlobUrl,
    cancelExport,
    closePreview,
    downloadVideo,
    canRenderOnWeb,
  } = useVideoExporter();

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
      soundManager.playArrayGenerate();
    } else {
      pathfindingVisualization.generateNewGrid();
      soundManager.playArrayGenerate();
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

  const handleExportVideo = () => {
    if (visualization.totalSteps === 0) return;
    beginExportFlow();
  };

  const handleOrientationSelected = orientation => {
    exportVideo({
      steps: visualization.steps,
      algorithmType,
      algorithmName: activeAlgorithmName,
      algorithmKey: activeAlgorithmKey,
      speed,
      gridSize,
      orientation,
    });
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
    // algorithms is static import; sortingVisualization.loadSteps is stable via useCallback
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
    // pathfindingAlgorithms, createEmptyGrid are static; pathfindingVisualization.loadSteps is stable
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
              onExportVideo={handleExportVideo}
              onCancelExport={cancelExport}
              exportState={exportState}
              exportProgress={exportProgress}
              canRenderOnWeb={canRenderOnWeb}
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
              className="flex-1 pt-0 sm:pt-20 p-6 pb-32"
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
                    className="lg:col-span-3 flex flex-col gap-4 h-[calc(100vh-160px)] lg:h-[calc(100vh-85px)]"
                    role="region"
                    aria-label="Algorithm visualization"
                  >
                    {/* Visualizer */}
                    <div
                      className="flex-1 min-h-0"
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
                      onExportVideo={handleExportVideo}
                      onCancelExport={cancelExport}
                      exportState={exportState}
                      exportProgress={exportProgress}
                      canRenderOnWeb={canRenderOnWeb}
                    />
                  </section>
                </div>
              </div>
            </main>
            <Footer />

            {/* Floating Action Buttons - Only show when both panels are closed */}
            {!isPythonPanelOpen && !isInsightPanelOpen && (
              <>
                <FloatingActionButton
                  onClick={() => setIsPythonPanelOpen(true)}
                  disabled={
                    algorithmType === ALGORITHM_TYPES.SORTING
                      ? !selectedAlgorithm
                      : !selectedPathfindingAlgorithm
                  }
                />
                <InsightFloatingActionButton
                  onClick={() => setIsInsightPanelOpen(true)}
                  disabled={!activeAlgorithmKey}
                  label={t('insight_panel.viewInsight')}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export modal: orientation selection → progress → preview */}
      <ExportProgressModal
        open={
          exportState === 'orientation' ||
          exportState === 'checking' ||
          exportState === 'rendering' ||
          exportState === 'preview'
        }
        progress={exportProgress}
        phase={
          exportState === 'orientation'
            ? 'orientation'
            : exportState === 'preview'
              ? 'preview'
              : exportState === 'checking'
                ? 'checking'
                : 'rendering'
        }
        blobUrl={exportBlobUrl}
        onStop={cancelExport}
        onClose={closePreview}
        onDownload={downloadVideo}
        onOrientationSelect={handleOrientationSelected}
      />

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

      {/* Algorithm Insight Panel - Always available */}
      <Suspense fallback={null}>
        <AlgorithmInsightPanel
          isOpen={isInsightPanelOpen}
          onClose={() => setIsInsightPanelOpen(false)}
          algorithmKey={activeAlgorithmKey}
          algorithmName={activeAlgorithmName}
        />
      </Suspense>
    </div>
  );
}

/**
 * Insight FAB — similar to FloatingActionButton but in amber colour.
 * Positioned below the Code FAB (offset by 160px top offset on desktop).
 */
function InsightFloatingActionButton({
  onClick,
  disabled = false,
  label = 'Insight',
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const buttonText = t('insight_panel.insightLabel', {
    defaultValue: 'Insight',
  });

  return (
    <>
      {/* Desktop: Side FAB */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          hidden md:flex
          fixed ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-50 mt-44
          h-32 w-14 bg-amber-500 hover:bg-amber-600
          disabled:bg-disabled-bg disabled:cursor-not-allowed
          text-white ${isRTL ? 'rounded-r-xl' : 'rounded-l-xl'} shadow-lg hover:shadow-xl
          flex-col items-center justify-center gap-2
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
        `}
        style={{ marginTop: '10rem' }}
        initial={{ x: isRTL ? -48 : 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isRTL ? -48 : 48, opacity: 0 }}
        whileHover={{ x: disabled ? 0 : isRTL ? 4 : -4 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        aria-label={label}
        title={label}
      >
        <span className="font-medium writing-mode-vertical transform rotate-360">
          {buttonText}
        </span>
      </motion.button>

      {/* Mobile: Bottom FAB */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex md:hidden
          fixed bottom-20 ${isRTL ? 'left-4' : 'right-4'} z-50
          w-14 h-14 min-w-[56px] min-h-[56px] bg-amber-500 hover:bg-amber-600
          disabled:bg-disabled-bg disabled:cursor-not-allowed
          text-white rounded-full shadow-lg hover:shadow-xl
          items-center justify-center
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
          touch-manipulation
        `}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        aria-label={label}
        title={label}
      >
        {/* Lightbulb icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      </motion.button>
    </>
  );
}

export default App;
