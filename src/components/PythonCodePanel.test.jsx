import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PythonCodePanel from './PythonCodePanel';

// Mock the python algorithms module
vi.mock('../algorithms/python', () => ({
  getPythonCode: vi.fn(),
  getAlgorithmDisplayName: vi.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ value, loading }) => (
    <div data-testid="monaco-editor">{loading || <pre>{value}</pre>}</div>
  )),
}));

describe('PythonCodePanel', () => {
  const mockOnClose = vi.fn();
  const mockPythonCode = `def bubble_sort(arr):
    """Bubble Sort Algorithm"""
    return sorted(arr)`;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Import the mocked functions
    const {
      getPythonCode,
      getAlgorithmDisplayName,
      // eslint-disable-next-line no-undef
    } = require('../algorithms/python');
    getPythonCode.mockReturnValue(mockPythonCode);
    getAlgorithmDisplayName.mockReturnValue('Bubble Sort');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when panel is closed', () => {
    it('does not render when isOpen is false', () => {
      render(
        <PythonCodePanel
          isOpen={false}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      expect(screen.queryByText(/Python Example/)).not.toBeInTheDocument();
    });
  });

  describe('when panel is open', () => {
    it('renders panel without title, only close button', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      expect(
        screen.queryByText('Python Example — Bubble Sort')
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /close panel/i })
      ).toBeInTheDocument();
    });

    it('displays Python code in Monaco editor', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
      expect(screen.getByText(/def bubble_sort/)).toBeInTheDocument();
    });

    it('renders only copy and close buttons', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      expect(
        screen.getByRole('button', { name: /copy code/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /close panel/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /download/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /open in new tab/i })
      ).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      const closeButton = screen.getByRole('button', { name: /close panel/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      const backdrop = document.querySelector('.bg-black.bg-opacity-50');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('copy functionality', () => {
    it('copies code to clipboard when copy button is clicked', async () => {
      navigator.clipboard.writeText.mockResolvedValue();

      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy code/i });
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockPythonCode
      );

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('handles copy error gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      navigator.clipboard.writeText.mockRejectedValue(new Error('Copy failed'));

      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy code/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to copy code:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('when no Python code is available', () => {
    beforeEach(() => {
      // eslint-disable-next-line no-undef
      const { getPythonCode } = require('../algorithms/python');
      getPythonCode.mockReturnValue(null);
    });

    it('shows placeholder message', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="unknownAlgorithm"
        />
      );

      expect(
        screen.getByText('No Python Implementation Available')
      ).toBeInTheDocument();
    });

    it('disables action buttons when no code is available', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="unknownAlgorithm"
        />
      );

      // Should not render action buttons when no code is available
      expect(
        screen.queryByRole('button', { name: /copy/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /download/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('mobile responsiveness', () => {
    it('applies mobile styles on narrow screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      const panel = document.querySelector('.fixed.z-50');
      expect(panel).toHaveClass('inset-x-0', 'bottom-0', 'rounded-t-lg');
    });
  });

  describe('keyboard accessibility', () => {
    it('focuses first element when panel opens', async () => {
      const { rerender } = render(
        <PythonCodePanel
          isOpen={false}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      rerender(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      await waitFor(() => {
        const closeButton = screen.getByRole('button', {
          name: /close panel/i,
        });
        expect(closeButton).toHaveFocus();
      });
    });

    it('traps focus within panel', () => {
      render(
        <PythonCodePanel
          isOpen={true}
          onClose={mockOnClose}
          algorithm="bubbleSort"
        />
      );

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];

      // Tab from last button should go to first
      lastButton.focus();
      fireEvent.keyDown(document, { key: 'Tab' });

      // Focus should wrap to first button
      expect(firstButton).toHaveFocus();
    });
  });
});
