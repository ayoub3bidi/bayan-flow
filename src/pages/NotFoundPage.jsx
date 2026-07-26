/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <main className="max-w-md w-full text-center">
        <p
          aria-hidden="true"
          className="text-6xl font-bold text-theme-primary mb-4"
        >
          404
        </p>
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          {t('notFound.title')}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          {t('notFound.message')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-theme-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-theme-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
        >
          {t('notFound.backToHome')}
        </Link>
      </main>
    </div>
  );
}

export default NotFoundPage;
