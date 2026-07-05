/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ALGORITHM_TYPE_LIST } from '@/constants';
import { CATEGORY_CONFIG } from '@/registry/categoryConfig';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { PERSONAL_LEARNING_ERRORS } from '@/constants/personalLearning';

/**
 * @typedef {Object} FavoriteRow
 * @property {string} category
 * @property {string} algorithm_key
 * @property {string} created_at
 */

/**
 * @param {string} category
 * @param {string} algorithmKey
 * @returns {boolean}
 */
export function isAlgorithmInRegistry(category, algorithmKey) {
  const cfg = CATEGORY_CONFIG[category];
  if (!cfg) {
    return false;
  }
  return cfg.algorithmKeys.includes(algorithmKey);
}

/**
 * @param {FavoriteRow[]} favorites
 * @returns {FavoriteRow[]}
 */
export function resolveFavoritesForRegistry(favorites) {
  if (!Array.isArray(favorites)) {
    return [];
  }
  return favorites.filter(row =>
    isAlgorithmInRegistry(row.category, row.algorithm_key)
  );
}

/**
 * @param {FavoriteRow[]} favorites
 * @returns {FavoriteRow[]}
 */
export function getOrphanFavorites(favorites) {
  if (!Array.isArray(favorites)) {
    return [];
  }
  return favorites.filter(
    row => !isAlgorithmInRegistry(row.category, row.algorithm_key)
  );
}

/**
 * @param {string} userId
 * @returns {Promise<FavoriteRow[]>}
 */
export async function listFavorites(userId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorite_algorithms')
    .select('category, algorithm_key, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * @param {string} userId
 * @param {string} category
 * @param {string} algorithmKey
 * @param {{ slotLimit: number, currentCount: number }} options
 * @returns {Promise<void>}
 */
export async function addFavorite(
  userId,
  category,
  algorithmKey,
  { slotLimit, currentCount }
) {
  if (!isAlgorithmInRegistry(category, algorithmKey)) {
    throw new Error('Unknown algorithm');
  }

  if (currentCount >= slotLimit) {
    const error = new Error('Favorite slot limit reached');
    error.code = PERSONAL_LEARNING_ERRORS.FAVORITE_SLOT_LIMIT_REACHED;
    throw error;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('favorite_algorithms').insert({
    user_id: userId,
    category,
    algorithm_key: algorithmKey,
  });

  if (error) {
    throw error;
  }
}

/**
 * @param {string} userId
 * @param {string} category
 * @param {string} algorithmKey
 * @returns {Promise<void>}
 */
export async function removeFavorite(userId, category, algorithmKey) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase
    .from('favorite_algorithms')
    .delete()
    .eq('user_id', userId)
    .eq('category', category)
    .eq('algorithm_key', algorithmKey);

  if (error) {
    throw error;
  }
}

/**
 * @param {FavoriteRow[]} favorites
 * @param {string} category
 * @param {string} algorithmKey
 * @returns {boolean}
 */
export function isFavorite(favorites, category, algorithmKey) {
  return favorites.some(
    row => row.category === category && row.algorithm_key === algorithmKey
  );
}

/**
 * Fire-and-forget cleanup of registry orphans.
 * @param {string} userId
 * @param {FavoriteRow[]} orphans
 */
export async function removeOrphanFavorites(userId, orphans) {
  if (!orphans.length) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await Promise.all(
    orphans.map(row =>
      supabase
        .from('favorite_algorithms')
        .delete()
        .eq('user_id', userId)
        .eq('category', row.category)
        .eq('algorithm_key', row.algorithm_key)
    )
  );
}

/**
 * Build a lookup map for algorithm labels from CATEGORY_CONFIG i18n keys.
 * Used in tests and non-i18n contexts.
 * @returns {Set<string>}
 */
export function getAllRegistryAlgorithmPairs() {
  const pairs = new Set();
  for (const type of ALGORITHM_TYPE_LIST) {
    const cfg = CATEGORY_CONFIG[type];
    for (const key of cfg.algorithmKeys) {
      pairs.add(`${type}:${key}`);
    }
  }
  return pairs;
}
