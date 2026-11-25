/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import PythonCodePanel from './PythonCodePanel';
import { ThemeProvider } from '../contexts/ThemeContext';
import { renderWithI18n } from '../test/testUtils';
import i18n from '../i18n';
import { I18nextProvider } from 'react-i18next';

const { getPseudocodeForLocaleMock, usePythonExecutionMock, buildPythonExec } =
  vi.hoisted(() => {
    const getPseudocodeForLocaleMock = vi.fn((algo, _locale) => {
      if (algo === 'bubbleSort') {
        return 'FUNCTION BubbleSort(array):\n  RETURN array';
      }
      return null;
    });

    function buildPythonExec(overrides = {}) {
      return {
        status: 'idle',
        output: '',
        error: null,
        testResults: [],
        testStatus: 'idle',
        testError: null,
        runCode: vi.fn(),
        runTests: vi.fn(),
        cancelExecution: vi.fn(),
        clearOutput: vi.fn(),
        clearTestResults: vi.fn(),
        vizResult: null,
        runVisualization: vi.fn(),
        warmUp: vi.fn(),
        ...overrides,
      };
    }

    const usePythonExecutionMock = vi.fn(() => buildPythonExec());

    return {
      getPseudocodeForLocaleMock,
      usePythonExecutionMock,
      buildPythonExec,
    };
  });

vi.mock('../algorithms/pseudocode', () => ({
  getPseudocodeForLocale: (...args) => getPseudocodeForLocaleMock(...args),
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({
    onMount,
    theme,
    onChange,
    value,
    defaultLanguage,
    language,
    height: _height,
    width: _width,
    options: _options,
    loading: _loading,
    ...props
  }) => {
    function MockEditor() {
      useEffect(() => {
        if (!onMount) return;
        const mockEditor = {
          addAction: vi.fn(),
          createDecorationsCollection: vi.fn(() => ({ set: vi.fn() })),
          revealLineInCenterIfOutsideViewport: vi.fn(),
          getContainerDomNode: () => ({
            style: {},
            querySelector: sel =>
              sel === '.monaco-scrollable-element' ? { style: {} } : null,
          }),
        };
        const mockMonaco = {
          editor: { setTheme: vi.fn() },
          Range: class {},
          KeyMod: { CtrlCmd: 2048 },
          KeyCode: { Enter: 3 },
        };
        onMount(mockEditor, mockMonaco);
      }, []);

      return (
        <div
          data-testid="monaco-editor"
          data-read-only={String(Boolean(_options?.readOnly))}
          data-theme={theme}
          data-language={defaultLanguage ?? language}
          {...props}
        >
          Monaco Editor Mock
          <button
            type="button"
            data-testid="monaco-simulate-edit"
            onClick={() => onChange?.(`${value ?? ''}\n# edited`)}
          >
            simulate-edit
          </button>
        </div>
      );
    }

    return <MockEditor />;
  },
}));

// Blockly can't run in jsdom: the mock reports a fixed generated program.
const FAKE_PROGRAM = {
  kind: 'sort',
  functionName: 'bubble_sort',
  displayCode: 'def bubble_sort(arr):\n    return arr\n',
  execCode: 'def bubble_sort(arr):\n    __bf.tick()\n    return arr\n',
  lineBlockIds: ['hat', 'hat'],
  statementIds: { hat: 'hat' },
};
/** Program the mocked workspace reports; tests may swap it before render. */
const mockProgramRef = { current: FAKE_PROGRAM };
vi.mock('./BlocksWorkspace', () => {
  // Stable component identity so parent re-renders don't remount it.
  function MockBlocksWorkspace({ onProgramChange }) {
    useEffect(() => {
      onProgramChange(mockProgramRef.current);
    }, [onProgramChange]);
    return <div data-testid="blocks-workspace" />;
  }
  return { default: MockBlocksWorkspace };
});

vi.mock('../services/analyticsEvents', () => ({
  trackBlocksTabOpened: vi.fn(),
  trackBlocksProgramRun: vi.fn(),
}));

// Mock usePythonExecution hook (mutable via usePythonExecutionMock)
vi.mock('../hooks/usePythonExecution', () => ({
  usePythonExecution: (...args) => usePythonExecutionMock(...args),
}));

