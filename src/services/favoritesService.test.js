/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALGORITHM_TYPES } from '@/constants';
import { PERSONAL_LEARNING_ERRORS } from '@/constants/personalLearning';
import {
  listFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  resolveFavoritesForRegistry,
  getOrphanFavorites,
} from './favoritesService';

vi.mock('@/lib/supabaseClient', () => import('@/test/supabaseMock'));

import {
  getSupabaseClient,
  resetSupabaseMocks,
  mockSupabaseConfigured,
  createSupabaseQueryBuilder,
  supabaseFromMock,
} from '@/test/supabaseMock';

describe('favoritesService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
  });

  it('listFavorites returns empty when client is null', async () => {
    getSupabaseClient.mockReturnValue(null);
    await expect(listFavorites('user-1')).resolves.toEqual([]);
  });

  it('listFavorites returns rows ordered from supabase', async () => {
    const rows = [
      {
        category: ALGORITHM_TYPES.SORTING,
        algorithm_key: 'bubbleSort',
        created_at: '2026-01-01',
      },
    ];
    supabaseFromMock.mockReturnValue(
      createSupabaseQueryBuilder({
        order: vi.fn(async () => ({ data: rows, error: null })),
      })
    );

    await expect(listFavorites('user-1')).resolves.toEqual(rows);
  });

  it('addFavorite throws when slot limit reached', async () => {
    await expect(
      addFavorite('user-1', ALGORITHM_TYPES.SORTING, 'bubbleSort', {
        slotLimit: 2,
        currentCount: 2,
      })
    ).rejects.toMatchObject({
      code: PERSONAL_LEARNING_ERRORS.FAVORITE_SLOT_LIMIT_REACHED,
    });
  });

  it('addFavorite inserts when under slot limit', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    supabaseFromMock.mockReturnValue(createSupabaseQueryBuilder({ insert }));

    await addFavorite('user-1', ALGORITHM_TYPES.SORTING, 'bubbleSort', {
      slotLimit: 20,
      currentCount: 1,
    });

    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      category: ALGORITHM_TYPES.SORTING,
      algorithm_key: 'bubbleSort',
    });
  });

  it('removeFavorite deletes row', async () => {
    const del = vi.fn(() => createSupabaseQueryBuilder());
    supabaseFromMock.mockReturnValue(
      createSupabaseQueryBuilder({ delete: del })
    );

    await removeFavorite('user-1', ALGORITHM_TYPES.SORTING, 'bubbleSort');
    expect(del).toHaveBeenCalled();
  });

  it('isFavorite detects membership', () => {
    const favorites = [
      {
        category: ALGORITHM_TYPES.SORTING,
        algorithm_key: 'mergeSort',
        created_at: '',
      },
    ];
    expect(isFavorite(favorites, ALGORITHM_TYPES.SORTING, 'mergeSort')).toBe(
      true
    );
    expect(isFavorite(favorites, ALGORITHM_TYPES.SORTING, 'bubbleSort')).toBe(
      false
    );
  });

  it('resolveFavoritesForRegistry drops unknown keys', () => {
    const favorites = [
      {
        category: ALGORITHM_TYPES.SORTING,
        algorithm_key: 'bubbleSort',
        created_at: '',
      },
      {
        category: ALGORITHM_TYPES.SORTING,
        algorithm_key: 'removedAlgo',
        created_at: '',
      },
    ];
    const resolved = resolveFavoritesForRegistry(favorites);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].algorithm_key).toBe('bubbleSort');
    expect(getOrphanFavorites(favorites)).toHaveLength(1);
  });
});
