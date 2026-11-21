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
import { isAccountBannedError } from '@/utils/authBan';

export const AUTH_CALLBACK_PATH = '/auth/google/callback';

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}

/** Max wait for Turnstile once the Google step is done. */
export const TURNSTILE_TIMEOUT_MS = 60_000;

/**
 * Start Cloudflare Turnstile. `token` resolves with a verification token, or
 * null when the site key is not configured (local/CI). It rejects when the
 * site key is set but the script is missing or the challenge fails, so a
 * token-less signup never reaches the server gate. `cancel()` removes the widget.
 *
 * `interaction-only` stays invisible unless Cloudflare asks for a human check
 * (common on phones); the container must be visible and tappable for that.
 * @returns {{ token: Promise<string | null>, cancel: () => void }}
 */
function startTurnstile() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return { token: Promise.resolve(null), cancel: () => {} };
  }

  const turnstile = /** @type {any} */ (globalThis).turnstile;
  if (typeof turnstile === 'undefined') {
    return {
      token: Promise.reject(
        new Error('Turnstile is not available. Please refresh and try again.')
      ),
      cancel: () => {},
    };
  }

  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;';
  document.body.appendChild(container);
  const cancel = () => container.remove();

  const token = new Promise((resolve, reject) => {
    turnstile.render(container, {
      sitekey: siteKey,
      appearance: 'interaction-only',
      callback: (/** @type {string} */ value) => {
        cancel();
        resolve(value);
      },
      'error-callback': (/** @type {string | undefined} */ code) => {
        cancel();
        reject(
          new Error(
            `Turnstile verification failed${code ? ` (${code})` : ''}. Please try again.`
          )
        );
      },
    });
  });

  return { token, cancel };
}

/**
 * @param {{ token: Promise<string | null>, cancel: () => void }} turnstile
 * @returns {Promise<string | null>}
 */
function awaitTurnstile(turnstile) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      turnstile.cancel();
      reject(new Error('Turnstile verification timed out. Please try again.'));
    }, TURNSTILE_TIMEOUT_MS);
  });
  return Promise.race([turnstile.token, timeout]).finally(() =>
    clearTimeout(timeoutId)
  );
}

/**
 * Tag a failure with the sign-in step it came from (for analytics).
 * @template T
 * @param {'google' | 'turnstile' | 'supabase'} step
 * @param {() => Promise<T>} run
 * @returns {Promise<T>}
 */
async function signInStep(step, run) {
  try {
    return await run();
  } catch (error) {
    if (error && typeof error === 'object') {
      /** @type {any} */ (error).signInStep = step;
    }
    throw error;
  }
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
 * @param {string} [turnstileToken]
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function signInWithGoogleIdToken(
  idToken,
  nonce,
  accessToken,
  turnstileToken
) {
  const supabase = requireClient();
  // signInWithIdToken does not accept user `data` metadata. Turnstile must go
  // through options.captchaToken → gotrue_meta_security.captcha_token (verified
  // by GoTrue when Auth CAPTCHA protection is enabled).
  const /** @type {Record<string, any>} */ credentials = {
      provider: 'google',
      token: idToken,
      nonce,
      access_token: accessToken,
    };

  if (turnstileToken) {
    credentials.options = { captchaToken: turnstileToken };
  }

  const { data, error } = await supabase.auth.signInWithIdToken(credentials);

  if (error) {
    throw error;
  }

  await syncGoogleProfileMetadata(idToken);
  return data?.user ?? null;
}

export async function signInWithGoogle() {
  if (!isAuthConfigured()) {
    throw new Error('Auth is not fully configured');
  }

  // Run Turnstile while the user is in Google's account picker, so the
  // token is usually ready when they come back.
  const turnstile = startTurnstile();
  turnstile.token.catch(() => {});

  let idToken;
  try {
    ({ idToken } = await signInStep('google', requestGoogleSignInPopup));
  } catch (error) {
    turnstile.cancel();
    throw error;
  }
  const turnstileToken = await signInStep('turnstile', () =>
    awaitTurnstile(turnstile)
  );
  return signInStep('supabase', () =>
    signInWithGoogleIdToken(idToken, undefined, undefined, turnstileToken)
  );
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

/**
 * Whether Supabase has a persisted session in this browser, read synchronously
 * (it may still be expired; `getSession()` is the authority).
 * @returns {boolean}
 */
export function hasStoredSession() {
  try {
    const key = getSupabaseClient()?.auth?.storageKey;
    return Boolean(key && window.localStorage.getItem(key));
  } catch {
    return false;
  }
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
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getUser() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (isAccountBannedError(error)) {
      const banError = new Error('account_banned');
      banError.name = 'AccountBannedError';
      throw banError;
    }
    throw error;
  }

  return data.user;
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

/**
 * Sync signed-in user to Resend (fire-and-forget).
 * Identity is taken from the JWT inside the edge function — body is metadata only.
 * @param {object} [profile]
 */
export function syncContactToResend(profile) {
  const supabase = getSupabaseClient();
  if (!supabase) return Promise.resolve();

  return supabase.functions.invoke('sync-contacts', {
    method: 'POST',
    body: {
      ...(profile?.plan ? { plan: profile.plan } : {}),
      displayName: profile?.displayName || '',
      language: document.documentElement.lang || 'en',
    },
  });
}
