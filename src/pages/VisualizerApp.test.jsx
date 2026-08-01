/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithI18n, screen, fireEvent, waitFor } from '../test/testUtils';
import VisualizerApp from './VisualizerApp.jsx';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { soundManager } from '../utils/soundManager';
import { resetSoundManagerMock } from '../test/soundManagerMock.js';

const {
  beginExportFlow,
  reportExportError,
  exportVideo,
  videoExporterMock,
  fullScreenMock,
} = vi.hoisted(() => {
  const beginExportFlowInner = vi.fn();
  const reportExportErrorInner = vi.fn();
  const exportVideoInner = vi.fn();
  const toggleFullScreenInner = vi.fn();
  const videoExporterMockInner = {
    beginExportFlow: beginExportFlowInner,
    reportExportError: reportExportErrorInner,
    exportVideo: exportVideoInner,
    exportState: 'idle',
    exportProgress: 0,
    exportBlobUrl: null,
    exportErrorMessage: null,
    cancelExport: vi.fn(),
    closePreview: vi.fn(),
    downloadVideo: vi.fn(),
    getExportBlob: vi.fn(() => null),
    exportAlgorithmMeta: null,
    exportFileName: 'visualization.mp4',
  };
  const fullScreenMockInner = {
    isFullScreen: false,
    toggleFullScreen: toggleFullScreenInner,
  };
  return {
    beginExportFlow: beginExportFlowInner,
    reportExportError: reportExportErrorInner,
    exportVideo: exportVideoInner,
    toggleFullScreen: toggleFullScreenInner,
    videoExporterMock: videoExporterMockInner,
    fullScreenMock: fullScreenMockInner,
  };
});

const authMock = vi.hoisted(() => ({
  isAuthenticated: true,
  isLoading: false,
  isConfigured: true,
  user: { id: 'test-user', email: 'test@example.com' },
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  session: {},
  profile: {
    displayName: 'Test User',
    email: 'test@example.com',
    avatarSrc: '',
    avatarSource: 'google',
    plan: 'free',
  },
}));

const useFavoritesMock = vi.hoisted(() => ({
  useFavorites: vi.fn(() => ({
    favorites: [],
    favoriteSlotLimit: 20,
    isLoading: false,
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(() => Promise.resolve({ ok: true })),
  })),
}));

const sortingVisualization = {
  array: [3, 1, 2],
  states: ['sorting-state'],
  description: 'Sorting description',
  isComplete: false,
  stepForward: vi.fn(),
  stepBackward: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  seekToStep: vi.fn(),
  isPlaying: false,
  currentStep: 0,
  totalSteps: 0,
  steps: [],
};

const pathfindingVisualization = {
  states: [['path-state']],
  description: 'Path description',
  isComplete: false,
  stepForward: vi.fn(),
  stepBackward: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  regenerateGrid: vi.fn(),
  seekToStep: vi.fn(),
  isPlaying: false,
  currentStep: 0,
  totalSteps: 2,
  steps: [{ description: 'path step' }],
  start: { row: 0, col: 0 },
  end: { row: 1, col: 1 },
};

const searchingVisualization = {
  array: [1, 2, 3],
  states: ['default', 'default', 'default'],
  targetValue: 2,
  graphNodes: [],
  graphEdges: [],
  graphNodeStates: {},
  graphStackOrder: [],
  regenerateGraphStructure: vi.fn(),
  description: 'Search description',
  isComplete: false,
  stepForward: vi.fn(),
  stepBackward: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  seekToStep: vi.fn(),
  isPlaying: false,
  currentStep: 0,
  totalSteps: 1,
  steps: [{ description: 'search step', array: [1, 2, 3], states: [] }],
};

const treeTraversalVisualization = {
  treeNodes: [],
  treeEdges: [],
  treeNodeStates: {},
  visitOrder: [],
  states: [],
  description: 'Tree description',
  isComplete: false,
  stepForward: vi.fn(),
  stepBackward: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  regenerateTree: vi.fn(),
  reloadSteps: vi.fn(),
  seekToStep: vi.fn(),
  isPlaying: false,
  currentStep: 0,
  totalSteps: 1,
  steps: [{ description: 'tree step' }],
};

