/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import DOMPurify from 'isomorphic-dompurify';
import {
  NOTE_MAX_HTML_LENGTH,
  NOTE_MAX_PLAIN_TEXT_LENGTH,
} from '@/constants/personalLearning';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'code',
  'blockquote',
];

/**
 * @param {string} html
 * @returns {string}
 */
export function sanitizeNoteHtml(html) {
  if (typeof html !== 'string') {
    return '';
  }

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });

  return sanitized.slice(0, NOTE_MAX_HTML_LENGTH);
}

/**
 * @param {string} html
 * @returns {string}
 */
export function getPlainTextFromNoteHtml(html) {
  if (typeof html !== 'string' || !html.trim()) {
    return '';
  }

  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent ?? '').trim();
  }

  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} html
 * @returns {boolean}
 */
export function isNoteContentEmpty(html) {
  return getPlainTextFromNoteHtml(html).length === 0;
}

/**
 * @param {string} html
 * @throws {Error}
 */
export function assertNotePlainTextLength(html) {
  const plain = getPlainTextFromNoteHtml(html);
  if (plain.length > NOTE_MAX_PLAIN_TEXT_LENGTH) {
    throw new Error('Note exceeds maximum length');
  }
}
