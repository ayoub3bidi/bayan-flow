/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PythonCodePanel from './PythonCodePanel';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, theme, ...props }) => {
    if (onMount) {
      const mockEditor = {
        addAction: vi.fn(),
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

  describe('Theme switching without refresh', () => {
    it('should initialize Monaco editor with correct theme based on isDark prop', async () => {
      localStorageMock.getItem.mockReturnValue('light');

      render(
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

      render(
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

      render(
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

      render(
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

      render(
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

      render(
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

      render(
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
});
