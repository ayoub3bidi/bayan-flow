/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoritesDropdown from './FavoritesDropdown';
import { ALGORITHM_TYPES } from '@/constants';

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key, opts) => {
        if (key === 'settings.favoriteSlotsUsed') {
          return `${opts.count} / ${opts.limit}`;
        }
        if (key === 'settings.favoriteAlgorithmsCount') {
          return `${opts.count} saved`;
        }
        if (key === 'modes.sorting') return 'Sorting';
        return key;
      },
      i18n: { language: 'en' },
    }),
  };
});

vi.mock('@/config/algorithmConfig', () => ({
  useAlgorithmConfig: () => ({
    byType: {
      [ALGORITHM_TYPES.SORTING]: {
        algorithms: [{ value: 'bubbleSort', label: 'Bubble Sort' }],
      },
    },
  }),
}));

describe('FavoritesDropdown', () => {
  it('shows empty state hint', async () => {
    render(
      <FavoritesDropdown
        favorites={[]}
        slotLimit={20}
        onSelect={vi.fn()}
        isPlaying={false}
      />
    );

    expect(
      screen.getByText('settings.favoriteAlgorithmsEmpty')
    ).toBeInTheDocument();
  });

  it('calls onSelect when favorite clicked', async () => {
    const onSelect = vi.fn();

    render(
      <FavoritesDropdown
        favorites={[
          {
            category: ALGORITHM_TYPES.SORTING,
            algorithm_key: 'bubbleSort',
            created_at: '',
          },
        ]}
        slotLimit={20}
        onSelect={onSelect}
        isPlaying={false}
      />
    );

    fireEvent.click(screen.getByText('1 saved'));
    fireEvent.click(screen.getByText('Bubble Sort'));

    expect(onSelect).toHaveBeenCalledWith(
      ALGORITHM_TYPES.SORTING,
      'bubbleSort'
    );
  });
});
