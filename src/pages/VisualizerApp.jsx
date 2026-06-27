/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect, lazy, Suspense } from 'react';
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
import { useSearchingVisualization } from '../hooks/useSearchingVisualization';
import { useTreeTraversalVisualization } from '../hooks/useTreeTraversalVisualization';
import { useGraphAlgorithmVisualization } from '../hooks/useGraphAlgorithmVisualization';
import { useFullScreen } from '../hooks/useFullScreen';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useVideoExporter } from '../video/useVideoExporter';
import { soundManager } from '../utils/soundManager';
import {
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRAPH_NODE_COUNT,
  DEFAULT_GRID_SIZE,
  DEFAULT_SEARCH_GRAPH_NODE_COUNT,
  DEFAULT_TREE_NODE_COUNT,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
  SORT_ORDERS,
} from '../constants';
import { VISUALIZER_REGISTRY } from '../registry/visualizerRegistry';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { getExtraVisualizerProps } from '../registry/extraVisualizerProps';
import { useCategoryVisualizations } from '../hooks/useCategoryVisualizations';
import { useTheme } from '../hooks/useTheme';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate';
import {
  clampGraphAlgorithmNodeCount,
  getGraphAlgorithmScenarioOptions,
  isGraphScenarioSupported,
} from '../registry/graphAlgorithmRegistry.js';
import {
  finalizeSortingInputArray,
  reorderArrayForSortOrder,
} from '../utils/arrayHelpers';

const SOUND_PREFERENCE_STORAGE_KEY = 'bayan-flow:sound-enabled';

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

function getDefaultGraphScenario(algorithmKey) {
  return getGraphAlgorithmScenarioOptions(algorithmKey)[0]?.id ?? null;
}

