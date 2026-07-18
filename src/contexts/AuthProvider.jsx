/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAuthConfigured } from '@/services/authService';
import * as authService from '@/services/authService';
import { getProfile } from '@/services/profileService';
import { checkPlatformAccess } from '@/services/accessService';
import { resetAllSessionCounters } from '@/services/entitlementService';
import {
  getMetadataAvatarUrl,
  resolveDisplayName,
  resolveUserAvatar,
} from '@/utils/resolveUserAvatar';
import { AuthContext } from './AuthContextDefinition';
import { identifyUser, resetUser } from '../services/analytics';
import { trackSignInCompleted } from '../services/analyticsEvents';

/** @typedef {'account_banned' | null} AccessBlockReason */

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
  const avatarPreference =
    profileRow?.avatar_preference === 'generated' ? 'generated' : 'google';
  const { src, source } = resolveUserAvatar({
    metadataUrl: getMetadataAvatarUrl(user),
    profileUrl: profileRow?.avatar_url,
    email,
    size: avatarSize,
    avatarPreference,
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
  const isConfigured = isAuthConfigured();
  const [session, setSession] = useState(null);
  const [profileRow, setProfileRow] = useState(null);
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [accessBlock, setAccessBlock] = useState(
    /** @type {AccessBlockReason} */ (null)
  );

  const user = session?.user ?? null;
  const requestRef = useRef(0);
  const accessCheckRef = useRef(0);
  const userRef = useRef(null);
  userRef.current = user;

  const refreshProfile = useCallback(async activeUser => {
    const requestId = ++requestRef.current;
    if (!activeUser) {
      setProfileRow(null);
      return null;
    }
    try {
      const row = await getProfile(activeUser.id);
      if (requestRef.current !== requestId) {
        return null;
      }
      setProfileRow(row);
      return row;
    } catch (error) {
      if (requestRef.current !== requestId) {
        return null;
      }
      console.error('Failed to load user profile:', error);
      setProfileRow(null);
      return null;
    }
  }, []);

  const evaluateAccess = useCallback(
    async activeUser => {
      const checkId = ++accessCheckRef.current;

      if (!activeUser) {
        setProfileRow(null);
        setAccessBlock(null);
        return;
      }

      try {
        const row = await refreshProfile(activeUser);
        if (accessCheckRef.current !== checkId) {
          return;
        }

        if (row?.is_banned) {
          setAccessBlock('account_banned');
          return;
        }

        try {
          await authService.getUser();
        } catch (error) {
          if (accessCheckRef.current !== checkId) {
            return;
          }
          if (error instanceof Error && error.name === 'AccountBannedError') {
            setAccessBlock('account_banned');
            return;
          }
        }

        const access = await checkPlatformAccess();
        if (accessCheckRef.current !== checkId) {
          return;
        }

        if (!access.allowed && access.reason === 'account_banned') {
          setAccessBlock('account_banned');
          return;
        }

        setAccessBlock(null);

        identifyUser(activeUser, {
          email: activeUser.email,
          displayName: row?.display_name ?? resolveDisplayName(activeUser),
          plan: row?.plan ?? null,
        });
      } catch (error) {
        if (accessCheckRef.current !== checkId) {
          return;
        }
        console.error('Failed to evaluate platform access:', error);
        setAccessBlock(null);
      }
    },
    [refreshProfile]
  );

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
        await evaluateAccess(nextSession?.user ?? null);
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
      async (event, nextSession) => {
        if (!isMounted) {
          return;
        }

        if (event === 'SIGNED_IN' && nextSession?.user != null) {
          resetAllSessionCounters();
          resetUser();
          identifyUser(nextSession.user, {
            email: nextSession.user.email,
            displayName:
              nextSession.user.user_metadata?.full_name ||
              nextSession.user.user_metadata?.name,
            plan: null,
          });
          trackSignInCompleted();
        }

        if (event === 'SIGNED_OUT') {
          resetUser();
        }

        setSession(nextSession);
        setIsLoading(true);
        try {
          await evaluateAccess(nextSession?.user ?? null);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userRef.current) {
        evaluateAccess(userRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      unsubscribe?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConfigured, evaluateAccess]);

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setProfileRow(null);
    setAccessBlock(null);
  }, []);

  const profile = useMemo(
    () => buildProfileView(user, profileRow, 128),
    [user, profileRow]
  );

  const refreshProfileForUser = useCallback(async () => {
    await evaluateAccess(user);
  }, [evaluateAccess, user]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      isConfigured,
      accessBlock,
      signInWithGoogle,
      signOut,
      refreshProfile: refreshProfileForUser,
    }),
    [
      user,
      session,
      profile,
      isLoading,
      isConfigured,
      accessBlock,
      signInWithGoogle,
      signOut,
      refreshProfileForUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
