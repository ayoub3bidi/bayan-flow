/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { createClient } from '@supabase/supabase-js';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  return Boolean(url && key);
}

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL.trim(),
      import.meta.env.VITE_SUPABASE_ANON_KEY.trim(),
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return client;
}
