/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ mock: true, auth: {} })),
}));

describe('supabaseClient', () => {
  it('isSupabaseConfigured returns true when env vars are set', async () => {
    const { isSupabaseConfigured } = await vi.importActual(
      './supabaseClient.js'
    );
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('getSupabaseClient creates a client with auth options', async () => {
    const { getSupabaseClient } = await vi.importActual('./supabaseClient.js');
    const { createClient } = await import('@supabase/supabase-js');

    const client = getSupabaseClient();

    expect(vi.mocked(createClient)).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }
    );
    expect(client).toEqual({ mock: true, auth: {} });
  });

  it('getSupabaseClient creates and caches', async () => {
    const { getSupabaseClient } = await vi.importActual('./supabaseClient.js');
    const { createClient } = await import('@supabase/supabase-js');

    const first = getSupabaseClient();
    expect(vi.mocked(createClient)).toHaveBeenCalledTimes(1);

    const second = getSupabaseClient();
    expect(vi.mocked(createClient)).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });
});