function readStoredSoundPreference() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(SOUND_PREFERENCE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredSoundPreference(isEnabled) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      SOUND_PREFERENCE_STORAGE_KEY,
      String(isEnabled)
    );
  } catch {
    // Ignore storage failures and keep the in-memory preference.
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function App() {
  const { t, i18n } = useTranslation();

  // ── Core State ────────────────────────────────────────────────────────────
  const [algorithmType, setAlgorithmType] = useState(ALGORITHM_TYPES.SORTING);

  /** One selected-algorithm key per category — no more parallel state vars. */
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(
    buildDefaultSelectedAlgorithms
  );

  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [searchGraphNodeCount, setSearchGraphNodeCount] = useState(
    DEFAULT_SEARCH_GRAPH_NODE_COUNT
  );
  const [treeNodeCount, setTreeNodeCount] = useState(DEFAULT_TREE_NODE_COUNT);
  const [graphNodeCount, setGraphNodeCount] = useState(
    DEFAULT_GRAPH_NODE_COUNT
  );
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.ASCENDING);
  const prevSortOrderRef = useRef(sortOrder);
  const [array, setArray] = useState(() =>
    finalizeSortingInputArray(
      CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].generateData(DEFAULT_ARRAY_SIZE),
      SORT_ORDERS.ASCENDING
    )
  );
  const [speed, setSpeed] = useState(ANIMATION_SPEEDS.MEDIUM);
  const [mode, setMode] = useState(VISUALIZATION_MODES.MANUAL);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    readStoredSoundPreference
  );
  const [isSoundTogglePending, setIsSoundTogglePending] = useState(false);
  const [isPythonPanelOpen, setIsPythonPanelOpen] = useState(false);
  const [isInsightPanelOpen, setIsInsightPanelOpen] = useState(false);

  useBodyScrollLock(isPythonPanelOpen || isInsightPanelOpen);

  const [selectedGraphScenario, setSelectedGraphScenario] = useState(() =>
    getDefaultGraphScenario(
      CATEGORY_CONFIG[ALGORITHM_TYPES.GRAPH_ALGORITHM].defaultAlgorithm
    )
  );

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
  const searchingVisualization = useSearchingVisualization(
    selectedAlgorithms[ALGORITHM_TYPES.SEARCHING],
    array,
    speed,
    mode,
    searchGraphNodeCount
  );
  const treeTraversalVisualization = useTreeTraversalVisualization(
    selectedAlgorithms[ALGORITHM_TYPES.TREE_TRAVERSAL],
    speed,
    mode,
    treeNodeCount
  );
  const graphAlgorithmVisualization = useGraphAlgorithmVisualization(
    selectedAlgorithms[ALGORITHM_TYPES.GRAPH_ALGORITHM],
    speed,
    mode,
    graphNodeCount,
    selectedGraphScenario
  );

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const {
    beginExportFlow,
    exportVideo,
    exportState,
    exportProgress,
    exportBlobUrl,
    exportErrorMessage,
    cancelExport,
    closePreview,
    downloadVideo,
    canRenderOnWeb,
  } = useVideoExporter();

  const { theme } = useTheme();

  const visualizationMap = useCategoryVisualizations({
    sortingVisualization,
    pathfindingVisualization,
    searchingVisualization,
    treeTraversalVisualization,
    graphAlgorithmVisualization,
  });

  const visualization = visualizationMap[algorithmType];

  useEffect(() => {
    const graphAlgorithmKey =
      selectedAlgorithms[ALGORITHM_TYPES.GRAPH_ALGORITHM];

    if (
      selectedGraphScenario &&
      !isGraphScenarioSupported(graphAlgorithmKey, selectedGraphScenario)
    ) {
      setSelectedGraphScenario(getDefaultGraphScenario(graphAlgorithmKey));
    }
  }, [selectedAlgorithms, selectedGraphScenario, setSelectedGraphScenario]);

  useEffect(() => {
    const graphAlgorithmKey =
      selectedAlgorithms[ALGORITHM_TYPES.GRAPH_ALGORITHM];
    setGraphNodeCount(prev =>
      clampGraphAlgorithmNodeCount(graphAlgorithmKey, prev)
    );
  }, [selectedAlgorithms]);

  useEffect(() => {
    if (algorithmType !== ALGORITHM_TYPES.SORTING) {
      prevSortOrderRef.current = sortOrder;
      return;
    }
    if (prevSortOrderRef.current !== sortOrder) {
      setArray(prev => reorderArrayForSortOrder(prev, sortOrder));
      prevSortOrderRef.current = sortOrder;
    }
  }, [sortOrder, algorithmType]);

  useEffect(() => {
    writeStoredSoundPreference(isSoundEnabled);

    if (!isSoundEnabled && soundManager.getIsEnabled()) {
      soundManager.disable();
    }
  }, [isSoundEnabled]);

  useEffect(() => {
    if (!isSoundEnabled || soundManager.getIsEnabled()) {
      return undefined;
    }

    const resumeOnInteraction = async () => {
      cleanup();
      try {
        await soundManager.enable();
      } catch {
        setIsSoundEnabled(false);
      }
    };

    const cleanup = () => {
      document.removeEventListener('pointerdown', resumeOnInteraction, true);
      document.removeEventListener('keydown', resumeOnInteraction, true);
    };

    document.addEventListener('pointerdown', resumeOnInteraction, true);
    document.addEventListener('keydown', resumeOnInteraction, true);

    return cleanup;
  }, [isSoundEnabled]);

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
  const handleGenerateInput = () => {
    const cfg = CATEGORY_CONFIG[algorithmType];
    if (algorithmType === ALGORITHM_TYPES.TREE_TRAVERSAL) {
      treeTraversalVisualization.regenerateTree();
    } else if (algorithmType === ALGORITHM_TYPES.GRAPH_ALGORITHM) {
      graphAlgorithmVisualization.regenerateGraph();
    } else if (
      algorithmType === ALGORITHM_TYPES.SEARCHING &&
      isNodeLinkSearchingAlgorithm(
        selectedAlgorithms[ALGORITHM_TYPES.SEARCHING]
      )
    ) {
      searchingVisualization.regenerateGraphStructure();
    } else if (cfg.sizeBinding === 'array') {
      const raw = cfg.generateData(arraySize);
      setArray(
        algorithmType === ALGORITHM_TYPES.SORTING
          ? finalizeSortingInputArray(raw, sortOrder)
          : raw
      );
    } else {
      pathfindingVisualization.regenerateGrid();
    }
  };

  const handleSoundToggle = async () => {
    if (isSoundTogglePending) return;

    if (isSoundEnabled) {
      soundManager.disable();
      setIsSoundEnabled(false);
      return;
    }

    setIsSoundTogglePending(true);

    try {
      await soundManager.enable();
      const nextEnabledState = soundManager.getIsEnabled();
      setIsSoundEnabled(nextEnabledState);
    } catch (error) {
      console.error('[Sound Toggle]', error);
      setIsSoundEnabled(false);
    } finally {
      setIsSoundTogglePending(false);
    }
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
      const raw = cfg.generateData(newSize);
      setArray(
        algorithmType === ALGORITHM_TYPES.SORTING
          ? finalizeSortingInputArray(raw, sortOrder)
          : raw
      );
    }
  };

  const handleGridSizeChange = newSize => {
    setGridSize(newSize);
  };

  const handleSearchGraphNodeCountChange = newCount => {
    setSearchGraphNodeCount(newCount);
  };

  const handleTreeNodeCountChange = newCount => {
    setTreeNodeCount(newCount);
  };

  const handleGraphNodeCountChange = newCount => {
    setGraphNodeCount(newCount);
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
      includeExportAudio: isSoundEnabled,
      exportTheme: theme,
      exportLanguage: i18n.resolvedLanguage ?? i18n.language,
    });
  };

  const handleAlgorithmTypeChange = newType => {
    const cfg = CATEGORY_CONFIG[newType];
    if (cfg.sizeBinding === 'array') {
      const searchingKey = selectedAlgorithms[ALGORITHM_TYPES.SEARCHING];
      if (
        newType !== ALGORITHM_TYPES.SEARCHING ||
        !isNodeLinkSearchingAlgorithm(searchingKey)
      ) {
        const raw = cfg.generateData(arraySize);
        setArray(
          newType === ALGORITHM_TYPES.SORTING
            ? finalizeSortingInputArray(raw, sortOrder)
            : raw
        );
      }
    }
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
    searchingVisualization,
    treeTraversalVisualization,
    graphAlgorithmVisualization,
    gridSize,
    activeAlgorithmKey,
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
              onGenerateInput={handleGenerateInput}
              algorithmType={algorithmType}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              isFullScreen={isFullScreen}
              onToggleFullScreen={toggleFullScreen}
              onExportVideo={handleExportVideo}
              onCancelExport={cancelExport}
              exportState={exportState}
              exportProgress={exportProgress}
              canRenderOnWeb={canRenderOnWeb}
              isSoundEnabled={isSoundEnabled}
              isSoundTogglePending={isSoundTogglePending}
              onToggleSound={handleSoundToggle}
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
                      searchGraphNodeCount={searchGraphNodeCount}
                      onSearchGraphNodeCountChange={
                        handleSearchGraphNodeCountChange
                      }
                      treeNodeCount={treeNodeCount}
                      onTreeNodeCountChange={handleTreeNodeCountChange}
                      graphNodeCount={graphNodeCount}
                      onGraphNodeCountChange={handleGraphNodeCountChange}
                      selectedGraphScenario={selectedGraphScenario}
                      onGraphScenarioChange={setSelectedGraphScenario}
                      graphScenarioOptions={
                        graphAlgorithmVisualization.scenarioOptions
                      }
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
                      onGenerateInput={handleGenerateInput}
                      algorithmType={algorithmType}
                      sortOrder={sortOrder}
                      onSortOrderChange={setSortOrder}
                      isFullScreen={isFullScreen}
                      onToggleFullScreen={toggleFullScreen}
                      onExportVideo={handleExportVideo}
                      onCancelExport={cancelExport}
                      exportState={exportState}
                      exportProgress={exportProgress}
                      canRenderOnWeb={canRenderOnWeb}
                      isSoundEnabled={isSoundEnabled}
                      isSoundTogglePending={isSoundTogglePending}
                      onToggleSound={handleSoundToggle}
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
          exportState === 'preview' ||
          exportState === 'error'
        }
        progress={exportProgress}
        phase={
          exportState === 'orientation'
            ? 'orientation'
            : exportState === 'preview'
              ? 'preview'
              : exportState === 'error'
                ? 'error'
                : exportState === 'checking'
                  ? 'checking'
                  : 'rendering'
        }
        errorMessage={exportErrorMessage}
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
