/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import LegalDocument from '../components/LegalDocument';
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from '../content/legal/privacy.en';

function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <LegalDocument
      title={t('legal.privacyTitle')}
      lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}

export default PrivacyPolicy;