const graphAlgorithmVisualization = {
  graphNodes: [],
  graphEdges: [],
  graphNodeStates: {},
  graphEdgeStates: {},
  graphStackOrder: [],
  graphOutputOrder: [],
  graphArtifacts: { badges: [] },
  graphMatrix: null,
  representation: 'nodeLink',
  directed: true,
  weighted: false,
  scenarioOptions: [
    { id: 'linearChain', i18nKey: 'graphScenarios.linearChain' },
    { id: 'diamond', i18nKey: 'graphScenarios.diamond' },
  ],
  states: [],
  description: 'Graph description',
  isComplete: false,
  stepForward: vi.fn(),
  stepBackward: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  regenerateGraph: vi.fn(),
  reloadSteps: vi.fn(),
  seekToStep: vi.fn(),
  isPlaying: false,
  currentStep: 0,
  totalSteps: 1,
  steps: [{ description: 'graph step' }],
};

vi.mock('../components/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../components/ExportProgressModal', () => ({
  default: ({ open, onOrientationSelect, errorMessage }) =>
    open ? (
      <div data-testid="export-modal">
        {errorMessage ? (
          <span data-testid="export-error-message">{errorMessage}</span>
        ) : null}
        <button
          type="button"
          onClick={() => onOrientationSelect?.('horizontal')}
        >
          pick-orientation
        </button>
      </div>
    ) : null,
}));

vi.mock('../components/ShareExportModal', () => ({
  default: ({ open, onClose }) =>
    open ? (
      <div data-testid="share-modal">
        <button type="button" onClick={onClose}>
          close-share
        </button>
      </div>
    ) : null,
}));

vi.mock('../components/FloatingActionButton', () => ({
  default: ({ disabled, onClick }) => (
    <button data-testid="code-fab" disabled={disabled} onClick={onClick}>
      Code
    </button>
  ),
}));

vi.mock('../components/PythonCodePanel', () => ({
  default: ({ algorithm }) => (
    <div data-testid="python-panel">{algorithm ?? 'none'}</div>
  ),
}));

vi.mock('../components/AlgorithmInsightPanel', () => ({
  default: ({ algorithm }) => (
    <div data-testid="insight-panel">{algorithm ?? 'none'}</div>
  ),
}));

vi.mock('../components/SettingsPanel', () => ({
  default: ({
    algorithmType,
    selectedAlgorithm,
    selectedGraphScenario,
    graphNodeCount,
    onAlgorithmTypeChange,
    onAlgorithmChange,
    onToggleFavorite,
  }) => (
    <div data-testid="settings-panel">
      <div data-testid="algorithm-type">{algorithmType}</div>
      <div data-testid="selected-algorithm">{selectedAlgorithm}</div>
      <div data-testid="selected-graph-scenario">
        {String(selectedGraphScenario)}
      </div>
      <div data-testid="graph-node-count">{String(graphNodeCount)}</div>
      <button onClick={() => onAlgorithmTypeChange('sorting')}>sorting</button>
      <button onClick={() => onAlgorithmTypeChange('pathfinding')}>
        pathfinding
      </button>
      <button onClick={() => onAlgorithmTypeChange('graphAlgorithm')}>
        graphAlgorithm
      </button>
      <button onClick={() => onAlgorithmChange('dijkstra')}>
        select-dijkstra
      </button>
      <button onClick={() => onAlgorithmChange('quickSort')}>
        select-quick-sort
      </button>
      <button onClick={() => onAlgorithmChange('floydWarshallAlgorithm')}>
        select-floyd-warshall
      </button>
      <button
        data-testid="trigger-favorite"
        onClick={() => onToggleFavorite?.('sorting', 'bubbleSort')}
      >
        trigger-favorite
      </button>
    </div>
  ),
}));

