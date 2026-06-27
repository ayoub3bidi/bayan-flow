/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/**
 * @param {string} code
 * @param {string} codeVerifier
 * @param {string} clientId
 * @param {string} redirectUri
 * @returns {Promise<{ idToken: string; accessToken?: string }>}
 */
export async function exchangeGoogleAuthCode(
  code,
  codeVerifier,
  clientId,
  redirectUri
) {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error_description ?? payload.error ?? 'Token exchange failed'
    );
  }

  if (!payload.id_token) {
    throw new Error('Google did not return an ID token');
  }

  return {
    idToken: payload.id_token,
    accessToken: payload.access_token,
  };
}
