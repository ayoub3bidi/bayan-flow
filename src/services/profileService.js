/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';

/** @typedef {'google' | 'generated'} AvatarPreference */

/**
 * @typedef {Object} UserProfileRow
 * @property {string | null} display_name
 * @property {string | null} avatar_url
 * @property {AvatarPreference} avatar_preference
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
    .select('display_name, avatar_url, avatar_preference, plan, email')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * @param {string | null | undefined} displayName
 * @returns {string | null}
 */
function normalizeDisplayName(displayName) {
  if (typeof displayName !== 'string') {
    return null;
  }
  const trimmed = displayName.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * @param {unknown} avatarPreference
 * @returns {AvatarPreference}
 */
function normalizeAvatarPreference(avatarPreference) {
  if (avatarPreference === 'google' || avatarPreference === 'generated') {
    return avatarPreference;
  }
  throw new Error('Invalid avatar preference');
}

/**
 * @param {string} userId
 * @param {{ displayName?: string | null, avatarPreference?: AvatarPreference }} fields
 * @returns {Promise<UserProfileRow>}
 */
export async function updateProfile(userId, { displayName, avatarPreference }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  /** @type {{ display_name?: string | null, avatar_preference?: AvatarPreference }} */
  const payload = {};

  if (displayName !== undefined) {
    payload.display_name = normalizeDisplayName(displayName);
  }

  if (avatarPreference !== undefined) {
    payload.avatar_preference = normalizeAvatarPreference(avatarPreference);
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('No profile fields to update');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('display_name, avatar_url, avatar_preference, plan, email')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
