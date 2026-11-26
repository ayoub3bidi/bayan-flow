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
import ShareExportModal from '../components/ShareExportModal';
import SignInPromptModal from '../components/SignInPromptModal';
import ProWaitlistBanner from '../components/ProWaitlistBanner';
import ErrorBoundary from '../components/ErrorBoundary';

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
import { useIsBelowLg } from '../hooks/useIsBelowLg';
import { useVideoExporter } from '../video/useVideoExporter';
import SettingsSheet from '../components/SettingsSheet';
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
  GRID_SIZES,
  ARRAY_VIEWS,
  ARRAY_VIEW_STORAGE_KEY,
} from '../constants';
import { VISUALIZER_REGISTRY } from '../registry/visualizerRegistry';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { getExtraVisualizerProps } from '../registry/extraVisualizerProps';
import { useCategoryVisualizations } from '../hooks/useCategoryVisualizations';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { touchLastActive } from '../services/profileService';
import { useFavorites } from '../hooks/useFavorites';
import {
  canRunVisualization,
  incrementVisualizationCount,
  getRemainingVisualizations,
  canRunVideoExport,
  getExportWatermarkConfig,
  ANONYMOUS_VISUALIZATION_LIMIT,
} from '../services/entitlementService';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate';
import {
  clampGraphAlgorithmNodeCount,
  isGraphScenarioSupported,
} from '../registry/graphAlgorithmRegistry.js';
import {
  finalizeSortingInputArray,
  reorderArrayForSortOrder,
} from '../utils/arrayHelpers';
import {
  trackAlgorithmViewed,
  trackAlgorithmCompleted,
  trackAlgorithmRegenerated,
  trackSpeedChanged,
  trackManualStepping,
  trackFullscreenToggled,
  trackSoundToggled,
  trackCodePanelOpened,
  trackInsightPanelOpened,
  trackVideoExportStarted,
  trackVideoExportCompleted,
  trackVideoShared,
  trackVisualizationStarted,
  trackCategoryChanged,
  trackUpgradeLimitHit,
  trackUpgradeModalViewed,
} from '../services/analyticsEvents';

const SOUND_PREFERENCE_STORAGE_KEY = 'bayan-flow:sound-enabled';
const ALGORITHM_TIP_DURATION_MS = 6000;

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

function readStoredArrayView() {
  if (typeof window === 'undefined') return ARRAY_VIEWS.BARS;

  try {
    return window.localStorage.getItem(ARRAY_VIEW_STORAGE_KEY) ===
      ARRAY_VIEWS.BOXES
      ? ARRAY_VIEWS.BOXES
      : ARRAY_VIEWS.BARS;
  } catch {
    return ARRAY_VIEWS.BARS;
  }
}

