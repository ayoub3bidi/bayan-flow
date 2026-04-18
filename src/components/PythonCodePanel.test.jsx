/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import PythonCodePanel from './PythonCodePanel';
import { ThemeProvider } from '../contexts/ThemeContext';
import { renderWithI18n } from '../test/testUtils';
import i18n from '../i18n';

const { getPseudocodeForLocaleMock } = vi.hoisted(() => ({
  getPseudocodeForLocaleMock: vi.fn((algo, _locale) => {
    if (algo === 'bubbleSort') {
      return 'FUNCTION BubbleSort(array):\n  RETURN array';
    }
    return null;
  }),
}));

vi.mock('../algorithms/pseudocode', () => ({
  getPseudocodeForLocale: (...args) => getPseudocodeForLocaleMock(...args),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, theme, onChange, value, ...props }) => {
    if (onMount) {
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
      setTimeout(() => onMount(mockEditor, mockMonaco), 0);
    }
    return (
      <div data-testid="monaco-editor" data-theme={theme} {...props}>
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
  },
}));

// Mock usePythonExecution hook
vi.mock('../hooks/usePythonExecution', () => ({
  usePythonExecution: vi.fn(() => ({
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
  })),
}));

// Mock OutputConsole
vi.mock('./OutputConsole', () => ({
  default: ({ status, output, onClear }) => (
    <div data-testid="output-console" data-status={status}>
      <span data-testid="output-content">{output || 'empty'}</span>
      <button type="button" onClick={onClear} data-testid="clear-output">
        Clear
      </button>
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
      await i18n.changeLanguage('ar');
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

      await i18n.changeLanguage('en');
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
  });
});
