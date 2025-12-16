/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/* eslint-disable react-refresh/only-export-components */

import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

/**
 * Custom render function that wraps components with i18n provider
 * @param {ReactNode} component - Component to render
 * @param {Object} options - Additional render options
 * @returns {Object} Render result
 */
export function renderWithI18n(component, options = {}) {
  return render(
    <I18nextProvider i18n={i18n}>{component}</I18nextProvider>,
    options
  );
}

export * from '@testing-library/react';
