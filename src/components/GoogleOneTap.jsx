/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { initOneTap } from '@/lib/googleIdentity';
import * as authService from '@/services/authService';

const ONE_TAP_PATHS = new Set(['/', '/app']);

function GoogleOneTap() {
  const { isConfigured, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (
      !isConfigured ||
      isLoading ||
      isAuthenticated ||
      !ONE_TAP_PATHS.has(location.pathname)
    ) {
      cancelRef.current?.();
      cancelRef.current = null;
      return undefined;
    }

    let isMounted = true;

    initOneTap({
      onCredential: async credential => {
        try {
          await authService.signInWithGoogleIdToken(credential);
          if (isMounted && location.pathname === '/') {
            navigate('/app', { replace: true });
          }
        } catch (error) {
          console.error('Google One Tap sign-in failed:', error);
        }
      },
    })
      .then(handle => {
        if (!isMounted) {
          handle.cancel();
          return;
        }
        cancelRef.current = handle.cancel;
      })
      .catch(error => {
        if (isMounted) {
          console.error('Google One Tap initialization failed:', error);
        }
      });

    return () => {
      isMounted = false;
      cancelRef.current?.();
      cancelRef.current = null;
    };
  }, [isConfigured, isLoading, isAuthenticated, location.pathname, navigate]);

  return null;
}

export default GoogleOneTap;
