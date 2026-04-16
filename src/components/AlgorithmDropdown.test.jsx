/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen, fireEvent } from '../test/testUtils';
import AlgorithmDropdown from './AlgorithmDropdown';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockAlgorithms = [
  { value: 'bubbleSort', label: 'Bubble Sort', complexity: 'O(n²)' },
  { value: 'quickSort', label: 'Quick Sort', complexity: 'O(n log n)' },
];

const mockAlgorithmGroups = [
  { label: 'Comparison Based', algorithms: ['bubbleSort', 'quickSort'] },
];

const defaultProps = {
  algorithms: mockAlgorithms,
  algorithmGroups: mockAlgorithmGroups,
  selectedAlgorithm: null,
  onAlgorithmSelect: vi.fn(),
  isDropdownOpen: false,
  setIsDropdownOpen: vi.fn(),
  isPlaying: false,
  dropdownRef: { current: null },
};

describe('AlgorithmDropdown', () => {
  describe('Rendering', () => {
    it('should render placeholder when no algorithm selected', () => {
      renderWithI18n(<AlgorithmDropdown {...defaultProps} />);
      expect(screen.getByText('Select algorithm')).toBeInTheDocument();
    });

    it('should render selected algorithm label and complexity', () => {
      renderWithI18n(
        <AlgorithmDropdown {...defaultProps} selectedAlgorithm="bubbleSort" />
      );
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
      expect(screen.getByText('O(n²)')).toBeInTheDocument();
    });

    it('should render algorithm groups and options when dropdown is open', () => {
      renderWithI18n(
        <AlgorithmDropdown {...defaultProps} isDropdownOpen={true} />
      );
      expect(screen.getByText('Comparison Based')).toBeInTheDocument();
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
      expect(screen.getByText('Quick Sort')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call setIsDropdownOpen when button clicked and not playing', () => {
      const setIsDropdownOpen = vi.fn();
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          setIsDropdownOpen={setIsDropdownOpen}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(setIsDropdownOpen).toHaveBeenCalledWith(true);
    });

    it('should not call setIsDropdownOpen when isPlaying is true', () => {
      const setIsDropdownOpen = vi.fn();
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isPlaying={true}
          setIsDropdownOpen={setIsDropdownOpen}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(setIsDropdownOpen).not.toHaveBeenCalled();
    });

    it('should disable button when isPlaying is true', () => {
      renderWithI18n(<AlgorithmDropdown {...defaultProps} isPlaying={true} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should call onAlgorithmSelect with algorithm value when option clicked', () => {
      const onAlgorithmSelect = vi.fn();
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          onAlgorithmSelect={onAlgorithmSelect}
        />
      );

      const quickSortButton = screen
        .getAllByRole('button')
        .find(btn => btn.textContent?.includes('Quick Sort'));
      fireEvent.click(quickSortButton);

      expect(onAlgorithmSelect).toHaveBeenCalledWith('quickSort');
    });
  });
});
