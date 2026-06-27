/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import * as authService from '@/services/authService';
import { getProfile } from '@/services/profileService';
import {
  getMetadataAvatarUrl,
  resolveDisplayName,
  resolveUserAvatar,
} from '@/utils/resolveUserAvatar';
import { AuthContext } from './AuthContextDefinition';

/**
 * @param {import('@supabase/supabase-js').User | null} user
 * @param {Awaited<ReturnType<typeof getProfile>>} profileRow
 * @param {number} avatarSize
 */
function buildProfileView(user, profileRow, avatarSize) {
  if (!user) {
    return null;
  }

  const email = user.email ?? profileRow?.email ?? '';
  const { src, source } = resolveUserAvatar({
    metadataUrl: getMetadataAvatarUrl(user),
    profileUrl: profileRow?.avatar_url,
    email,
    size: avatarSize,
  });

  return {
    displayName: resolveDisplayName(user, profileRow),
    email,
    avatarSrc: src,
    avatarSource: source,
    plan: profileRow?.plan === 'pro' ? 'pro' : 'free',
  };
}

export function AuthProvider({ children }) {
  const isConfigured = isSupabaseConfigured();
  const [session, setSession] = useState(null);
  const [profileRow, setProfileRow] = useState(null);
  const [isLoading, setIsLoading] = useState(isConfigured);

  const user = session?.user ?? null;

  const refreshProfile = useCallback(async activeUser => {
    if (!activeUser) {
      setProfileRow(null);
      return;
    }
    try {
      const row = await getProfile(activeUser.id);
      setProfileRow(row);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setProfileRow(null);
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const hydrate = async () => {
      try {
        const nextSession = await authService.getSession();
        if (!isMounted) {
          return;
        }
        setSession(nextSession);
        await refreshProfile(nextSession?.user ?? null);
      } catch (error) {
        console.error('Failed to hydrate auth session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrate();

    const unsubscribe = authService.onAuthStateChange(
      async (_event, nextSession) => {
        if (!isMounted) {
          return;
        }
        setSession(nextSession);
        setIsLoading(true);
        try {
          await refreshProfile(nextSession?.user ?? null);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [isConfigured, refreshProfile]);

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setProfileRow(null);
  }, []);

  const profile = useMemo(
    () => buildProfileView(user, profileRow, 128),
    [user, profileRow]
  );

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      isConfigured,
      signInWithGoogle,
      signOut,
    }),
    [user, session, profile, isLoading, isConfigured, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