function writeStoredArrayView(view) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(ARRAY_VIEW_STORAGE_KEY, view);
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
  const [isSoundEnabled, setIsSoundEnabled] = useState(() =>
    readStoredSoundPreference()
  );
  const [isSoundTogglePending, setIsSoundTogglePending] = useState(false);
  const [arrayView, setArrayView] = useState(readStoredArrayView);
  const [isPythonPanelOpen, setIsPythonPanelOpen] = useState(false);
  /** Code panel width while docked beside the visualizer (Blocks/Split), else null. */
  const [codePanelDockWidth, setCodePanelDockWidth] = useState(null);
  const [isInsightPanelOpen, setIsInsightPanelOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const isBelowLg = useIsBelowLg();

  const handleSpeedChange = newSpeed => {
    trackSpeedChanged(speed, newSpeed);
    setSpeed(newSpeed);
  };

  useBodyScrollLock(
    (isPythonPanelOpen && !codePanelDockWidth) || isInsightPanelOpen
  );

  // null = random graph (the default scenario)
  const [selectedGraphScenario, setSelectedGraphScenario] = useState(null);

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
  // The grid, start and end a pathfinding block program runs on.
  const pathfindingGrid = {
    grid: pathfindingVisualization.grid,
    start: pathfindingVisualization.start,
    end: pathfindingVisualization.end,
  };
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

  // The docked Blocks tab sits beside the visualizer; full screen would hide it.
  const { isFullScreen, toggleFullScreen } = useFullScreen({
    canEnter: !codePanelDockWidth,
  });
  const { isAuthenticated, user } = useAuth();
  const {
    favorites,
    slotLimit: favoriteSlotLimit,
    isFavorite,
    toggleFavorite,
  } = useFavorites(user);
  const [favoriteNotice, setFavoriteNotice] = useState(null);
  const [algorithmTip, setAlgorithmTip] = useState(null);
  const shownAlgorithmTipsRef = useRef(new Set());

  const maybeShowAlgorithmTip = algorithmKey => {
    if (!algorithmKey || shownAlgorithmTipsRef.current.has(algorithmKey))
      return;
    shownAlgorithmTipsRef.current.add(algorithmKey);
    setAlgorithmTip(algorithmKey);
  };

  // "Why it matters" shows briefly in the settings use-case box, then yields to use cases.
  useEffect(() => {
    if (!algorithmTip) return undefined;
    const timer = window.setTimeout(
      () => setAlgorithmTip(null),
      ALGORITHM_TIP_DURATION_MS
    );
    return () => window.clearTimeout(timer);
  }, [algorithmTip]);

  const [gatedFeature, setGatedFeature] = useState(null);
  const [gatedFeatureMetadata, setGatedFeatureMetadata] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const pendingFeatureRef = useRef(null);
  const hasTouchedActivityRef = useRef(false);
  const countedStepsRef = useRef(null);

  const openGatedFeature = (feature, metadata = {}) => {
    trackUpgradeModalViewed(feature);
    setGatedFeature(feature);
    setGatedFeatureMetadata(metadata);
  };

  const closeGatedFeature = () => {
    pendingFeatureRef.current = null;
    setGatedFeature(null);
    setGatedFeatureMetadata({});
  };

  const {
    beginExportFlow,
    reportExportError,
    exportVideo,
    exportState,
    exportProgress,
    exportBlobUrl,
    exportFileName,
    exportErrorMessage,
    cancelExport,
    closePreview,
    downloadVideo,
    getExportBlob,
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
  // A learner's block program is loaded (its steps carry a blockId key, see
  // buildProgramSteps) rather than the algorithm's own steps.
  const isProgramRun = Boolean(
    visualization.steps[0] && 'blockId' in visualization.steps[0]
  );

  // Switching category leaves the source category's hook holding a learner's
  // program: put its algorithm's own steps back now, not on the way back.
  const visualizationMapRef = useRef(visualizationMap);
  visualizationMapRef.current = visualizationMap;
  const previousAlgorithmTypeRef = useRef(algorithmType);
  useEffect(() => {
    const previous = previousAlgorithmTypeRef.current;
    previousAlgorithmTypeRef.current = algorithmType;
    if (previous === algorithmType) return;
    const source = visualizationMapRef.current[previous];
    if (source?.steps[0] && 'blockId' in source.steps[0]) {
      source.reloadSteps?.();
    }
  }, [algorithmType]);

  useEffect(() => {
    const graphAlgorithmKey =
      selectedAlgorithms[ALGORITHM_TYPES.GRAPH_ALGORITHM];

    if (
      selectedGraphScenario &&
      !isGraphScenarioSupported(graphAlgorithmKey, selectedGraphScenario)
    ) {
      setSelectedGraphScenario(null);
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

  // Track algorithm completion
  useEffect(() => {
    if (visualization.isComplete) {
      trackAlgorithmCompleted(activeAlgorithmKey, algorithmType);
    }
  }, [visualization.isComplete, activeAlgorithmKey, algorithmType]);

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

  // ── Feature Gating ──────────────────────────────────────────────────────────

  const openFeature = feature => {
    switch (feature) {
      case 'code':
        setIsPythonPanelOpen(true);
        break;
      case 'insight':
        setIsInsightPanelOpen(true);
        break;
      case 'export':
        beginExportFlow();
        break;
      case 'sound':
        handleSoundToggle();
        break;
      case 'fullscreen':
        toggleFullScreen();
        break;
    }
  };

  useEffect(() => {
    if (!user) {
      hasTouchedActivityRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      if (pendingFeatureRef.current) {
        openFeature(pendingFeatureRef.current);
        pendingFeatureRef.current = null;
      }
      closeGatedFeature();
    }
    // openFeature is not a dependency since it's defined above and stable within this scope
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Anonymous trial accounting: each run (one generated steps array) costs one
   * credit, however it is advanced (play, manual step, seek). Pause/resume and
   * replay of the same steps are free. Returns false when the limit blocks it.
   */
  const consumeRunIfNeeded = () => {
    if (countedStepsRef.current === visualization.steps) return true;
    const runSource = isProgramRun ? 'blocks' : 'algorithm';
    if (user) {
      countedStepsRef.current = visualization.steps;
      trackVisualizationStarted(
        activeAlgorithmKey,
        algorithmType,
        true,
        runSource
      );
      return true;
    }
    if (!canRunVisualization(user)) {
      trackUpgradeLimitHit(ANONYMOUS_VISUALIZATION_LIMIT);
      openGatedFeature('session_limit', {
        limit: ANONYMOUS_VISUALIZATION_LIMIT,
      });
      return false;
    }
    incrementVisualizationCount();
    countedStepsRef.current = visualization.steps;
    trackVisualizationStarted(
      activeAlgorithmKey,
      algorithmType,
      false,
      runSource
    );
    return true;
  };

  /** Play handler with session limit check for anonymous users */
  const handlePlay = () => {
    if (!consumeRunIfNeeded()) return;
    if (user && !hasTouchedActivityRef.current) {
      hasTouchedActivityRef.current = true;
      void touchLastActive();
    }
    visualization.play();
  };

  /** Load a learner's block program into the active category's visualizer. */
  const pendingProgramAutoplayRef = useRef(false);
  const handleProgramSteps = steps => {
    pendingProgramAutoplayRef.current = mode === VISUALIZATION_MODES.AUTOPLAY;
    visualization.loadSteps(steps);
  };

  // Autoplay starts once the program's steps are in state, through handlePlay
  // so the run is counted like any other. Manual mode waits for the learner.
  useEffect(() => {
    if (!pendingProgramAutoplayRef.current) return;
    pendingProgramAutoplayRef.current = false;
    handlePlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualization.steps]);

  // Only block-program steps carry a blockId.
  const activeBlockId =
    visualization.steps[visualization.currentStep]?.blockId ?? null;

  // Leaving the Blocks tab (close, other tab, narrow viewport) puts the
  // algorithm's own steps back: the learner's program must not stay labelled
  // as the algorithm, nor be exported as it.
  const isProgramRunRef = useRef(isProgramRun);
  isProgramRunRef.current = isProgramRun;
  const reloadStepsRef = useRef(visualization.reloadSteps);
  reloadStepsRef.current = visualization.reloadSteps;
  useEffect(() => {
    if (codePanelDockWidth) return;
    // The docked-only settings drawer must not reappear on the next dock.
    if (!isBelowLg) setIsSettingsSheetOpen(false);
    if (isProgramRunRef.current) reloadStepsRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codePanelDockWidth]);

  const isSettingsSheetVisible =
    (isBelowLg || Boolean(codePanelDockWidth)) && isSettingsSheetOpen;

  const handleSeek = step => {
    if (!consumeRunIfNeeded()) return;
    visualization.seekToStep(step);
  };

  /** Handler for locked algorithm clicks (anonymous tier) */
  const handleLockedAlgorithmClick = algo => {
    openGatedFeature('algorithm_lock', { algorithmName: algo.label });
  };

  /** New random input data for the active category (array: regenerate values; grid: new start/end). */
  const handleGenerateInput = () => {
    trackAlgorithmRegenerated(activeAlgorithmKey, algorithmType);
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
      trackSoundToggled(false);
      return;
    }

    setIsSoundTogglePending(true);

    try {
      await soundManager.enable();
      const nextEnabledState = soundManager.getIsEnabled();
      setIsSoundEnabled(nextEnabledState);
      trackSoundToggled(nextEnabledState);
    } catch (error) {
      console.error('[Sound Toggle]', error);
      setIsSoundEnabled(false);
      trackSoundToggled(false);
    } finally {
      setIsSoundTogglePending(false);
    }
  };

  const handleArrayViewChange = view => {
    setArrayView(view);
    writeStoredArrayView(view);
  };

  const handleGatedSoundToggle = () => {
    if (isAuthenticated) {
      handleSoundToggle();
    } else {
      pendingFeatureRef.current = 'sound';
      openGatedFeature('sound');
    }
  };

  const handleGatedFullscreenToggle = () => {
    if (codePanelDockWidth && !isFullScreen) return;
    if (isAuthenticated) {
      trackFullscreenToggled(!isFullScreen);
      toggleFullScreen();
    } else {
      pendingFeatureRef.current = 'fullscreen';
      openGatedFeature('fullscreen');
    }
  };

  const handleAlgorithmChange = algorithmName => {
    trackAlgorithmViewed(algorithmName, algorithmType);
    maybeShowAlgorithmTip(algorithmName);
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
    if (visualization.totalSteps === 0 || isProgramRun) return;
    if (!isAuthenticated) {
      pendingFeatureRef.current = 'export';
      openGatedFeature('export');
      return;
    }

    if (!canRunVideoExport(user)) {
      reportExportError(t('controls.exportTemporarilyUnavailable'));
      return;
    }

    beginExportFlow();
  };

  const handleOrientationSelected = orientation => {
    if (isProgramRun) return;
    if (!canRunVideoExport(user)) {
      reportExportError(t('controls.exportTemporarilyUnavailable'));
      return;
    }

    trackVideoExportStarted(orientation, activeAlgorithmKey);
    exportVideo({
      steps: visualization.steps,
      algorithmType,
      algorithmName: activeAlgorithmName,
      algorithmKey: activeAlgorithmKey,
      speed,
      gridSize,
      orientation,
      watermark: getExportWatermarkConfig(user),
      exportTheme: theme,
      exportLanguage: i18n.resolvedLanguage ?? i18n.language,
      arrayView,
    });
  };

  const handleDownloadComplete = () => {
    trackVideoExportCompleted(activeAlgorithmKey);
    downloadVideo();
    setShowShareModal(true);
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
  };

  const handleAlgorithmTypeChange = newType => {
    trackCategoryChanged(algorithmType, newType);
    applyCategorySwitch(newType);
  };

  const applyCategorySwitch = (
    newType,
    tipKey = selectedAlgorithms[newType]
  ) => {
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
    maybeShowAlgorithmTip(tipKey);
  };

  const handleFavoriteNavigate = (category, algorithmKey) => {
    if (category !== algorithmType) {
      applyCategorySwitch(category, algorithmKey);
    }
    setSelectedAlgorithms(prev => ({
      ...prev,
      [category]: algorithmKey,
    }));
    maybeShowAlgorithmTip(algorithmKey);
    visualizationMap[category]?.reset();
  };

  const handleToggleFavorite = async (category, algorithmKey) => {
    const result = await toggleFavorite(category, algorithmKey);
    if (result.reason === 'slot_limit') {
      setFavoriteNotice('slot_limit');
      window.setTimeout(() => setFavoriteNotice(null), 4000);
    }
  };

  const handleFavoriteGatedClick = () => {
    openGatedFeature('favorite');
  };

  const handleStepForward = () => {
    if (!consumeRunIfNeeded()) return;
    trackManualStepping(activeAlgorithmKey, 'forward');
    visualization.stepForward();
  };

  const handleStepBackward = () => {
    trackManualStepping(activeAlgorithmKey, 'backward');
    visualization.stepBackward();
  };

  // ── Shared visualizer props ────────────────────────────────────────────────
  /** Props common to all visualizer components. */
  const sharedVisualizerProps = {
    states: visualization.states,
    description: visualization.description,
    isComplete: visualization.isComplete,
    algorithm: activeAlgorithmKey,
    onStepForward: handleStepForward,
    onStepBackward: handleStepBackward,
    mode,
  };

  const extraVisualizerProps = getExtraVisualizerProps(algorithmType, {
    sortingVisualization,
    searchingVisualization,
    treeTraversalVisualization,
    graphAlgorithmVisualization,
    gridSize,
    activeAlgorithmKey,
    arrayView,
  });

  const settingsPanelProps = {
    algorithmType,
    algorithmTip,
    showPlaybackSettings: isBelowLg,
    onAlgorithmTypeChange: handleAlgorithmTypeChange,
    selectedAlgorithm: activeAlgorithmKey,
    onAlgorithmChange: handleAlgorithmChange,
    speed,
    onSpeedChange: handleSpeedChange,
    arraySize,
    onArraySizeChange: handleArraySizeChange,
    gridSize,
    onGridSizeChange: handleGridSizeChange,
    searchGraphNodeCount,
    onSearchGraphNodeCountChange: handleSearchGraphNodeCountChange,
    treeNodeCount,
    onTreeNodeCountChange: handleTreeNodeCountChange,
    graphNodeCount,
    onGraphNodeCountChange: handleGraphNodeCountChange,
    selectedGraphScenario,
    onGraphScenarioChange: setSelectedGraphScenario,
    graphScenarioOptions: graphAlgorithmVisualization.scenarioOptions,
    isPlaying: visualization.isPlaying,
    mode,
    onModeChange: setMode,
    user,
    onLockedAlgorithmClick: handleLockedAlgorithmClick,
    favorites,
    favoriteSlotLimit: isAuthenticated ? favoriteSlotLimit : null,
    onFavoriteSelect: handleFavoriteNavigate,
    isFavorite,
    onToggleFavorite: handleToggleFavorite,
    onFavoriteGatedClick: handleFavoriteGatedClick,
    isAuthenticated,
  };

  const remainingVisualizations =
    !user && getRemainingVisualizations(user) < Infinity
      ? getRemainingVisualizations(user)
      : null;

  const controlPanelProps = {
    isPlaying: visualization.isPlaying,
    isComplete: visualization.isComplete,
    mode,
    onModeChange: setMode,
    speed,
    onSpeedChange: handleSpeedChange,
    onPlay: handlePlay,
    onPause: visualization.pause,
    onReset: visualization.reset,
    onStepForward: handleStepForward,
    onStepBackward: handleStepBackward,
    onSeek: handleSeek,
    currentStep: visualization.currentStep,
    totalSteps: visualization.totalSteps,
    onGenerateInput: handleGenerateInput,
    algorithmType,
    sortOrder,
    onSortOrderChange: setSortOrder,
    arrayView,
    onArrayViewChange: handleArrayViewChange,
    showArrayViewToggle:
      algorithmType === ALGORITHM_TYPES.SORTING ||
      (algorithmType === ALGORITHM_TYPES.SEARCHING &&
        !isNodeLinkSearchingAlgorithm(activeAlgorithmKey)),
    isFullScreen,
    isFullScreenDisabled: Boolean(codePanelDockWidth) && !isFullScreen,
    isExportDisabled: isProgramRun,
    onToggleFullScreen: handleGatedFullscreenToggle,
    onExportVideo: handleExportVideo,
    onCancelExport: cancelExport,
    exportState,
    exportProgress,
    canRenderOnWeb,
    isSoundEnabled,
    isSoundTogglePending,
    onToggleSound: handleGatedSoundToggle,
    isGated: !isAuthenticated,
    visualizationsRemaining: remainingVisualizations,
    // The docked Blocks panel hides the sidebar, so settings open as a drawer.
    onOpenSettings:
      isBelowLg || codePanelDockWidth
        ? () => setIsSettingsSheetOpen(true)
        : undefined,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`bg-bg flex flex-col ${
        isBelowLg
          ? 'h-screen-safe max-h-screen-safe overflow-hidden'
          : 'min-h-screen-safe'
      }`}
    >
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        {t('a11y.skipToContent')}
      </a>
      <ProWaitlistBanner source="app" />

      <div className="flex-1 min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          {isFullScreen ? (
            <motion.div
              key="fullscreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 h-dvh bg-gray-900 flex flex-col p-4"
              role="main"
              id="main-content"
            >
              <div className="flex-1 min-h-0 mb-4">
                <VisualizerComponent
                  {...sharedVisualizerProps}
                  {...extraVisualizerProps}
                />
              </div>

              <ControlPanel {...controlPanelProps} onOpenSettings={undefined} />
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col flex-1 min-h-0 h-full ${
                isBelowLg ? 'overflow-hidden' : ''
              }`}
            >
              <Header />
              <main
                className={`flex-1 min-h-0 ${
                  isBelowLg
                    ? 'flex flex-col p-3 gap-3 overflow-hidden'
                    : 'p-6 transition-[padding-inline-end] duration-300 ease-out motion-reduce:transition-none'
                }`}
                style={
                  codePanelDockWidth && !isBelowLg
                    ? {
                        paddingInlineEnd: `calc(${codePanelDockWidth} + 1.5rem)`,
                      }
                    : undefined
                }
                role="main"
                id="main-content"
              >
                {isBelowLg ? (
                  <section
                    className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden"
                    role="region"
                    aria-label={t('a11y.algorithmVisualization')}
                  >
                    <div
                      className="flex-1 min-h-0 overflow-hidden"
                      role="img"
                      aria-label={t('a11y.namedVisualization', {
                        name: activeAlgorithmKey,
                      })}
                    >
                      <VisualizerComponent
                        {...sharedVisualizerProps}
                        {...extraVisualizerProps}
                      />
                    </div>
                    <ControlPanel {...controlPanelProps} />
                  </section>
                ) : (
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Docked blocks panel: give its room to the visualizer. */}
                      {!codePanelDockWidth && (
                        <aside
                          className="lg:col-span-1"
                          role="complementary"
                          aria-label={t('a11y.algorithmSettings')}
                        >
                          <SettingsPanel {...settingsPanelProps} />
                        </aside>
                      )}

                      <section
                        className={`${codePanelDockWidth ? 'lg:col-span-4' : 'lg:col-span-3'} flex flex-col gap-4 h-[calc(100vh-85px)]`}
                        role="region"
                        aria-label={t('a11y.algorithmVisualization')}
                      >
                        <div
                          className="flex-1 min-h-0"
                          role="img"
                          aria-label={t('a11y.namedVisualization', {
                            name: activeAlgorithmKey,
                          })}
                        >
                          <VisualizerComponent
                            {...sharedVisualizerProps}
                            {...extraVisualizerProps}
                          />
                        </div>
                        <ControlPanel {...controlPanelProps} />
                      </section>
                    </div>
                  </div>
                )}
              </main>
              {!isBelowLg ? <Footer /> : null}

              <AnimatePresence>
                {favoriteNotice && (
                  <motion.div
                    key="favorite-notice"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 text-xs sm:text-sm text-text-primary bg-surface-elevated px-3 py-2 rounded-lg shadow-md border border-[var(--color-border-strong)]"
                    role="status"
                    aria-live="polite"
                  >
                    {t('settings.favoriteSlotsFull', {
                      limit: favoriteSlotLimit,
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isPythonPanelOpen && !isInsightPanelOpen && (
                <>
                  <FloatingActionButton
                    onClick={() => {
                      if (isAuthenticated) {
                        trackCodePanelOpened(activeAlgorithmKey);
                        setIsPythonPanelOpen(true);
                      } else {
                        pendingFeatureRef.current = 'code';
                        openGatedFeature('code');
                      }
                    }}
                    disabled={!activeAlgorithmKey}
                    isGated={!isAuthenticated}
                  />
                  <InsightFloatingActionButton
                    onClick={() => {
                      if (isAuthenticated) {
                        trackInsightPanelOpened(activeAlgorithmKey);
                        setIsInsightPanelOpen(true);
                      } else {
                        pendingFeatureRef.current = 'insight';
                        openGatedFeature('insight');
                      }
                    }}
                    disabled={!activeAlgorithmKey}
                    label={t('insight_panel.viewInsight')}
                    isGated={!isAuthenticated}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SettingsSheet
        isOpen={isSettingsSheetVisible}
        onClose={() => setIsSettingsSheetOpen(false)}
        settingsPanelProps={settingsPanelProps}
        placement={isBelowLg ? 'full' : 'side'}
      />

      <ExportProgressModal
        open={
          exportState === 'orientation' ||
          exportState === 'checking' ||
          exportState === 'rendering' ||
          exportState === 'preview' ||
          exportState === 'error'
        }
        progress={exportProgress}
        stepCount={visualization.steps?.length}
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
        onDownload={handleDownloadComplete}
        onOrientationSelect={handleOrientationSelected}
      />

      <ShareExportModal
        open={showShareModal}
        algorithmName={activeAlgorithmName}
        videoBlob={getExportBlob()}
        videoFileName={exportFileName}
        onShare={({ platform }) =>
          trackVideoShared(platform, activeAlgorithmKey)
        }
        onClose={handleShareModalClose}
      />

      <ErrorBoundary>
        <Suspense fallback={null}>
          <PythonCodePanel
            isOpen={isPythonPanelOpen}
            onClose={() => setIsPythonPanelOpen(false)}
            algorithm={activeAlgorithmKey}
            currentArray={array}
            currentTarget={searchingVisualization.targetValue}
            currentGrid={pathfindingGrid}
            currentTree={treeTraversalVisualization.treeContext}
            currentGraph={
              algorithmType === ALGORITHM_TYPES.GRAPH_ALGORITHM
                ? graphAlgorithmVisualization.graphContext
                : searchingVisualization.graphContext
            }
            activeBlockId={activeBlockId}
            onProgramSteps={handleProgramSteps}
            onDockChange={setCodePanelDockWidth}
            // The side settings drawer is modal: the docked panel stays in
            // view but can't be clicked or focused meanwhile.
            isInert={isSettingsSheetVisible && Boolean(codePanelDockWidth)}
          />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={null}>
          <AlgorithmInsightPanel
            isOpen={isInsightPanelOpen}
            onClose={() => setIsInsightPanelOpen(false)}
            algorithmKey={activeAlgorithmKey}
            algorithmName={activeAlgorithmName}
            categoryType={algorithmType}
            user={user}
          />
        </Suspense>
      </ErrorBoundary>

      <SignInPromptModal
        feature={gatedFeature}
        isOpen={gatedFeature !== null}
        metadata={gatedFeatureMetadata}
        onClose={closeGatedFeature}
      />
    </div>
  );
}

export default App;
