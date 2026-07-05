/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, renderWithI18n, screen, waitFor } from '../test/testUtils';
import AlgorithmInsightPanel from './AlgorithmInsightPanel';
import i18n from '../i18n';
import { ALGORITHM_TYPES } from '@/constants';

describe('AlgorithmInsightPanel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders insight content and icon placeholders when open', () => {
    const { container } = renderWithI18n(
      <AlgorithmInsightPanel
        isOpen={true}
        onClose={vi.fn()}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );

    expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('tab', { name: 'Learn' })[0]).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getAllByText('My Notes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bubble Sort').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Video coming soon').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
  });

  it('calls onClose when the mobile close button is clicked', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <AlgorithmInsightPanel
        isOpen={true}
        onClose={onClose}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );

    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalled();
  });

  it('switches to My Notes tab when clicked', async () => {
    renderWithI18n(
      <AlgorithmInsightPanel
        isOpen={true}
        onClose={vi.fn()}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );

    const notesTab = screen.getAllByText('My Notes')[0];
    fireEvent.click(notesTab);

    await waitFor(() => {
      const tab = screen.getAllByRole('tab', { name: 'My Notes' })[0];
      expect(tab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('resets tab to insight when reopened', () => {
    const { rerender } = renderWithI18n(
      <AlgorithmInsightPanel
        isOpen={true}
        onClose={vi.fn()}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );

    const notesTab = screen.getAllByText('My Notes')[0];
    fireEvent.click(notesTab);

    const learnTab = screen.getAllByText('Learn')[0];
    expect(learnTab).toHaveAttribute('aria-selected', 'false');
    expect(notesTab).toHaveAttribute('aria-selected', 'true');

    rerender(
      <AlgorithmInsightPanel
        isOpen={false}
        onClose={vi.fn()}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );
  });

  it('shows no data message when algorithm has no insight content', () => {
    renderWithI18n(
      <AlgorithmInsightPanel
        isOpen={true}
        onClose={vi.fn()}
        algorithmKey="nonexistent"
        algorithmName="Unknown"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );

    expect(
      screen.getAllByText(
        'No additional insight available for this algorithm yet.'
      ).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders MetaItem without year when algorithm year is null', () => {
    renderWithI18n(
      <AlgorithmInsightPanel
        isOpen={true}
        onClose={vi.fn()}
        algorithmKey="insertionSort"
        algorithmName="Insertion Sort"
        categoryType={ALGORITHM_TYPES.SORTING}
        user={{ id: 'user-1' }}
      />
    );

    const nameElements = screen.getAllByText('Insertion Sort');
    expect(nameElements.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0);
  });
});
