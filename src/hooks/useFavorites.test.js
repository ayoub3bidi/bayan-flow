/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ALGORITHM_TYPES } from '@/constants';
import { useFavorites } from './useFavorites';

vi.mock('@/services/favoritesService', () => ({
  listFavorites: vi.fn(async () => []),
  addFavorite: vi.fn(async () => {}),
  removeFavorite: vi.fn(async () => {}),
  removeOrphanFavorites: vi.fn(async () => {}),
  resolveFavoritesForRegistry: vi.fn(rows => rows),
  getOrphanFavorites: vi.fn(() => []),
  isFavorite: vi.fn((favorites, category, key) =>
    favorites.some(
      row => row.category === category && row.algorithm_key === key
    )
  ),
}));

vi.mock('@/services/entitlementService', () => ({
  getFavoriteSlotLimit: vi.fn(() => 20),
}));

import {
  listFavorites,
  addFavorite,
  removeFavorite,
} from '@/services/favoritesService';

describe('useFavorites', () => {
  const user = { id: 'user-1', email: 'test@example.com' };

  beforeEach(() => {
    vi.mocked(listFavorites).mockResolvedValue([]);
    vi.mocked(addFavorite).mockResolvedValue(undefined);
    vi.mocked(removeFavorite).mockResolvedValue(undefined);
  });

  it('hydrates favorites on sign-in', async () => {
    vi.mocked(listFavorites).mockResolvedValue([
      {
        category: ALGORITHM_TYPES.SORTING,
        algorithm_key: 'bubbleSort',
        created_at: '2026-01-01',
      },
    ]);

    const { result } = renderHook(() => useFavorites(user));

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
    });
  });

  it('clears favorites when user is null', async () => {
    const { result, rerender } = renderHook(
      ({ currentUser }) => useFavorites(currentUser),
      { initialProps: { currentUser: user } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ currentUser: null });
    expect(result.current.favorites).toEqual([]);
  });

  it('toggleFavorite adds and removes', async () => {
    const { result } = renderHook(() => useFavorites(user));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });

    expect(addFavorite).toHaveBeenCalled();
    expect(
      result.current.isFavorite(ALGORITHM_TYPES.SORTING, 'bubbleSort')
    ).toBe(true);

    await act(async () => {
      await result.current.toggleFavorite(
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });

    expect(removeFavorite).toHaveBeenCalled();
  });

  it('returns unauthenticated reason when no user', async () => {
    const { result } = renderHook(() => useFavorites(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const outcome = await act(async () => {
      return await result.current.toggleFavorite(
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });

    expect(outcome).toEqual({ ok: false, reason: 'unauthenticated' });
  });

  it('returns slot_limit when at max favorites', async () => {
    const manyFavorites = Array.from({ length: 20 }, (_, i) => ({
      category: ALGORITHM_TYPES.SORTING,
      algorithm_key: `algo${i}`,
      created_at: '2026-01-01',
    }));
    vi.mocked(listFavorites).mockResolvedValue(manyFavorites);

    const { result } = renderHook(() => useFavorites(user));

    await waitFor(() => {
      expect(result.current.isAtSlotLimit).toBe(true);
    });

    const outcome = await act(async () => {
      return await result.current.toggleFavorite(
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });

    expect(outcome).toEqual({ ok: false, reason: 'slot_limit' });
  });

  it('handles error when loading favorites', async () => {
    vi.mocked(listFavorites).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFavorites(user));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.favorites).toEqual([]);
    });
  });

  it('rolls back optimistic add on error', async () => {
    vi.mocked(addFavorite).mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useFavorites(user));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const outcome = await act(async () => {
      return await result.current.toggleFavorite(
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });

    expect(outcome).toEqual({ ok: false, reason: 'error' });
    expect(result.current.favorites).toHaveLength(0);
  });

  it('rolls back optimistic remove on error', async () => {
    vi.mocked(listFavorites).mockResolvedValue([
      {
        category: ALGORITHM_TYPES.SORTING,
        algorithm_key: 'bubbleSort',
        created_at: '2026-01-01',
      },
    ]);
    vi.mocked(removeFavorite).mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useFavorites(user));

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
    });

    const outcome = await act(async () => {
      return await result.current.toggleFavorite(
        ALGORITHM_TYPES.SORTING,
        'bubbleSort'
      );
    });

    expect(outcome).toEqual({ ok: false, reason: 'error' });
    expect(result.current.favorites).toHaveLength(1);
  });
});