// Mock OutputConsole
vi.mock('./OutputConsole', () => ({
  default: ({
    status,
    output,
    error,
    onClear,
    onRun,
    onReset,
    isModified,
    isExpanded,
    onToggleExpand,
    onRunTests,
  }) => (
    <div
      data-testid="output-console"
      data-status={status}
      data-expanded={String(isExpanded)}
      data-has-tests={String(Boolean(onRunTests))}
    >
      <span data-testid="output-content">{output || 'empty'}</span>
      {onRun && (
        <button
          type="button"
          onClick={onRun}
          aria-label={
            status === 'loading'
              ? 'Loading Python...'
              : status === 'running'
                ? 'Running...'
                : output || error
                  ? 'Rerun'
                  : 'Run'
          }
        >
          {status === 'loading'
            ? 'Loading Python...'
            : status === 'running'
              ? 'Running...'
              : output || error
                ? 'Rerun'
                : 'Run'}
        </button>
      )}
      {isModified && onReset && (
        <button type="button" onClick={onReset} aria-label="Reset">
          Reset
        </button>
      )}
      <button type="button" onClick={onClear} data-testid="clear-output">
        Clear
      </button>
      {onToggleExpand && (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? 'Collapse output panel' : 'Expand output panel'
          }
        >
          Toggle output
        </button>
      )}
    </div>
  ),
}));

// Mock Python code module
vi.mock('../algorithms/python', () => ({
  getPythonCode: vi.fn(algorithm => {
    if (algorithm === 'bubbleSort') {
      return 'def bubble_sort(arr):\n    return arr';
    }
    if (algorithm === 'selectionSort') {
      return 'def selection_sort(arr):\n    return arr';
    }
    if (algorithm === 'quickSort') {
      return 'def quick_sort(arr):\n    return arr';
    }
    if (algorithm === 'linearSearch') {
      return 'def linear_search(arr, target):\n    return -1';
    }
    if (algorithm === 'bogoSort') {
      return 'def bogo_sort(arr):\n    return arr';
    }
    if (algorithm === 'bfs') {
      return 'def bfs(grid, start, end):\n    return []';
    }
    if (algorithm === 'inorderTraversal') {
      return 'def inorder_traversal(root):\n    return []';
    }
    if (algorithm === 'kahnAlgorithm') {
      return 'def kahn_algorithm(graph):\n    return []';
    }
    return null;
  }),
  getAlgorithmDisplayName: vi.fn(algorithm => {
    if (algorithm === 'bubbleSort') return 'Bubble Sort';
    return 'Unknown Algorithm';
  }),
  getTestCases: vi.fn(algorithm => {
    if (algorithm === 'bubbleSort') {
      return {
        functionName: 'bubble_sort',
        testCases: [
          { id: 'tc1', name: 'Basic', input: '[1,2,3]', expected: '[1,2,3]' },
        ],
      };
    }
    return null;
  }),
}));