vi.mock('../components/ControlPanel', () => ({
  default: ({
    totalSteps,
    algorithmType,
    onExportVideo,
    onGenerateInput,
    isSoundEnabled,
    isSoundTogglePending,
    onToggleSound,
    sortOrder,
    onSortOrderChange,
    onToggleFullScreen,
    visualizationsRemaining,
    onSeek,
    isGated,
    onGatedFeatureClick,
  }) => (
    <div data-testid="control-panel">
      <span data-testid="control-total-steps">{String(totalSteps)}</span>
      <span data-testid="control-algorithm-type">{algorithmType}</span>
      <span data-testid="control-sort-order">{String(sortOrder)}</span>
      <span data-testid="sound-enabled">{String(isSoundEnabled)}</span>
      <span data-testid="sound-pending">{String(isSoundTogglePending)}</span>
      <button type="button" onClick={onGenerateInput}>
        generate-data
      </button>
      <button onClick={onExportVideo}>export</button>
      <button type="button" onClick={onToggleSound}>
        toggle-sound
      </button>
      <button type="button" onClick={onToggleFullScreen}>
        toggle-fullscreen
      </button>
      {onSeek && (
        <button type="button" onClick={() => onSeek(2)}>
          seek-to-step-2
        </button>
      )}
      {isGated && (
        <button
          type="button"
          onClick={() => onGatedFeatureClick('timeline_scrub')}
        >
          gated-seek
        </button>
      )}
      {visualizationsRemaining != null &&
      Number.isFinite(visualizationsRemaining) ? (
        <p role="status">
          {`${visualizationsRemaining} visualizations remaining`}
        </p>
      ) : null}
      {algorithmType === 'sorting' && (
        <button
          type="button"
          data-testid="toggle-sort-order"
          onClick={() =>
            onSortOrderChange(
              sortOrder === 'ascending' ? 'descending' : 'ascending'
            )
          }
        >
          toggle-sort-order
        </button>
      )}
    </div>
  ),
}));

vi.mock('../components/ArrayVisualizer', () => ({
  default: ({ array, algorithm }) => (
    <div data-testid="array-visualizer">
      {algorithm}:{array.join(',')}
    </div>
  ),
}));

vi.mock('../components/GridVisualizer', () => ({
  default: ({ gridSize, algorithm }) => (
    <div data-testid="grid-visualizer">
      {algorithm}:{gridSize}
    </div>
  ),
}));

vi.mock('../components/TreeVisualizer', () => ({
  default: ({ algorithm }) => (
    <div data-testid="tree-visualizer">{algorithm}</div>
  ),
}));

vi.mock('../components/GraphVisualizer', () => ({
  default: ({ algorithm }) => (
    <div data-testid="graph-visualizer">{algorithm}</div>
  ),
}));

vi.mock('../hooks/useSortingVisualization', () => ({
  /** Forward input array from VisualizerApp so sort-order and generate handlers affect the mock visualizer. */
  useSortingVisualization: (_algorithmKey, initialArray, _speed, _mode) => ({
    ...sortingVisualization,
    array: Array.isArray(initialArray)
      ? [...initialArray]
      : sortingVisualization.array,
  }),
}));

vi.mock('../hooks/usePathfindingVisualization', () => ({
  usePathfindingVisualization: () => pathfindingVisualization,
}));

vi.mock('../hooks/useSearchingVisualization', () => ({
  useSearchingVisualization: () => searchingVisualization,
}));

vi.mock('../hooks/useTreeTraversalVisualization', () => ({
  useTreeTraversalVisualization: () => treeTraversalVisualization,
}));

vi.mock('../hooks/useGraphAlgorithmVisualization', () => ({
  useGraphAlgorithmVisualization: () => graphAlgorithmVisualization,
}));

vi.mock('../hooks/useFullScreen', () => ({
  useFullScreen: () => ({
    isFullScreen: fullScreenMock.isFullScreen,
    toggleFullScreen: fullScreenMock.toggleFullScreen,
  }),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authMock,
}));

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: useFavoritesMock.useFavorites,
}));

