/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import LegalDocument from '../components/LegalDocument';
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from '../content/legal/privacy.en';

function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}

export default PrivacyPolicy;
