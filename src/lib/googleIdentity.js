/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

/** @type {Promise<void> | null} */
let scriptLoadPromise = null;

/** @type {boolean} */
let gisInitialized = false;

/** @type {((credential: string) => void | Promise<void>) | null} */
let credentialHandler = null;

/** @type {HTMLElement | null} */
let signInHost = null;

/**
 * @returns {boolean}
 */
export function isGoogleAuthConfigured() {
  return Boolean((import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? '').trim());
}

/**
 * @returns {string}
 */
export function getGoogleClientId() {
  const clientId = (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? '').trim();
  if (!clientId) {
    throw new Error('Google Web Client ID is not configured');
  }
  return clientId;
}

/**
 * Origin Google validates against Authorized JavaScript origins in Cloud Console.
 * @returns {string}
 */
export function getGoogleSignInOrigin() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.origin;
}

/**
 * @returns {Promise<void>}
 */
export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('GIS script failed')),
        {
          once: true,
        }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function cancelGoogleOneTap() {
  if (typeof window === 'undefined') {
    return;
  }
  window.google?.accounts?.id?.cancel?.();
}

/**
 * @returns {string}
 */
export function createNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * @param {string} nonce
 * @returns {Promise<string>}
 */
export async function hashNonce(nonce) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(nonce)
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * GIS allows one initialize() per page — shared callback dispatcher for One Tap + button.
 * @returns {Promise<void>}
 */
async function ensureGisInitialized() {
  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services is unavailable');
  }

  if (gisInitialized) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: getGoogleClientId(),
    callback: async response => {
      const handler = credentialHandler;
      credentialHandler = null;
      if (!response?.credential || !handler) {
        return;
      }
      await handler(response.credential);
    },
    use_fedcm_for_prompt: true,
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
    itp_support: true,
  });

  gisInitialized = true;
}

/**
 * @param {Object} options
 * @param {(credential: string) => void | Promise<void>} options.onCredential
 * @returns {Promise<{ cancel: () => void }>}
 */
export async function initOneTap({ onCredential }) {
  await ensureGisInitialized();
  cancelGoogleOneTap();

  let cancelled = false;

  credentialHandler = async credential => {
    if (!cancelled) {
      await onCredential(credential);
    }
  };

  window.google.accounts.id.prompt();

  return {
    cancel: () => {
      cancelled = true;
      credentialHandler = null;
      cancelGoogleOneTap();
    },
  };
}

/**
 * @param {(reason?: unknown) => void} reject
 */
function cleanupSignInHost() {
  if (signInHost) {
    signInHost.remove();
    signInHost = null;
  }
}

function openGoogleSignInButton(reject) {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';

  window.google.accounts.id.renderButton(host, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
  });

  const googleButton = host.querySelector('[role="button"]');
  if (!googleButton) {
    host.remove();
    reject(
      new Error(
        `Google sign-in is not allowed for origin "${getGoogleSignInOrigin()}". Add this exact origin under Authorized JavaScript origins in Google Cloud Console for client ${getGoogleClientId()}.`
      )
    );
    return;
  }

  document.body.appendChild(host);
  signInHost = host;
  googleButton.click();
}

/**
 * User-initiated Google sign-in (header G button).
 * @returns {Promise<{ idToken: string }>}
 */
export async function requestGoogleSignInPopup() {
  await ensureGisInitialized();
  cancelGoogleOneTap();

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (handler, value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      cleanupSignInHost();
      if (handler === reject) {
        credentialHandler = null;
      }
      handler(value);
    };

    const timeoutId = setTimeout(() => {
      finish(reject, new Error('Google sign-in timed out'));
    }, 120_000);

    credentialHandler = async credential => {
      finish(resolve, { idToken: credential });
    };

    openGoogleSignInButton(reason => finish(reject, reason));
  });
}

export function disableGoogleAutoSelect() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.google?.accounts?.id?.disableAutoSelect) {
    window.google.accounts.id.disableAutoSelect();
  }
}

/** @internal Test-only reset for GIS singleton state. */
export function resetGoogleIdentityForTests() {
  gisInitialized = false;
  credentialHandler = null;
  scriptLoadPromise = null;
}
