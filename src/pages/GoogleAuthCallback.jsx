/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSession } from '@/services/authService';

function GoogleAuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    getSession()
      .then(session => {
        if (!cancelled) {
          if (session) {
            navigate('/app', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/', { replace: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <p className="text-sm text-text-secondary">
        {t('auth.completing_sign_in')}
      </p>
    </div>
  );
}

export default GoogleAuthCallback;
