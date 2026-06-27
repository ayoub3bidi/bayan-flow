/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';

/**
 * @typedef {Object} UserProfileRow
 * @property {string | null} display_name
 * @property {string | null} avatar_url
 * @property {'free' | 'pro'} plan
 * @property {string | null} email
 */

/**
 * @param {string} userId
 * @returns {Promise<UserProfileRow | null>}
 */
export async function getProfile(userId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, plan, email')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
