/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';

/** @typedef {'account_banned' | null} AccessBlockReason */

/**
 * @typedef {Object} PlatformAccessResult
 * @property {boolean} allowed
 * @property {AccessBlockReason} [reason]
 * @property {boolean} [failOpen]
 */

/**
 * Invokes platform-access for signed-in users. Fail-open on transport errors.
 * @returns {Promise<PlatformAccessResult>}
 */
export async function checkPlatformAccess() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { allowed: true, failOpen: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke('platform-access', {
      method: 'POST',
      timeout: 10000,
    });

    if (error) {
      console.warn('platform-access invoke failed:', error);
      return { allowed: true, failOpen: true };
    }

    if (data?.allowed === false && data?.reason === 'account_banned') {
      return { allowed: false, reason: 'account_banned' };
    }

    return { allowed: true };
  } catch (error) {
    console.warn('platform-access unexpected error:', error);
    return { allowed: true, failOpen: true };
  }
}