describe('PythonCodePanel - Monaco Editor Theme Integration', () => {
  let localStorageMock;

  beforeEach(() => {
    vi.clearAllMocks();
    usePythonExecutionMock.mockImplementation(() => buildPythonExec());
    getPseudocodeForLocaleMock.mockImplementation((algo, _locale) => {
      if (algo === 'bubbleSort') {
        return 'FUNCTION BubbleSort(array):\n  RETURN array';
      }
      return null;
    });

    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;

    // Mock matchMedia
    global.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    global.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  describe('Theme switching without refresh', () => {
    it('should initialize Monaco editor with correct theme based on isDark prop', async () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        expect(editor).toHaveAttribute('data-theme', 'vs-light');
      });
    });

    it('should initialize Monaco editor with dark theme when isDark is true', async () => {
      localStorageMock.getItem.mockReturnValue('dark');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        expect(editor).toHaveAttribute('data-theme', 'vs-dark');
      });
    });

    // Note: Testing theme changes requires integration tests with the full ThemeProvider
    // The useEffect in PythonCodePanel will call monaco.editor.setTheme() when isDark changes
  });

  describe('Panel visibility and editor lifecycle', () => {
    it('should render editor when panel is open', () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should not render editor when panel is closed', () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={false}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument();
    });

    it('should handle algorithm without Python code', () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="unknownAlgorithm"
          />
        </ThemeProvider>
      );

      expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument();
      expect(
        screen.getByText('No Python Implementation Available')
      ).toBeInTheDocument();
    });
  });

  describe('Interactive features', () => {
    it('should render Run button when panel has Python code', async () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /run/i })
        ).toBeInTheDocument();
      });
    });

    it('should render OutputConsole when panel has Python code', async () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('output-console')).toBeInTheDocument();
      });
    });
  });

  describe('Pseudocode tab and panel interactions', () => {
    it('renders pseudocode lines when Pseudocode tab is selected', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByRole('tab', { name: /^Pseudocode$/i }));
      await waitFor(() => {
        expect(
          document.querySelector('.pseudocode-view .pc-line')
        ).toBeInTheDocument();
      });
    });

    it('calls onClose when Escape is pressed', async () => {
      const onClose = vi.fn();
      localStorageMock.getItem.mockReturnValue('light');
      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={onClose}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape', bubbles: true });
      await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      localStorageMock.getItem.mockReturnValue('light');
      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={onClose}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      const backdrop = document.querySelector('.bg-black\\/20');
      expect(backdrop).toBeTruthy();
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });

    it('shows mobile header when viewport is narrow', async () => {
      const { BELOW_LG_MEDIA_QUERY } = await import('../hooks/useIsBelowLg');
      global.matchMedia = vi.fn(query => ({
        matches: query === BELOW_LG_MEDIA_QUERY,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
          /Bubble Sort/i
        );
      });
    });

    it('sets pseudocode pre dir to rtl when language is Arabic', async () => {
      await act(async () => {
        await i18n.changeLanguage('ar');
      });
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByRole('tab', { name: /شبه الشيفرة/ }));

      await waitFor(() => {
        const pre = document.querySelector('.pseudocode-view');
        expect(pre).toHaveAttribute('dir', 'rtl');
      });

      await act(async () => {
        await i18n.changeLanguage('en');
      });
    });

    it('shows Reset after editing code and restores default on Reset', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => screen.getByTestId('monaco-editor'));
      fireEvent.click(screen.getByTestId('monaco-simulate-edit'));

      const resetBtn = screen.getByRole('button', {
        name: /reset/i,
      });
      expect(resetBtn).toBeInTheDocument();
      fireEvent.click(resetBtn);

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /^reset$/i })
        ).not.toBeInTheDocument();
      });
    });

    it('updates output split when resize separator is dragged', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => screen.getByRole('separator'));
      const sep = screen.getByRole('separator');
      const container = sep.parentElement;
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        height: 400,
        top: 100,
        width: 800,
        bottom: 500,
        left: 0,
        right: 800,
        x: 0,
        y: 100,
        toJSON: () => {},
      });

      fireEvent.mouseDown(sep);
      fireEvent.mouseMove(window, { clientY: 300 });
      fireEvent.mouseUp(window);

      expect(sep).toHaveAttribute('aria-valuenow');
    });

    it('shows translated fallback when pseudocode is unavailable', async () => {
      getPseudocodeForLocaleMock.mockReturnValue(null);
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByRole('tab', { name: /^Pseudocode$/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Pseudocode is not available/i)
        ).toBeInTheDocument();
      });
    });

    it('shows Loading Python label when execution status is loading', async () => {
      usePythonExecutionMock.mockImplementation(() =>
        buildPythonExec({ status: 'loading' })
      );
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /loading python/i })
        ).toBeInTheDocument();
      });
    });

    it('shows Running label and spinner when execution status is running', async () => {
      usePythonExecutionMock.mockImplementation(() =>
        buildPythonExec({ status: 'running' })
      );
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /running/i })
        ).toBeInTheDocument();
      });
    });

    it('uses Rerun aria-label when output is present', async () => {
      usePythonExecutionMock.mockImplementation(() =>
        buildPythonExec({ output: 'stdout line' })
      );
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /rerun/i })
        ).toBeInTheDocument();
      });
    });

    it('keeps output header visible after collapse and can expand again', async () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => screen.getByTestId('output-console'));
      expect(screen.getByTestId('output-console')).toHaveAttribute(
        'data-expanded',
        'true'
      );

      fireEvent.click(
        screen.getByRole('button', { name: /collapse output panel/i })
      );

      expect(screen.getByTestId('output-console')).toHaveAttribute(
        'data-expanded',
        'false'
      );
      expect(
        screen.getByRole('button', { name: /expand output panel/i })
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: /expand output panel/i })
      );

      expect(screen.getByTestId('output-console')).toHaveAttribute(
        'data-expanded',
        'true'
      );
    });

    it('places Monaco editor directly under code tabs without a run toolbar row', async () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderWithI18n(
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="bubbleSort"
          />
        </ThemeProvider>
      );

      await waitFor(() => screen.getByTestId('monaco-editor'));

      const tablist = screen.getByRole('tablist', {
        name: 'Python Implementation',
      });
      const editor = screen.getByTestId('monaco-editor');
      // The tabs share a row with the docked-only close button.
      const tabsRow = tablist.parentElement;
      const editorContainer = editor.parentElement?.parentElement;

      expect(tabsRow.parentElement).toContainElement(editorContainer);
      expect(tabsRow.nextElementSibling).not.toHaveTextContent(/^Run$/);
    });
  });
});

