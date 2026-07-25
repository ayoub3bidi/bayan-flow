/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <main className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-theme-primary mb-4">404</h1>
        <p className="text-xl font-semibold text-text-primary mb-2">
          {t('notFound.title')}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          {t('notFound.message')}
        </p>
        <Button to="/" variant="primary">
          {t('notFound.backToHome')}
        </Button>
      </main>
    </div>
  );
}

export default NotFoundPage;
