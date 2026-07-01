import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseFromMock,
} from '../test/supabaseMock.js';
import { getProfile, updateProfile } from './profileService';

describe('profileService', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
  });

  it('getProfile returns profile row', async () => {
    const row = {
      display_name: 'Ada Lovelace',
      avatar_url: 'https://lh3.googleusercontent.com/a/example',
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    };

    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: row, error: null })),
    });

    await expect(getProfile('user-1')).resolves.toEqual(row);
  });

  it('getProfile returns null when Supabase is not configured', async () => {
    mockSupabaseConfigured(false);
    await expect(getProfile('user-1')).resolves.toBeNull();
  });

  it('updateProfile trims display name and updates allowed columns only', async () => {
    const updatedRow = {
      display_name: 'Ada',
      avatar_url: null,
      avatar_preference: 'generated',
      plan: 'free',
      email: 'ada@example.com',
    };

    const updateMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const selectMock = vi.fn().mockReturnThis();
    const singleMock = vi.fn(async () => ({ data: updatedRow, error: null }));

    supabaseFromMock.mockReturnValue({
      update: updateMock,
      eq: eqMock,
      select: selectMock,
      single: singleMock,
    });

    const result = await updateProfile('user-1', {
      displayName: '  Ada  ',
      avatarPreference: 'generated',
    });

    expect(updateMock).toHaveBeenCalledWith({
      display_name: 'Ada',
      avatar_preference: 'generated',
    });
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ plan: expect.anything() })
    );
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: expect.anything() })
    );
    expect(eqMock).toHaveBeenCalledWith('id', 'user-1');
    expect(result).toEqual(updatedRow);
  });

  it('updateProfile converts blank display name to null', async () => {
    const updateMock = vi.fn().mockReturnThis();

    supabaseFromMock.mockReturnValue({
      update: updateMock,
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(async () => ({
        data: {
          display_name: null,
          avatar_url: null,
          avatar_preference: 'google',
          plan: 'free',
          email: 'ada@example.com',
        },
        error: null,
      })),
    });

    await updateProfile('user-1', { displayName: '   ' });

    expect(updateMock).toHaveBeenCalledWith({ display_name: null });
  });

  it('updateProfile rejects invalid avatar preference', async () => {
    await expect(
      updateProfile('user-1', { avatarPreference: 'invalid' })
    ).rejects.toThrow('Invalid avatar preference');
  });

  it('updateProfile throws when Supabase is not configured', async () => {
    mockSupabaseConfigured(false);
    await expect(
      updateProfile('user-1', { displayName: 'Ada' })
    ).rejects.toThrow('Supabase is not configured');
  });
});
