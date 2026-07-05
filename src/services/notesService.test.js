/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALGORITHM_TYPES } from '@/constants';
import { getNote, upsertNote } from './notesService';
import {
  sanitizeNoteHtml,
  isNoteContentEmpty,
} from '@/utils/noteHtmlSanitizer';

vi.mock('@/lib/supabaseClient', () => import('@/test/supabaseMock'));

import {
  getSupabaseClient,
  resetSupabaseMocks,
  mockSupabaseConfigured,
  createSupabaseQueryBuilder,
  supabaseFromMock,
} from '@/test/supabaseMock';

describe('noteHtmlSanitizer', () => {
  it('strips script tags', () => {
    const result = sanitizeNoteHtml('<p>Hi</p><script>alert(1)</script>');
    expect(result).not.toContain('script');
    expect(result).toContain('Hi');
  });

  it('detects empty content', () => {
    expect(isNoteContentEmpty('<p></p>')).toBe(true);
    expect(isNoteContentEmpty('<p>note</p>')).toBe(false);
  });
});

describe('notesService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
  });

  it('getNote returns null when client missing', async () => {
    getSupabaseClient.mockReturnValue(null);
    await expect(
      getNote('u1', ALGORITHM_TYPES.SORTING, 'bubbleSort')
    ).resolves.toBeNull();
  });

  it('getNote returns row from supabase', async () => {
    supabaseFromMock.mockReturnValue(
      createSupabaseQueryBuilder({
        maybeSingle: vi.fn(async () => ({
          data: { body_html: '<p>x</p>', updated_at: '2026-01-01' },
          error: null,
        })),
      })
    );

    await expect(
      getNote('u1', ALGORITHM_TYPES.SORTING, 'bubbleSort')
    ).resolves.toEqual({
      body_html: '<p>x</p>',
      updated_at: '2026-01-01',
    });
  });

  it('upsertNote deletes row when content empty', async () => {
    const del = vi.fn(() => createSupabaseQueryBuilder());
    supabaseFromMock.mockReturnValue(
      createSupabaseQueryBuilder({ delete: del })
    );

    await expect(
      upsertNote('u1', ALGORITHM_TYPES.SORTING, 'bubbleSort', '<p></p>')
    ).resolves.toBeNull();
    expect(del).toHaveBeenCalled();
  });

  it('upsertNote upserts sanitized html', async () => {
    const upsert = vi.fn().mockReturnThis();
    const select = vi.fn().mockReturnThis();
    const single = vi.fn(async () => ({
      data: { body_html: '<p>note</p>', updated_at: '2026-01-02' },
      error: null,
    }));
    supabaseFromMock.mockReturnValue(
      createSupabaseQueryBuilder({ upsert, select, single })
    );

    const result = await upsertNote(
      'u1',
      ALGORITHM_TYPES.SORTING,
      'bubbleSort',
      '<p>note</p><script>x</script>'
    );

    expect(upsert).toHaveBeenCalled();
    expect(result?.body_html).toBe('<p>note</p>');
  });
});
