/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import AlgorithmInsightPanel from './AlgorithmInsightPanel';
import i18n from '../i18n';

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
      />
    );

    expect(screen.getAllByText('Algorithm Insight').length).toBeGreaterThan(0);
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
      />
    );

    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalled();
  });
});
