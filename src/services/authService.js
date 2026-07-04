/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabaseClient';
import {
  isGoogleAuthConfigured,
  requestGoogleSignInPopup,
} from '@/lib/googleIdentity';

export const AUTH_CALLBACK_PATH = '/auth/google/callback';

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}

/**
 * @returns {boolean}
 */
export function isAuthConfigured() {
  return isSupabaseConfigured() && isGoogleAuthConfigured();
}

function parseGoogleIdTokenClaims(idToken) {
  try {
    const segment = idToken.split('.')[1];
    if (!segment) {
      return {};
    }
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

/**
 * Supabase signInWithIdToken may omit picture in user_metadata; sync from JWT claims.
 * @param {string} idToken
 */
async function syncGoogleProfileMetadata(idToken) {
  const claims = parseGoogleIdTokenClaims(idToken);
  const data = {};

  if (typeof claims.picture === 'string' && claims.picture.trim()) {
    data.picture = claims.picture.trim();
    data.avatar_url = data.picture;
  }

  if (typeof claims.name === 'string' && claims.name.trim()) {
    data.full_name = claims.name.trim();
    data.name = data.full_name;
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  const supabase = requireClient();
  const { error } = await supabase.auth.updateUser({ data });
  if (error) {
    console.warn('Failed to sync Google profile metadata:', error);
  }
}

/**
 * @param {string} idToken
 * @param {string} [nonce]
 * @param {string} [accessToken]
 * @returns {Promise<void>}
 */
export async function signInWithGoogleIdToken(idToken, nonce, accessToken) {
  const supabase = requireClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    nonce,
    access_token: accessToken,
  });

  if (error) {
    throw error;
  }

  await syncGoogleProfileMetadata(idToken);
}

export async function signInWithGoogle() {
  if (!isAuthConfigured()) {
    throw new Error('Auth is not fully configured');
  }

  const { idToken } = await requestGoogleSignInPopup();
  await signInWithGoogleIdToken(idToken);
}

export async function signOut() {
  const supabase = requireClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Permanently delete the signed-in user's account via Edge Function.
 * @returns {Promise<void>}
 */
export async function deleteAccount() {
  const supabase = requireClient();
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw error;
  }

  await signOut();
}

export async function getSession() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

/**
 * @param {(event: string, session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {(() => void) | undefined}
 */
export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return undefined;
  }
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => data.subscription.unsubscribe();
}
