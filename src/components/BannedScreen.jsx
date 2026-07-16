/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from './UserMenu';

function BannedScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="flex items-center justify-end px-4 py-3 sm:px-6">
        <UserMenu variant="compact" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="max-w-md w-full rounded-2xl border border-(--color-glass-border) bg-(--color-glass-bg) backdrop-blur-lg shadow-xl p-8 text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-3">
            {t('accessBan.title')}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-2">
            {t('accessBan.description')}
          </p>
          {profile?.email ? (
            <p className="text-xs text-text-secondary/80 mt-4">
              {t('accessBan.signedInAs', { email: profile.email })}
            </p>
          ) : null}
          <p className="text-xs text-text-secondary/80 mt-4">
            {t('accessBan.contact')}
          </p>
        </div>
      </main>
    </div>
  );
}

export default BannedScreen;
