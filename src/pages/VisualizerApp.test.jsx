/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen, fireEvent, waitFor } from '../test/testUtils';
import VisualizerApp from './VisualizerApp.jsx';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';

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

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({
      children,
      whileHover: _whileHover,
      whileTap: _whileTap,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...props
    }) => <button {...props}>{children}</button>,
  },
}));

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
    onAlgorithmTypeChange,
    onAlgorithmChange,
  }) => (
    <div data-testid="settings-panel">
      <div data-testid="algorithm-type">{algorithmType}</div>
      <div data-testid="selected-algorithm">{selectedAlgorithm}</div>
      <div data-testid="selected-graph-scenario">
        {String(selectedGraphScenario)}
      </div>
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
    </div>
  ),
}));

vi.mock('../components/ControlPanel', () => ({
  default: ({
    totalSteps,
    algorithmType,
    onExportVideo,
    onGenerateArray,
    sortOrder,
    onSortOrderChange,
  }) => (
    <div data-testid="control-panel">
      <span data-testid="control-total-steps">{String(totalSteps)}</span>
      <span data-testid="control-algorithm-type">{algorithmType}</span>
      <span data-testid="control-sort-order">{String(sortOrder)}</span>
      <button type="button" onClick={onGenerateArray}>
        generate-data
      </button>
      <button onClick={onExportVideo}>export</button>
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

vi.mock('../video/useVideoExporter', () => ({
  useVideoExporter: () => ({
    beginExportFlow: videoExporterMock.beginExportFlow,
    exportVideo: videoExporterMock.exportVideo,
    exportState: videoExporterMock.exportState,
    exportProgress: videoExporterMock.exportProgress,
    exportBlobUrl: videoExporterMock.exportBlobUrl,
    cancelExport: videoExporterMock.cancelExport,
    closePreview: videoExporterMock.closePreview,
    downloadVideo: videoExporterMock.downloadVideo,
    canRenderOnWeb: true,
  }),
}));

describe('VisualizerApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fullScreenMock.isFullScreen = false;
    videoExporterMock.exportState = 'idle';
    videoExporterMock.exportProgress = 0;
    videoExporterMock.exportBlobUrl = null;
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
    await renderApp();

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('array-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
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
});
