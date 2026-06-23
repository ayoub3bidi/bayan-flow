/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../constants/algorithmKnowledge', async importOriginal => {
  const actual = await importOriginal();
  return {
    ALGORITHM_KNOWLEDGE: {
      ...actual.ALGORITHM_KNOWLEDGE,
      bubbleSort: {
        ...actual.ALGORITHM_KNOWLEDGE.bubbleSort,
        youtubeVideoId: 'abc123XYZ',
      },
    },
  };
});

import AlgorithmInsightPanel from './AlgorithmInsightPanel';
import i18n from '../i18n';

describe('AlgorithmInsightPanel video facade', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders YouTube facade when algorithm has a video ID', () => {
    renderWithI18n(
      <MemoryRouter>
        <AlgorithmInsightPanel
          isOpen={true}
          onClose={vi.fn()}
          algorithmKey="bubbleSort"
          algorithmName="Bubble Sort"
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('Video coming soon')).not.toBeInTheDocument();
    const playButtons = screen.getAllByRole('button', { name: /Play video:/i });
    expect(playButtons.length).toBeGreaterThan(0);
    expect(playButtons[0]).toHaveAttribute(
      'aria-label',
      'Play video: Related video'
    );
  });
});
