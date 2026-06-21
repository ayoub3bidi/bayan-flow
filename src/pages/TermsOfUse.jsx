/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import LegalDocument from '../components/LegalDocument';
import {
  TERMS_OF_USE_LAST_UPDATED,
  TERMS_OF_USE_SECTIONS,
} from '../content/legal/terms.en';

function TermsOfUse() {
  return (
    <LegalDocument
      title="Terms of Use"
      lastUpdated={TERMS_OF_USE_LAST_UPDATED}
      sections={TERMS_OF_USE_SECTIONS}
    />
  );
}

export default TermsOfUse;