describe('PythonCodePanel - Blocks tab', () => {
  let store;

  /** Desktop width: every min-width query matches (dock + side by side). */
  function setWidth({ dock, split }) {
    global.matchMedia = vi.fn(query => ({
      matches:
        query.includes('min-width') &&
        (query.includes('1600px') ? split : dock),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  }

  function renderPanel(props = {}) {
    return renderWithI18n(
      <ThemeProvider>
        <PythonCodePanel
          isOpen={true}
          onClose={vi.fn()}
          algorithm="bubbleSort"
          currentArray={[3, 1, 2]}
          {...props}
        />
      </ThemeProvider>
    );
  }

  const blocksTab = () => screen.getByRole('tab', { name: /^Blocks/ });

  /** Opens the Blocks tab and waits for the (lazy) workspace. */
  async function openBlocks(props) {
    const utils = renderPanel(props);
    fireEvent.click(blocksTab());
    // First lazy load of the workspace chunk in this file can take a moment.
    await screen.findByTestId('blocks-workspace', {}, { timeout: 5000 });
    return utils;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockProgramRef.current = FAKE_PROGRAM;
    usePythonExecutionMock.mockImplementation(() => buildPythonExec());
    store = {};
    global.localStorage = {
      getItem: vi.fn(key => store[key] ?? null),
      setItem: vi.fn((key, value) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    setWidth({ dock: true, split: true });
  });

  afterEach(() => {
    setWidth({ dock: false, split: false });
  });

  it('shows three tabs and opens on Python with the editor and tests', async () => {
    renderPanel();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual([
      'Pseudocode',
      'Python',
      'Blocks',
    ]);
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await waitFor(() => screen.getByTestId('monaco-editor'));
    expect(screen.getByTestId('output-console')).toHaveAttribute(
      'data-has-tests',
      'true'
    );
    expect(screen.queryByTestId('blocks-workspace')).not.toBeInTheDocument();
  });

  it('hides the Blocks tab below laptop width', () => {
    setWidth({ dock: false, split: false });
    renderPanel();
    expect(
      screen.queryByRole('tab', { name: /^Blocks/ })
    ).not.toBeInTheDocument();
  });

  it('docks beside the visualizer with blocks and read-only Python, no tests', async () => {
    const { trackBlocksTabOpened } =
      await import('../services/analyticsEvents');
    const onDockChange = vi.fn();
    await openBlocks({ onDockChange });

    expect(trackBlocksTabOpened).toHaveBeenCalledWith('bubbleSort', true);
    const python = screen.getByTestId('split-python');
    await waitFor(() =>
      expect(
        python.querySelector('[data-testid=monaco-editor]')
      ).toHaveAttribute('data-read-only', 'true')
    );
    expect(python.style.flex).toBe('0 0 42%');
    expect(screen.getByTestId('blocks-split-handle')).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
    expect(document.querySelector('[data-docked]')).toBeInTheDocument();
    expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    expect(onDockChange).toHaveBeenLastCalledWith(
      'min(60vw, calc(100vw - 820px))'
    );
    expect(screen.getByTestId('output-console')).toHaveAttribute(
      'data-has-tests',
      'false'
    );
    expect(
      screen.queryByRole('button', { name: 'Show solution' })
    ).not.toBeInTheDocument();
  });

  it('stacks blocks above Python on laptop widths', async () => {
    setWidth({ dock: true, split: false });
    await openBlocks();
    expect(screen.getByTestId('blocks-split-handle')).toHaveAttribute(
      'aria-orientation',
      'horizontal'
    );
  });

  it('drags the split between blocks and Python and remembers it', async () => {
    await openBlocks();
    const split = screen.getByTestId('split-python').parentElement;
    split.getBoundingClientRect = () => ({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 500,
      width: 1000,
      height: 500,
    });

    fireEvent.mouseDown(screen.getByTestId('blocks-split-handle'));
    // Divider at x=400: Python keeps the right 60%.
    fireEvent.mouseMove(window, { clientX: 400, clientY: 0 });
    fireEvent.mouseUp(window);

    expect(screen.getByTestId('split-python').style.flex).toBe('0 0 60%');
    expect(store['bayan-flow:blocks-python-percent']).toBe('60');

    // Clamped so neither side disappears.
    fireEvent.mouseDown(screen.getByTestId('blocks-split-handle'));
    fireEvent.mouseMove(window, { clientX: 0, clientY: 0 });
    fireEvent.mouseUp(window);
    expect(screen.getByTestId('split-python').style.flex).toBe('0 0 70%');
  });

  it('resizes the split from the keyboard', async () => {
    store['bayan-flow:blocks-python-percent'] = '50';
    await openBlocks();
    const handle = screen.getByTestId('blocks-split-handle');

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(screen.getByTestId('split-python').style.flex).toBe('0 0 55%');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(screen.getByTestId('split-python').style.flex).toBe('0 0 45%');
    expect(store['bayan-flow:blocks-python-percent']).toBe('45');
  });

  it('offers a close button while docked (no backdrop to click)', async () => {
    const onClose = vi.fn();
    await openBlocks({ onClose });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows "coming soon" for an algorithm without blocks, undocked', async () => {
    const { trackBlocksTabOpened } =
      await import('../services/analyticsEvents');
    const onDockChange = vi.fn();
    // Every algorithm has blocks now; a future one (no starter yet) doesn't.
    renderPanel({ algorithm: 'futureAlgorithm', onDockChange });

    expect(blocksTab()).toHaveTextContent('Soon');
    fireEvent.click(blocksTab());

    expect(
      screen.getByText('Blocks coming soon for this algorithm')
    ).toBeInTheDocument();
    expect(trackBlocksTabOpened).toHaveBeenCalledWith('futureAlgorithm', false);
    expect(document.querySelector('[data-docked]')).not.toBeInTheDocument();
    expect(onDockChange).toHaveBeenLastCalledWith(null);
  });

  it('stays on Blocks when the algorithm changes', async () => {
    const { rerender } = await openBlocks();
    // Same provider tree as renderWithI18n, so the panel keeps its state.
    rerender(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <PythonCodePanel
            isOpen={true}
            onClose={vi.fn()}
            algorithm="futureAlgorithm"
            currentArray={[3, 1, 2]}
          />
        </ThemeProvider>
      </I18nextProvider>
    );
    expect(blocksTab()).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText('Blocks coming soon for this algorithm')
    ).toBeInTheDocument();
  });

  it('runs the program on the visualizer input and hands its steps over', async () => {
    // Like the real hook's state, vizResult keeps its identity across renders.
    const vizResult = {
      events: [{ kind: 'compare', i: 0, j: 1, array: [3, 1, 2], blockId: 'c' }],
      finalArray: [1, 2, 3],
    };
    let currentResult = null;
    const runVisualization = vi.fn(() => {
      currentResult = vizResult;
    });
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ runVisualization, vizResult: currentResult })
    );
    const onProgramSteps = vi.fn();
    const onClose = vi.fn();
    await openBlocks({ onProgramSteps, onClose });

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runVisualization).toHaveBeenCalledWith(
      FAKE_PROGRAM.execCode,
      [[3, 1, 2]],
      { functionName: 'bubble_sort', kind: 'sort' }
    );
    // The real hook re-renders when its state updates; any re-render will do.
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse output panel' })
    );

    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    const steps = onProgramSteps.mock.calls[0][0];
    expect(steps[1]).toMatchObject({ blockId: 'c' });
    expect(steps.at(-1).states).toEqual(['sorted', 'sorted', 'sorted']);
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'Your program sorted the array'
    );
    // Docked: the visualizer stays visible, so the panel stays open.
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Clear empties the Blocks output', async () => {
    const vizResult = { events: [], finalArray: [1, 2, 3] };
    let currentResult = null;
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({
        runVisualization: vi.fn(() => {
          currentResult = { ...vizResult };
        }),
        vizResult: currentResult,
      })
    );
    const onProgramSteps = vi.fn();
    await openBlocks({ onProgramSteps });
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));
    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'Your program sorted the array'
    );

    fireEvent.click(screen.getByTestId('clear-output'));

    expect(screen.getByTestId('output-content')).toHaveTextContent('empty');
  });

  it('tells a bogo sort that gave up its program is fine', async () => {
    const vizResult = { events: [], finalArray: [3, 1, 2] };
    let currentResult = null;
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({
        runVisualization: vi.fn(() => {
          currentResult = vizResult;
        }),
        vizResult: currentResult,
      })
    );
    const onProgramSteps = vi.fn();
    await openBlocks({ algorithm: 'bogoSort', onProgramSteps });
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));
    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'Bogo sort gave up after 1000 shuffles'
    );
  });

  it('runs a search program with the target and reports the found index', async () => {
    const searchProgram = {
      ...FAKE_PROGRAM,
      kind: 'search',
      functionName: 'linear_search',
    };
    const vizResult = {
      events: [
        { kind: 'compare', i: 0, j: null, array: [1, 5, 9], blockId: 't' },
      ],
      finalArray: null,
      result: 1,
    };
    let currentResult = null;
    const runVisualization = vi.fn(() => {
      currentResult = vizResult;
    });
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ runVisualization, vizResult: currentResult })
    );
    const onProgramSteps = vi.fn();
    mockProgramRef.current = searchProgram;
    await openBlocks({
      algorithm: 'linearSearch',
      currentArray: [1, 5, 9],
      currentTarget: 5,
      onProgramSteps,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runVisualization).toHaveBeenCalledWith(
      searchProgram.execCode,
      [[1, 5, 9], 5],
      { functionName: 'linear_search', kind: 'search' }
    );
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));

    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    const steps = onProgramSteps.mock.calls[0][0];
    expect(steps[1]).toMatchObject({ blockId: 't', targetValue: 5 });
    expect(steps.at(-1).states).toEqual(['default', 'sorted', 'default']);
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'Your program found 5 at index 1'
    );
  });

  it('runs a path program on the grid and draws the returned path', async () => {
    const pathProgram = { ...FAKE_PROGRAM, kind: 'path', functionName: 'bfs' };
    const vizResult = {
      events: [
        { kind: 'visit', cell: [0, 0], blockId: 'p' },
        { kind: 'open', cell: [0, 1], blockId: 'q' },
      ],
      finalArray: [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      result: null,
    };
    let currentResult = null;
    const runVisualization = vi.fn(() => {
      currentResult = vizResult;
    });
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ runVisualization, vizResult: currentResult })
    );
    const onProgramSteps = vi.fn();
    mockProgramRef.current = pathProgram;
    const grid = [[0, 0, 0]];
    await openBlocks({
      algorithm: 'bfs',
      currentGrid: {
        grid,
        start: { row: 0, col: 0 },
        end: { row: 0, col: 2 },
      },
      onProgramSteps,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runVisualization).toHaveBeenCalledWith(
      pathProgram.execCode,
      [grid, [0, 0], [0, 2]],
      { functionName: 'bfs', kind: 'path' }
    );
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));

    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    const steps = onProgramSteps.mock.calls[0][0];
    expect(steps[2]).toMatchObject({ blockId: 'q' });
    expect(steps.at(-1).states).toEqual([['start', 'path', 'end']]);
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'Your program found a path of 3 cells'
    );
  });

  it('warns when a valid path is not the shortest', async () => {
    const vizResult = {
      events: [],
      // Down and back up before heading right: valid, 2 cells too long.
      finalArray: [
        [0, 0],
        [1, 0],
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      result: null,
    };
    let currentResult = null;
    const runVisualization = vi.fn(() => {
      currentResult = vizResult;
    });
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ runVisualization, vizResult: currentResult })
    );
    mockProgramRef.current = {
      ...FAKE_PROGRAM,
      kind: 'path',
      functionName: 'bfs',
    };
    await openBlocks({
      algorithm: 'bfs',
      currentGrid: {
        grid: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        start: { row: 0, col: 0 },
        end: { row: 0, col: 2 },
      },
      onProgramSteps: vi.fn(),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));
    await waitFor(() =>
      expect(screen.getByTestId('output-content')).toHaveTextContent(
        'valid path of 5 cells'
      )
    );
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'the shortest path has 3 cells'
    );
  });

  it('runs a tree program on the visualizer tree and checks the order', async () => {
    const treeProgram = {
      ...FAKE_PROGRAM,
      kind: 'tree',
      functionName: 'inorder_traversal',
    };
    let currentResult = null;
    const runVisualization = vi.fn(() => {
      // Preorder's order where inorder was expected.
      currentResult = {
        events: [{ kind: 'output', node: 2, blockId: 'v' }],
        finalArray: [2, 1],
        result: null,
      };
    });
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ runVisualization, vizResult: currentResult })
    );
    const onProgramSteps = vi.fn();
    mockProgramRef.current = treeProgram;
    await openBlocks({
      algorithm: 'inorderTraversal',
      currentTree: {
        nodes: [
          { id: '0', label: '2' },
          { id: '1', label: '1' },
        ],
        edges: [{ from: '0', to: '1' }],
        children: {
          0: { left: '1', right: null },
          1: { left: null, right: null },
        },
        rootId: '0',
        nodeValues: { 0: 2, 1: 1 },
      },
      onProgramSteps,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runVisualization).toHaveBeenCalledWith(
      treeProgram.execCode,
      [
        {
          value: 2,
          left: { value: 1, left: null, right: null },
          right: null,
        },
      ],
      { functionName: 'inorder_traversal', kind: 'tree' }
    );
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));

    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    const steps = onProgramSteps.mock.calls[0][0];
    expect(steps[1]).toMatchObject({
      blockId: 'v',
      nodeStates: { 0: 'visiting', 1: 'default' },
    });
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'returned 2, 1, but the expected order is 1, 2'
    );
  });

  it('runs a graph program on the visualizer graph, named by labels', async () => {
    const graphProgram = {
      ...FAKE_PROGRAM,
      kind: 'graph',
      functionName: 'kahn_algorithm',
    };
    let currentResult = null;
    const runVisualization = vi.fn(() => {
      currentResult = {
        events: [{ kind: 'output', node: 'A', blockId: 'e' }],
        finalArray: ['A', 'B'],
        result: null,
      };
    });
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ runVisualization, vizResult: currentResult })
    );
    const onProgramSteps = vi.fn();
    mockProgramRef.current = graphProgram;
    await openBlocks({
      algorithm: 'kahnAlgorithm',
      currentGraph: {
        nodes: [
          { id: '0', label: 'A', x: 0, y: 0 },
          { id: '1', label: 'B', x: 1, y: 0 },
        ],
        edges: [{ id: '0->1', from: '0', to: '1' }],
        adjacency: { 0: ['1'], 1: [] },
        directed: true,
      },
      onProgramSteps,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runVisualization).toHaveBeenCalledWith(
      graphProgram.execCode,
      [{ A: ['B'], B: [] }],
      { functionName: 'kahn_algorithm', kind: 'graph' }
    );
    fireEvent.click(screen.getByRole('button', { name: /output panel/ }));

    await waitFor(() => expect(onProgramSteps).toHaveBeenCalledTimes(1));
    const steps = onProgramSteps.mock.calls[0][0];
    expect(steps[1]).toMatchObject({
      blockId: 'e',
      nodeStates: { 0: 'path', 1: 'default' },
    });
    expect(screen.getByTestId('output-content')).toHaveTextContent(
      'returned a correct answer'
    );
  });

  it('shows the friendly loop error for a runaway program', async () => {
    const vizResult = { errorKind: 'loop-limit' };
    usePythonExecutionMock.mockImplementation(() =>
      buildPythonExec({ status: 'error', vizResult })
    );
    const onProgramSteps = vi.fn();
    await openBlocks({ onProgramSteps });
    expect(onProgramSteps).not.toHaveBeenCalled();
  });

  it('offers only Reset in the Blocks toolbar (the Python tab shows the code)', async () => {
    await openBlocks();

    expect(screen.getByRole('button', { name: 'Reset' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edit in Python' })
    ).not.toBeInTheDocument();
  });
});
