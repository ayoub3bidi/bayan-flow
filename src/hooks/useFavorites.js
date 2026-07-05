/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PERSONAL_LEARNING_ERRORS } from '@/constants/personalLearning';
import { getFavoriteSlotLimit } from '@/services/entitlementService';
import {
  addFavorite,
  getOrphanFavorites,
  isFavorite,
  listFavorites,
  removeFavorite,
  removeOrphanFavorites,
  resolveFavoritesForRegistry,
} from '@/services/favoritesService';

/**
 * @param {import('@supabase/supabase-js').User | null} user
 */
export function useFavorites(user) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(0);

  const slotLimit = useMemo(() => getFavoriteSlotLimit(user), [user]);
  const remainingSlots = Math.max(0, slotLimit - favorites.length);
  const isAtSlotLimit = favorites.length >= slotLimit;

  const hydrate = useCallback(async () => {
    const requestId = ++requestRef.current;
    if (!user?.id) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await listFavorites(user.id);
      if (requestRef.current !== requestId) {
        return;
      }
      const resolved = resolveFavoritesForRegistry(rows);
      setFavorites(resolved);

      const orphans = getOrphanFavorites(rows);
      if (orphans.length > 0) {
        void removeOrphanFavorites(user.id, orphans);
      }
    } catch (error) {
      if (requestRef.current !== requestId) {
        return;
      }
      console.error('Failed to load favorites:', error);
      setFavorites([]);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const checkIsFavorite = useCallback(
    (category, algorithmKey) => isFavorite(favorites, category, algorithmKey),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (category, algorithmKey) => {
      if (!user?.id) {
        return { ok: false, reason: 'unauthenticated' };
      }

      const already = isFavorite(favorites, category, algorithmKey);
      const previous = favorites;

      if (already) {
        setFavorites(prev =>
          prev.filter(
            row =>
              !(row.category === category && row.algorithm_key === algorithmKey)
          )
        );
        try {
          await removeFavorite(user.id, category, algorithmKey);
          return { ok: true };
        } catch (error) {
          setFavorites(previous);
          console.error('Failed to remove favorite:', error);
          return { ok: false, reason: 'error' };
        }
      }

      if (isAtSlotLimit) {
        return { ok: false, reason: 'slot_limit' };
      }

      const optimistic = {
        category,
        algorithm_key: algorithmKey,
        created_at: new Date().toISOString(),
      };
      setFavorites(prev => [optimistic, ...prev]);

      try {
        await addFavorite(user.id, category, algorithmKey, {
          slotLimit,
          currentCount: favorites.length,
        });
        return { ok: true };
      } catch (error) {
        setFavorites(previous);
        if (
          error?.code === PERSONAL_LEARNING_ERRORS.FAVORITE_SLOT_LIMIT_REACHED
        ) {
          return { ok: false, reason: 'slot_limit' };
        }
        console.error('Failed to add favorite:', error);
        return { ok: false, reason: 'error' };
      }
    },
    [user, favorites, isAtSlotLimit, slotLimit]
  );

  return {
    favorites,
    isLoading,
    slotLimit,
    remainingSlots,
    isAtSlotLimit,
    isFavorite: checkIsFavorite,
    toggleFavorite,
    refreshFavorites: hydrate,
  };
}
