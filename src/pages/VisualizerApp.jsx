/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ControlPanel from '../components/ControlPanel';
import SettingsPanel from '../components/SettingsPanel';
import FloatingActionButton from '../components/FloatingActionButton';
import InsightFloatingActionButton from '../components/InsightFloatingActionButton';
import ExportProgressModal from '../components/ExportProgressModal';

const PythonCodePanel = lazy(() => import('../components/PythonCodePanel'));
const AlgorithmInsightPanel = lazy(
  () => import('../components/AlgorithmInsightPanel')
);
import { useSortingVisualization } from '../hooks/useSortingVisualization';
import { usePathfindingVisualization } from '../hooks/usePathfindingVisualization';
import { useFullScreen } from '../hooks/useFullScreen';
import { useVideoExporter } from '../video/useVideoExporter';
import { soundManager } from '../utils/soundManager';
import {
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRID_SIZE,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
} from '../constants';
import { VISUALIZER_REGISTRY } from '../registry/visualizerRegistry';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { getExtraVisualizerProps } from '../registry/extraVisualizerProps';
import { useCategoryVisualizations } from '../hooks/useCategoryVisualizations';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the initial selectedAlgorithms map from CATEGORY_CONFIG.defaultAlgorithm per type.
 */
function buildDefaultSelectedAlgorithms() {
  return Object.fromEntries(
    Object.values(ALGORITHM_TYPES).map(type => [
      type,
      CATEGORY_CONFIG[type].defaultAlgorithm,
    ])
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function App() {
  const { t } = useTranslation();

  // ── Core State ────────────────────────────────────────────────────────────
  const [algorithmType, setAlgorithmType] = useState(ALGORITHM_TYPES.SORTING);

  /** One selected-algorithm key per category — no more parallel state vars. */
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(
    buildDefaultSelectedAlgorithms
  );

  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [array, setArray] = useState(() =>
    CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].generateData(DEFAULT_ARRAY_SIZE)
  );
  const [speed, setSpeed] = useState(ANIMATION_SPEEDS.MEDIUM);
  const [mode, setMode] = useState(VISUALIZATION_MODES.MANUAL);
  const [isPythonPanelOpen, setIsPythonPanelOpen] = useState(false);
  const [isInsightPanelOpen, setIsInsightPanelOpen] = useState(false);

  // ── Active Algorithm Key / Name ───────────────────────────────────────────
  const activeAlgorithmKey = selectedAlgorithms[algorithmType];

  const activeAlgorithmName = t(
    `${CATEGORY_CONFIG[algorithmType].i18nPrefix}.${activeAlgorithmKey}`,
    { defaultValue: activeAlgorithmKey }
  );

  // ── Hooks (always called — React rules) ───────────────────────────────────────
  const sortingVisualization = useSortingVisualization(
    selectedAlgorithms[ALGORITHM_TYPES.SORTING],
    array,
    speed,
    mode
  );
  const pathfindingVisualization = usePathfindingVisualization(
    selectedAlgorithms[ALGORITHM_TYPES.PATHFINDING],
    gridSize,
    speed,
    mode
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

  const visualizationMap = useCategoryVisualizations({
    sortingVisualization,
    pathfindingVisualization,
  });

  const visualization = visualizationMap[algorithmType];

  // ── Registry: visualizer component ───────────────────────────────────────
  const VisualizerComponent = VISUALIZER_REGISTRY[algorithmType];

  if (import.meta.env.DEV && !VisualizerComponent) {
    console.error(
      `[VisualizerApp] No visualizer registered for algorithmType "${algorithmType}". Check VISUALIZER_REGISTRY.`
    );
    throw new Error(
      `No visualizer registered for algorithm type: ${algorithmType}`
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** New random input data for the active category (array: regenerate values; grid: new start/end). */
  const handleGenerateArray = () => {
    const cfg = CATEGORY_CONFIG[algorithmType];
    if (cfg.sizeBinding === 'array') {
      setArray(cfg.generateData(arraySize));
    } else {
      pathfindingVisualization.regenerateGrid();
    }
    soundManager.playArrayGenerate();
  };

  const handleAlgorithmChange = algorithmName => {
    setSelectedAlgorithms(prev => ({
      ...prev,
      [algorithmType]: algorithmName,
    }));
    visualization.reset();
  };

  const handleArraySizeChange = newSize => {
    setArraySize(newSize);
    const cfg = CATEGORY_CONFIG[algorithmType];
    if (cfg.sizeBinding === 'array') {
      setArray(cfg.generateData(newSize));
    }
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
    visualizationMap[newType]?.reset();
  };

  // ── Shared visualizer props ────────────────────────────────────────────────
  /** Props common to all visualizer components. */
  const sharedVisualizerProps = {
    states: visualization.states,
    description: visualization.description,
    isComplete: visualization.isComplete,
    algorithm: activeAlgorithmKey,
    onStepForward: visualization.stepForward,
    onStepBackward: visualization.stepBackward,
    mode,
  };

  const extraVisualizerProps = getExtraVisualizerProps(algorithmType, {
    sortingVisualization,
    gridSize,
  });

  // ── Render ─────────────────────────────────────────────────────────────────
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
            {/* Full-screen Visualizer */}
            <div className="flex-1 mb-4">
              <VisualizerComponent
                {...sharedVisualizerProps}
                {...extraVisualizerProps}
              />
            </div>

            {/* Full-screen Control Panel */}
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
                      selectedAlgorithm={activeAlgorithmKey}
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
                    {/* Visualizer — resolved via registry */}
                    <div
                      className="flex-1 min-h-0"
                      role="img"
                      aria-label={`${activeAlgorithmKey} algorithm visualization`}
                    >
                      <VisualizerComponent
                        {...sharedVisualizerProps}
                        {...extraVisualizerProps}
                      />
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

            {/* Floating Action Buttons */}
            {!isPythonPanelOpen && !isInsightPanelOpen && (
              <>
                <FloatingActionButton
                  onClick={() => setIsPythonPanelOpen(true)}
                  disabled={!activeAlgorithmKey}
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

      {/* Export modal */}
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

      {/* Python Code Panel */}
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
          algorithm={activeAlgorithmKey}
        />
      </Suspense>

      {/* Algorithm Insight Panel */}
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

export default App;
