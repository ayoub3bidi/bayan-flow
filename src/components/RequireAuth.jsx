/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * @param {{ children: import('react').ReactNode }} props
 */
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConfigured || (!isLoading && !isAuthenticated)) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, isConfigured, navigate]);

  if (!isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div
          className="h-9 w-9 rounded-full border border-(--color-glass-border) bg-interactive-bg animate-pulse"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}

export default RequireAuth;