vi.mock('../components/SignInPromptModal', () => ({
  default: ({ feature, isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="sign-in-prompt-modal">
        <span data-testid="gated-feature">{feature}</span>
        <button type="button" onClick={onClose}>
          maybe-later
        </button>
      </div>
    ) : null,
}));

vi.mock('../hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}));

vi.mock('../video/useVideoExporter', async () => {
  const React = await vi.importActual('react');

  return {
    useVideoExporter: () => {
      const [exportState, setExportState] = React.useState(
        videoExporterMock.exportState
      );
      const [exportErrorMessage, setExportErrorMessage] = React.useState(
        videoExporterMock.exportErrorMessage
      );

      return {
        beginExportFlow: videoExporterMock.beginExportFlow,
        reportExportError: message => {
          videoExporterMock.reportExportError(message);
          videoExporterMock.exportErrorMessage = message;
          setExportErrorMessage(message);
          setExportState('error');
        },
        exportVideo: videoExporterMock.exportVideo,
        exportState,
        exportProgress: videoExporterMock.exportProgress,
        exportBlobUrl: videoExporterMock.exportBlobUrl,
        exportErrorMessage,
        cancelExport: videoExporterMock.cancelExport,
        closePreview: videoExporterMock.closePreview,
        downloadVideo: videoExporterMock.downloadVideo,
        getExportBlob: videoExporterMock.getExportBlob,
        exportAlgorithmMeta: videoExporterMock.exportAlgorithmMeta,
        exportFileName: videoExporterMock.exportFileName,
        canRenderOnWeb: true,
      };
    },
  };
});

describe('VisualizerApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSoundManagerMock();
    window.localStorage.clear();
    document.body.style.cssText = '';
    fullScreenMock.isFullScreen = false;
    videoExporterMock.exportState = 'idle';
    videoExporterMock.exportProgress = 0;
    videoExporterMock.exportBlobUrl = null;
    videoExporterMock.exportErrorMessage = null;
    videoExporterMock.exportAlgorithmMeta = null;
    videoExporterMock.getExportBlob.mockReturnValue(null);
    authMock.isAuthenticated = true;
    authMock.user = { id: 'test-user', email: 'test@example.com' };
    useFavoritesMock.useFavorites.mockImplementation(() => ({
      favorites: [],
      favoriteSlotLimit: 20,
      isLoading: false,
      isFavorite: vi.fn(() => false),
      toggleFavorite: vi.fn(() => Promise.resolve({ ok: true })),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.cssText = '';
    resetSoundManagerMock();
  });

  async function renderApp() {
    renderWithI18n(
      <MemoryRouter initialEntries={['/app']}>
        <ThemeProvider>
          <VisualizerApp />
        </ThemeProvider>
      </MemoryRouter>
    );
    await screen.findByTestId('python-panel');
    await screen.findByTestId('insight-panel');
  }

  it('renders the registered visualizer for the active category', async () => {
    await renderApp();

    const sortingText =
      screen.getByTestId('array-visualizer').textContent ?? '';
    expect(sortingText).toMatch(/^bubbleSort:\d+(,\d+)+$/);
    expect(screen.queryByTestId('grid-visualizer')).not.toBeInTheDocument();
  });

  it('defaults graph algorithms to the first supported preset scenario', async () => {
    await renderApp();

    fireEvent.click(screen.getByText('graphAlgorithm'));

    expect(screen.getByTestId('selected-graph-scenario')).toHaveTextContent(
      'linearChain'
    );
  });

  it('clamps graph node count when switching to Floyd-Warshall', async () => {
    await renderApp();

    fireEvent.click(screen.getByText('graphAlgorithm'));
    expect(screen.getByTestId('graph-node-count')).toHaveTextContent('10');

    fireEvent.click(screen.getByText('select-floyd-warshall'));

    expect(screen.getByTestId('selected-algorithm')).toHaveTextContent(
      'floydWarshallAlgorithm'
    );
    expect(screen.getByTestId('graph-node-count')).toHaveTextContent('6');
  });

  it('preserves selected algorithms per category when switching tabs', async () => {
    await renderApp();

    expect(screen.getByTestId('selected-algorithm')).toHaveTextContent(
      'bubbleSort'
    );

    fireEvent.click(screen.getByText('pathfinding'));
    expect(pathfindingVisualization.reset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('grid-visualizer')).toHaveTextContent('bfs:15');

    fireEvent.click(screen.getByText('select-dijkstra'));
    expect(pathfindingVisualization.reset).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('selected-algorithm')).toHaveTextContent(
      'dijkstra'
    );
    expect(screen.getByTestId('grid-visualizer')).toHaveTextContent(
      'dijkstra:15'
    );

    fireEvent.click(screen.getByText('sorting'));
    expect(sortingVisualization.reset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('selected-algorithm')).toHaveTextContent(
      'bubbleSort'
    );

    fireEvent.click(screen.getByText('pathfinding'));
    expect(screen.getByTestId('selected-algorithm')).toHaveTextContent(
      'dijkstra'
    );
  });

  it('only begins export when the active visualization has steps', async () => {
    await renderApp();

    fireEvent.click(screen.getByText('export'));
    expect(beginExportFlow).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('pathfinding'));
    fireEvent.click(screen.getByText('export'));

    expect(beginExportFlow).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId('sign-in-prompt-modal')
    ).not.toBeInTheDocument();
  });

  it('shows the export error modal when a free user reaches the private daily guard', async () => {
    window.localStorage.setItem(
      'free_export_daily_test-user',
      JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        count: 50,
      })
    );
    await renderApp();

    fireEvent.click(screen.getByText('pathfinding'));
    fireEvent.click(screen.getByText('export'));

    expect(beginExportFlow).not.toHaveBeenCalled();
    expect(reportExportError).toHaveBeenCalledWith(
      'Export unavailable right now. Please try again later.'
    );
    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByTestId('export-error-message')).toHaveTextContent(
      'Export unavailable right now. Please try again later.'
    );
  });

  it('dispatches new data by category: array config vs grid regenerateGrid', async () => {
    await renderApp();

    fireEvent.click(screen.getByText('generate-data'));
    expect(pathfindingVisualization.regenerateGrid).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('pathfinding'));
    fireEvent.click(screen.getByText('generate-data'));

    expect(pathfindingVisualization.regenerateGrid).toHaveBeenCalledTimes(1);
  });

  it('renders fullscreen layout when useFullScreen reports true', async () => {
    fullScreenMock.isFullScreen = true;
    window.localStorage.setItem('bayan-flow:sound-enabled', 'true');
    await renderApp();

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('array-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
  });

  it('opens export modal when export enters the error phase', async () => {
    videoExporterMock.exportState = 'error';
    videoExporterMock.exportErrorMessage = 'Codec unavailable';
    await renderApp();

    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
  });

  it('calls exportVideo with algorithm metadata when orientation is chosen', async () => {
    videoExporterMock.exportState = 'orientation';
    await renderApp();

    fireEvent.click(screen.getByText('pick-orientation'));

    expect(exportVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        algorithmType: 'sorting',
        algorithmKey: 'bubbleSort',
        orientation: 'horizontal',
        steps: sortingVisualization.steps,
        watermark: expect.objectContaining({
          enabled: true,
          text: 'Bayan Flow',
        }),
        exportTheme: expect.stringMatching(/^(light|dark)$/),
        exportLanguage: expect.any(String),
      })
    );
  });

  it('reorders the sorting array when sort order is toggled on sorting category', async () => {
    await renderApp();

    const parseNums = raw => {
      const payload = raw.replace(/^bubbleSort:/, '');
      return payload.split(',').map(Number);
    };

    const initialNums = parseNums(
      screen.getByTestId('array-visualizer').textContent ?? ''
    );

    fireEvent.click(screen.getByTestId('toggle-sort-order'));
    await waitFor(() => {
      const descending = parseNums(
        screen.getByTestId('array-visualizer').textContent ?? ''
      );
      expect(descending).toEqual([...initialNums].sort((a, b) => b - a));
    });

    fireEvent.click(screen.getByTestId('toggle-sort-order'));
    await waitFor(() => {
      const ascending = parseNums(
        screen.getByTestId('array-visualizer').textContent ?? ''
      );
      expect(ascending).toEqual([...initialNums].sort((a, b) => a - b));
    });
  });

  it('updates sort order ref when switching away from sorting without applying reorder logic to other categories', async () => {
    await renderApp();

    fireEvent.click(screen.getByTestId('toggle-sort-order'));
    expect(screen.getByTestId('control-sort-order')).toHaveTextContent(
      'descending'
    );

    fireEvent.click(screen.getByText('pathfinding'));
    expect(screen.getByTestId('control-algorithm-type')).toHaveTextContent(
      'pathfinding'
    );

    fireEvent.click(screen.getByText('sorting'));
    expect(screen.getByTestId('control-sort-order')).toHaveTextContent(
      'descending'
    );
  });

  it('hydrates the sound preference from localStorage', async () => {
    window.localStorage.setItem('bayan-flow:sound-enabled', 'true');

    await renderApp();

    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
  });

  it('falls back safely when reading the stored sound preference throws', async () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage read failed');
      });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await renderApp();

      expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    } finally {
      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    }
  });

  it('keeps rendering when persisting the sound preference throws', async () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage write failed');
      });

    try {
      await renderApp();

      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('toggles sound through the shared control-panel state and persists it', async () => {
    await renderApp();

    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('toggle-sound'));

    await waitFor(() => {
      expect(soundManager.enable).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
      expect(window.localStorage.getItem('bayan-flow:sound-enabled')).toBe(
        'true'
      );
    });

    fireEvent.click(screen.getByText('toggle-sound'));

    await waitFor(() => {
      expect(soundManager.disable).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
      expect(window.localStorage.getItem('bayan-flow:sound-enabled')).toBe(
        'false'
      );
    });
  });

  it('turns sound off when resume-on-interaction fails', async () => {
    window.localStorage.setItem('bayan-flow:sound-enabled', 'true');
    soundManager.enable.mockRejectedValueOnce(new Error('resume failed'));

    await renderApp();
    fireEvent.pointerDown(document.body);

    await waitFor(() => {
      expect(soundManager.enable).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
      expect(window.localStorage.getItem('bayan-flow:sound-enabled')).toBe(
        'false'
      );
    });
  });

  it('forwards timeline seeks to the active visualization', async () => {
    await renderApp();

    fireEvent.click(screen.getByText('seek-to-step-2'));

    await waitFor(() => {
      expect(sortingVisualization.seekToStep).toHaveBeenCalledWith(2);
    });
  });

  describe('feature gating', () => {
    function expectGatedFeatureModal(featureKey) {
      const modal = screen.getByTestId('sign-in-prompt-modal');
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('gated-feature')).toHaveTextContent(featureKey);
    }

    it('gates code panel when unauthenticated', async () => {
      authMock.isAuthenticated = false;
      await renderApp();

      const codeFab = screen.getByTestId('code-fab');
      fireEvent.click(codeFab);

      expectGatedFeatureModal('code');
    });

    it('gates insight panel when unauthenticated', async () => {
      authMock.isAuthenticated = false;
      await renderApp();

      fireEvent.click(
        screen.getAllByRole('button', { name: /View Algorithm Insight/i })[0]
      );

      expectGatedFeatureModal('insight');
    });

    it('gates video export when unauthenticated', async () => {
      authMock.isAuthenticated = false;
      await renderApp();

      fireEvent.click(screen.getByText('pathfinding'));
      fireEvent.click(screen.getByText('export'));

      expectGatedFeatureModal('export');
    });

    it('gates sound toggle when unauthenticated', async () => {
      authMock.isAuthenticated = false;
      await renderApp();

      fireEvent.click(screen.getByText('toggle-sound'));

      expectGatedFeatureModal('sound');
    });

    it('gates fullscreen when unauthenticated', async () => {
      authMock.isAuthenticated = false;
      await renderApp();

      fireEvent.click(screen.getByText('toggle-fullscreen'));

      expectGatedFeatureModal('fullscreen');
    });

    it('gates timeline scrubbing when unauthenticated', async () => {
      authMock.isAuthenticated = false;
      await renderApp();

      fireEvent.click(screen.getByText('gated-seek'));

      expectGatedFeatureModal('timeline_scrub');
    });

    it('does not gate features when authenticated', async () => {
      authMock.isAuthenticated = true;
      await renderApp();

      const codeFab = screen.getByTestId('code-fab');
      fireEvent.click(codeFab);

      expect(
        screen.queryByTestId('sign-in-prompt-modal')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('python-panel')).toBeInTheDocument();
    });

    it('shows remaining visualizations counter for anonymous users', async () => {
      authMock.isAuthenticated = false;
      authMock.user = null;
      window.localStorage.setItem('anon_viz_count', '5');

      await renderApp();

      expect(
        screen.getByText(/7 visualizations remaining/i)
      ).toBeInTheDocument();
    });

    it('hides remaining visualizations counter for authenticated users', async () => {
      await renderApp();

      expect(
        screen.queryByText(/visualizations remaining/i)
      ).not.toBeInTheDocument();
    });

    it('shows remaining visualizations as 12 for anon with zero usage', async () => {
      authMock.isAuthenticated = false;
      authMock.user = null;

      await renderApp();

      expect(
        screen.getByText(/12 visualizations remaining/i)
      ).toBeInTheDocument();
    });

    it('shows slot limit notification when toggleFavorite returns slot_limit', async () => {
      useFavoritesMock.useFavorites.mockReturnValue({
        favorites: [],
        favoriteSlotLimit: 20,
        isLoading: false,
        isFavorite: vi.fn(() => false),
        toggleFavorite: vi.fn(() =>
          Promise.resolve({ ok: false, reason: 'slot_limit' })
        ),
      });

      await renderApp();

      fireEvent.click(screen.getByTestId('trigger-favorite'));

      expect(
        await screen.findByText(/Favorite limit reached/)
      ).toBeInTheDocument();
    });
  });

  describe('algorithm tip toast', () => {
    it('does not show a tip for the default algorithm on initial render', async () => {
      await renderApp();

      expect(screen.queryByText('Why it matters')).not.toBeInTheDocument();
    });

    it('shows a tip when a new algorithm is selected', async () => {
      await renderApp();

      fireEvent.click(screen.getByText('select-dijkstra'));

      expect(screen.getByText('Why it matters')).toBeInTheDocument();
      expect(screen.getByText(/GPS routing/)).toBeInTheDocument();
    });

    it('shows a tip for the new category default when switching category', async () => {
      await renderApp();

      fireEvent.click(screen.getByText('pathfinding'));

      expect(screen.getByText('Why it matters')).toBeInTheDocument();
      expect(
        screen.getByText(/shortest paths in unweighted networks/)
      ).toBeInTheDocument();
    });

    it('shows a tip only once per algorithm per session', async () => {
      await renderApp();

      fireEvent.click(screen.getByText('select-dijkstra'));
      expect(screen.getByText(/GPS routing/)).toBeInTheDocument();

      fireEvent.click(screen.getByText('select-quick-sort'));
      expect(screen.getByText(/qsort/)).toBeInTheDocument();

      fireEvent.click(screen.getByText('select-dijkstra'));
      expect(screen.queryByText(/GPS routing/)).not.toBeInTheDocument();
      expect(screen.getByText(/qsort/)).toBeInTheDocument();
    });
  });
});
