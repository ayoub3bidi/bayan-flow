/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  WAITLIST_EMAIL_STORAGE_KEY,
  WAITLIST_SOURCES,
  parseWaitlistSource,
} from '@/constants/waitlist';

/** @typedef {import('@/constants/waitlist').WaitlistSource} WaitlistSource */

/**
 * @typedef {'joined' | 'already_joined' | 'invalid_email' | 'unavailable' | 'error'} WaitlistJoinStatus
 */

/**
 * @typedef {Object} WaitlistJoinResult
 * @property {WaitlistJoinStatus} status
 * @property {number} [position]
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} email
 * @returns {string | null}
 */
export function normalizeWaitlistEmail(email) {
  if (typeof email !== 'string') {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !EMAIL_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

/**
 * @param {string} email
 */
export function persistWaitlistEmail(email) {
  try {
    localStorage.setItem(WAITLIST_EMAIL_STORAGE_KEY, email);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @returns {string | null}
 */
export function readStoredWaitlistEmail() {
  try {
    const value = localStorage.getItem(WAITLIST_EMAIL_STORAGE_KEY);
    return value ? normalizeWaitlistEmail(value) : null;
  } catch {
    return null;
  }
}

/**
 * @returns {Promise<number>}
 */
export async function getWaitlistPublicCount() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return 0;
  }

  const { data, error } = await supabase.rpc('waitlist_public_count');
  if (error || data == null) {
    return 0;
  }

  const count = Number(data);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

/**
 * @param {{ email: string, position: number }} payload
 */
async function sendWaitlistWelcomeEmail(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  try {
    await supabase.functions.invoke('waitlist-welcome', {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    console.warn('waitlist-welcome invoke failed:', error);
  }
}

/**
 * @param {string} email
 * @param {{ userId?: string | null, source?: WaitlistSource | string | null }} [options]
 * @returns {Promise<WaitlistJoinResult>}
 */
export async function joinWaitlist(
  email,
  { userId = null, source = WAITLIST_SOURCES.DIRECT } = {}
) {
  const normalized = normalizeWaitlistEmail(email);
  if (!normalized) {
    return { status: 'invalid_email' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { status: 'unavailable' };
  }

  const row = {
    email: normalized,
    source: parseWaitlistSource(source),
  };

  if (userId) {
    row.user_id = userId;
  }

  const { error } = await supabase.from('waitlist').insert(row);

  if (error) {
    if (error.code === '23505') {
      return { status: 'already_joined' };
    }
    console.warn('waitlist insert failed:', error);
    return { status: 'error' };
  }

  persistWaitlistEmail(normalized);

  const position = await getWaitlistPublicCount();

  void sendWaitlistWelcomeEmail({
    email: normalized,
    position,
  });

  return { status: 'joined', position };
}
