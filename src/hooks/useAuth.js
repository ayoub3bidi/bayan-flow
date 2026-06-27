/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContextDefinition';

/**
 * @returns {import('@/contexts/AuthContextDefinition').AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
