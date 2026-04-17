/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Escape text for safe insertion into HTML.
 * @param {string} s
 */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Semantic classes — colors from index.css (--color-pc-*) for light/dark */
const C = {
  kw: 'pc-kw',
  fn: 'pc-fn',
  arrow: 'pc-arrow',
  op: 'pc-op',
};

const span = (cls, inner) => `<span class="${cls}">${inner}</span>`;

/** @param {string} s */
function reEscape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Multi-word phrases first (including Arabic with spaces), then single tokens.
 * Unicode flag so letters like É, أ are word characters for \\b.
 */
const KEYWORD_PHRASES = [
  'ELSE IF',
  'SINON SI',
  'وإلا إذا',
  'END LOOP',
  'FIN BOUCLE',
  'نهاية الحلقة',
  'من أجل',
  'REPEAT',
  'RÉPÉTER',
  'RETURN',
  'RETOURNER',
  'FUNCTION',
  'FONCTION',
  'WHILE',
  'TANT QUE',
  'CONTINUE',
  'CONTINUER',
  'SWAP',
  'ÉCHANGER',
  'ELSE',
  'SINON',
  'FROM',
  'DOWNTO',
  'LOOP',
  'REPORT',
  'SIGNALER',
  'FOR',
  'POUR',
  'IF',
  'SI',
  'AND',
  'ET',
  'OR',
  'OU',
  'TO',
  'À',
  'DE',
  'كرر',
  'طالما',
  'وإلا',
  'إذا',
  'دالة',
  'أرجع',
  'تبادل',
  'أبلغ',
  'تابع',
  'حلقة',
  'نهاية',
  'و',
  'أو',
  'من',
  'إلى',
];

const FN_NAMES = [
  'CountingSortByDigit',
  'DepthLimitedSearch',
  'BreadthFirstSearchGraph',
  'BreadthFirstSearch',
  'InterpolationSearch',
  'ExponentialSearch',
  'FibonacciSearch',
  'BidirectionalSearch',
  'GreedyBestFirstSearch',
  'JumpPointSearch',
  'SelectionSort',
  'InsertionSort',
  'BubbleSort',
  'MergeSort',
  'QuickSort',
  'HeapSort',
  'ShellSort',
  'RadixSort',
  'CountingSort',
  'BucketSort',
  'CycleSort',
  'CombSort',
  'TimSort',
  'BogoSort',
  'TernarySearch',
  'JumpSearch',
  'LinearSearch',
  'BinarySearch',
  'Merge',
  'Partition',
  'Heapify',
  'Dijkstra',
  'BellmanFord',
  'IDAStar',
  'DStarLite',
  'AStar',
];

/**
 * Highlight pseudocode for display inside <pre><code> (trusted app strings only).
 * @param {string} source
 * @returns {string} HTML
 */
export function highlightPseudocodeToHtml(source) {
  if (!source) return '';

  let text = escapeHtml(source);

  text = text.replace(/←/g, span(C.arrow, '←'));
  text = text.replace(/≤/g, span(C.op, '≤'));
  text = text.replace(/≥/g, span(C.op, '≥'));
  text = text.replace(/≠/g, span(C.op, '≠'));
  text = text.replace(/−/g, span(C.op, '−'));
  text = text.replace(/×/g, span(C.op, '×'));
  text = text.replace(/÷/g, span(C.op, '÷'));

  const seen = new Set();
  const kwSorted = [...KEYWORD_PHRASES]
    .filter(k => {
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.length - a.length);

  for (const kw of kwSorted) {
    const hasSpace = /\s/.test(kw);
    if (hasSpace) {
      const re = new RegExp(reEscape(kw), 'gu');
      text = text.replace(re, m => span(C.kw, m));
    } else {
      const re = new RegExp(`\\b${reEscape(kw)}\\b`, 'giu');
      text = text.replace(re, m => span(C.kw, m));
    }
  }

  const fnSeen = new Set();
  const fnSorted = [...FN_NAMES]
    .filter(n => {
      if (fnSeen.has(n)) return false;
      fnSeen.add(n);
      return true;
    })
    .sort((a, b) => b.length - a.length);

  for (const name of fnSorted) {
    const re = new RegExp(`\\b${reEscape(name)}\\b`, 'gu');
    text = text.replace(re, m => span(C.fn, m));
  }

  return text;
}
