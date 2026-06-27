/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';

export const AUTH_CALLBACK_PATH = '/auth/callback';
export const AUTH_COMPLETE_MESSAGE = 'bayan-flow-auth-complete';

const POPUP_NAME = 'bayan-flow-google-auth';
const POPUP_FEATURES =
  'popup=yes,width=500,height=680,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes';
const POPUP_TIMEOUT_MS = 5 * 60 * 1000;

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}

/**
 * @returns {string}
 */
export function getOAuthCallbackUrl() {
  if (typeof window === 'undefined') {
    return AUTH_CALLBACK_PATH;
  }
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`;
}

/**
 * @param {string} oauthUrl
 * @returns {Promise<void>}
 */
function openOAuthPopupAndWait(oauthUrl) {
  return new Promise((resolve, reject) => {
    const popup = window.open(oauthUrl, POPUP_NAME, POPUP_FEATURES);
    if (!popup) {
      reject(
        new Error(
          'Popup blocked. Allow popups for this site to sign in with Google.'
        )
      );
      return;
    }

    let settled = false;

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
    };

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };

    const fail = error => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    const onMessage = async event => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type !== AUTH_COMPLETE_MESSAGE) {
        return;
      }

      const session = await getSession();
      if (session) {
        finish();
      }
    };

    window.addEventListener('message', onMessage);

    const pollTimer = setInterval(async () => {
      if (!popup.closed) {
        return;
      }

      const session = await getSession();
      if (session) {
        finish();
        return;
      }

      fail(new Error('Sign-in was cancelled'));
    }, 400);

    const timeoutTimer = setTimeout(() => {
      try {
        popup.close();
      } catch {
        /* ignore */
      }
      fail(new Error('Sign-in timed out'));
    }, POPUP_TIMEOUT_MS);
  });
}

export async function signInWithGoogle() {
  const supabase = requireClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getOAuthCallbackUrl(),
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('OAuth URL was not returned');
  }

  if (typeof window === 'undefined') {
    return;
  }

  await openOAuthPopupAndWait(data.url);
}

export async function signOut() {
  const supabase = requireClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
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
