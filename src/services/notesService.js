/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';
import { isAlgorithmInRegistry } from '@/services/favoritesService';
import {
  assertNotePlainTextLength,
  isNoteContentEmpty,
  sanitizeNoteHtml,
} from '@/utils/noteHtmlSanitizer';

/**
 * @typedef {Object} NoteRow
 * @property {string} body_html
 * @property {string} updated_at
 */

/**
 * @param {string} userId
 * @param {string} category
 * @param {string} algorithmKey
 * @returns {Promise<NoteRow | null>}
 */
export async function getNote(userId, category, algorithmKey) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('algorithm_notes')
    .select('body_html, updated_at')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('algorithm_key', algorithmKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * @param {string} userId
 * @param {string} category
 * @param {string} algorithmKey
 * @param {string} bodyHtml
 * @returns {Promise<NoteRow | null>}
 */
export async function upsertNote(userId, category, algorithmKey, bodyHtml) {
  if (!isAlgorithmInRegistry(category, algorithmKey)) {
    throw new Error('Unknown algorithm');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const sanitized = sanitizeNoteHtml(bodyHtml);
  assertNotePlainTextLength(sanitized);

  if (isNoteContentEmpty(sanitized)) {
    const { error } = await supabase
      .from('algorithm_notes')
      .delete()
      .eq('user_id', userId)
      .eq('category', category)
      .eq('algorithm_key', algorithmKey);

    if (error) {
      throw error;
    }

    return null;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('algorithm_notes')
    .upsert(
      {
        user_id: userId,
        category,
        algorithm_key: algorithmKey,
        body_html: sanitized,
        updated_at: now,
      },
      { onConflict: 'user_id,category,algorithm_key' }
    )
    .select('body_html, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
