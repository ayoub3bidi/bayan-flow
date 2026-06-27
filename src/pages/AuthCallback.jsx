/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { AUTH_COMPLETE_MESSAGE } from '@/services/authService';

function AuthCallback() {
  const { t } = useTranslation();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      window.close();
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Auth callback failed:', error);
      }

      if (session && window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: AUTH_COMPLETE_MESSAGE },
          window.location.origin
        );
      }

      window.close();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <p className="text-sm text-text-secondary">
        {t('auth.completing_sign_in')}
      </p>
    </div>
  );
}

export default AuthCallback;
