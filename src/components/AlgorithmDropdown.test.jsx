/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen, fireEvent } from '../test/testUtils';
import AlgorithmDropdown from './AlgorithmDropdown';
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
          user={{ id: 'user-1' }}
          categoryType="sorting"
        />
      );

      const quickSortButton = screen
        .getAllByRole('button')
        .find(btn => btn.textContent?.includes('Quick Sort'));
      fireEvent.click(quickSortButton);

      expect(onAlgorithmSelect).toHaveBeenCalledWith('quickSort');
    });

    it('calls onLockedAlgorithmClick for locked algorithms when anonymous', () => {
      const onLockedAlgorithmClick = vi.fn();
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          user={null}
          categoryType="sorting"
          onLockedAlgorithmClick={onLockedAlgorithmClick}
        />
      );

      const quickSortButton = screen
        .getAllByRole('button')
        .find(btn => btn.textContent?.includes('Quick Sort'));
      fireEvent.click(quickSortButton);

      expect(onLockedAlgorithmClick).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'quickSort', label: 'Quick Sort' })
      );
      expect(onLockedAlgorithmClick).toHaveBeenCalledTimes(1);
    });

    it('should show a check icon for the selected algorithm when dropdown is open', () => {
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          selectedAlgorithm="bubbleSort"
        />
      );

      const bubbleSortButton = screen
        .getAllByRole('button')
        .find(btn => btn.textContent?.includes('Bubble Sort'));
      expect(bubbleSortButton).toBeTruthy();
      expect(bubbleSortButton.querySelector('svg')).toBeTruthy();
    });

    it('calls onFavoriteGatedClick when anonymous user clicks star', () => {
      const onFavoriteGatedClick = vi.fn();
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          user={null}
          isAuthenticated={false}
          categoryType="sorting"
          onFavoriteGatedClick={onFavoriteGatedClick}
        />
      );

      const starButton = screen.getByRole('button', {
        name: /add bubble sort to favorites/i,
      });
      fireEvent.click(starButton);

      expect(onFavoriteGatedClick).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleFavorite when signed-in user clicks star', () => {
      const onToggleFavorite = vi.fn();
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          user={{ id: 'user-1' }}
          isAuthenticated={true}
          categoryType="sorting"
          onToggleFavorite={onToggleFavorite}
        />
      );

      const starButton = screen.getByRole('button', {
        name: /add bubble sort to favorites/i,
      });
      fireEvent.click(starButton);

      expect(onToggleFavorite).toHaveBeenCalledWith('sorting', 'bubbleSort');
    });

    it('shows remove favorite label when algorithm is favorited', () => {
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          user={{ id: 'user-1' }}
          isAuthenticated={true}
          categoryType="sorting"
          isFavorite={() => true}
        />
      );

      const starButton = screen.getByRole('button', {
        name: /remove bubble sort from favorites/i,
      });
      expect(starButton).toBeInTheDocument();
      expect(starButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('does not render star button for locked algorithms', () => {
      renderWithI18n(
        <AlgorithmDropdown
          {...defaultProps}
          isDropdownOpen={true}
          user={null}
          categoryType="sorting"
        />
      );

      expect(
        screen.queryByRole('button', {
          name: /add quick sort to favorites/i,
        })
      ).not.toBeInTheDocument();
    });
  });
});
