/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithI18n, screen, fireEvent, waitFor } from '../test/testUtils';
import VisualizerApp from './VisualizerApp.jsx';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { soundManager } from '../utils/soundManager';

const { beginExportFlow, exportVideo, videoExporterMock, fullScreenMock } =
  vi.hoisted(() => {
    const beginExportFlowInner = vi.fn();
    const exportVideoInner = vi.fn();
    const toggleFullScreenInner = vi.fn();
    const videoExporterMockInner = {
      beginExportFlow: beginExportFlowInner,
      exportVideo: exportVideoInner,
      exportState: 'idle',
      exportProgress: 0,
      exportBlobUrl: null,
      exportErrorMessage: null,
      cancelExport: vi.fn(),
      closePreview: vi.fn(),
      downloadVideo: vi.fn(),
    };
    const fullScreenMockInner = {
      isFullScreen: false,
      toggleFullScreen: toggleFullScreenInner,
    };
    return {
      beginExportFlow: beginExportFlowInner,
      exportVideo: exportVideoInner,
      toggleFullScreen: toggleFullScreenInner,
      videoExporterMock: videoExporterMockInner,
      fullScreenMock: fullScreenMockInner,
    };
  });

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
  default: ({ open, onOrientationSelect }) =>
    open ? (
      <div data-testid="export-modal">
        <button
          type="button"
          onClick={() => onOrientationSelect?.('horizontal')}
        >
          pick-orientation
        </button>
      </div>
    ) : null,
}));

vi.mock('../components/FloatingActionButton', () => ({
  default: ({ disabled }) => (
    <button data-testid="code-fab" disabled={disabled}>
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

vi.mock('../hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}));

vi.mock('../video/useVideoExporter', () => ({
  useVideoExporter: () => ({
    beginExportFlow: videoExporterMock.beginExportFlow,
    exportVideo: videoExporterMock.exportVideo,
    exportState: videoExporterMock.exportState,
    exportProgress: videoExporterMock.exportProgress,
    exportBlobUrl: videoExporterMock.exportBlobUrl,
    exportErrorMessage: videoExporterMock.exportErrorMessage,
    cancelExport: videoExporterMock.cancelExport,
    closePreview: videoExporterMock.closePreview,
    downloadVideo: videoExporterMock.downloadVideo,
    canRenderOnWeb: true,
  }),
}));

describe('VisualizerApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.body.style.cssText = '';
    soundManager.disable();
    vi.clearAllMocks();
    fullScreenMock.isFullScreen = false;
    videoExporterMock.exportState = 'idle';
    videoExporterMock.exportProgress = 0;
    videoExporterMock.exportBlobUrl = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.cssText = '';
  });

  async function renderApp() {
    renderWithI18n(
      <ThemeProvider>
        <VisualizerApp />
      </ThemeProvider>
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
});
