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
          getContainerDomNode: () => ({
            style: {},
            querySelector: sel =>
              sel === '.monaco-scrollable-element' ? { style: {} } : null,
          }),
        };
        const mockMonaco = {
          editor: { setTheme: vi.fn() },
          KeyMod: { CtrlCmd: 2048 },
          KeyCode: { Enter: 3 },
        };
        onMount(mockEditor, mockMonaco);
      }, []);

      return (
        <div
          data-testid="monaco-editor"
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
  }) => (
    <div
      data-testid="output-console"
      data-status={status}
      data-expanded={String(isExpanded)}
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

      const backdrop = document.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeTruthy();
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });

    it('shows mobile header when viewport is narrow', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
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

      fireEvent(window, new Event('resize'));

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

      const tablist = screen.getByRole('tablist');
      const editor = screen.getByTestId('monaco-editor');
      const tablistParent = tablist.parentElement;
      const editorContainer = editor.parentElement?.parentElement;

      expect(tablistParent).toContainElement(editorContainer);
      expect(tablist.nextElementSibling).not.toHaveTextContent(/^Run$/);
    });
  });
});
