/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** Semantic classes — colors from index.css (--color-pc-*) for light/dark */
const C = {
  kw: 'pc-kw',
  fn: 'pc-fn',
  num: 'pc-num',
  arrow: 'pc-arrow',
  op: 'pc-op',
  punc: 'pc-punc',
};

/**
 * Escape text for safe insertion into HTML.
 * @param {string} s
 */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** @param {string} cls @param {string} innerEscaped */
function spanEscaped(cls, innerEscaped) {
  return `<span class="${cls}">${innerEscaped}</span>`;
}

/** @param {string} s */
function reEscape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Multi-word phrases first (including Arabic with spaces), then single tokens.
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
  'floor',
  'min',
  'max',
];

/**
 * Regex body for a single-token keyword (no surrounding parens).
 * ASCII uses \\b; Arabic script uses whitespace/start/end delimiters;
 * other Unicode (e.g. RÉPÉTER, À) uses Unicode-aware "word" boundaries.
 * @param {string} kw
 */
function keywordPatternBody(kw) {
  if (/^[A-Za-z_]+$/.test(kw)) {
    return `\\b${reEscape(kw)}\\b`;
  }
  if (/[\u0600-\u06FF]/.test(kw)) {
    return `(?<=(?:^|\\s))${reEscape(kw)}(?=(?:\\s|$|[,:;\\)\\]]))`;
  }
  return `(?<![\\p{L}\\p{N}_])${reEscape(kw)}(?![\\p{L}\\p{N}_])`;
}

function dedupeSortedByLength(strings) {
  const seen = new Set();
  return [...strings]
    .filter(s => {
      if (!s || seen.has(s)) return false;
      seen.add(s);
      return true;
    })
    .sort((a, b) => b.length - a.length);
}

/** Single regex: alternation order = longest / most specific first */
let tokenRegex = null;
/** @type {string[]} */
let groupTypes = [];

function buildTokenRegex() {
  const multiWord = dedupeSortedByLength(
    KEYWORD_PHRASES.filter(k => /\s/.test(k))
  );
  const singleWord = dedupeSortedByLength(
    KEYWORD_PHRASES.filter(k => !/\s/.test(k))
  );
  const fnNames = dedupeSortedByLength(FN_NAMES);

  const parts = [];
  /** @type {string[]} */
  const types = [];

  const addGroup = (type, body) => {
    parts.push(`(${body})`);
    types.push(type);
  };

  for (const phrase of multiWord) {
    addGroup('kw', reEscape(phrase));
  }

  for (const kw of singleWord) {
    addGroup('kw', keywordPatternBody(kw));
  }

  for (const name of fnNames) {
    addGroup('fn', `\\b${reEscape(name)}\\b`);
  }

  addGroup('num', '\\b(?:infinity|true|false)\\b');
  addGroup('num', '\\d+(?:\\.\\d+)?');
  addGroup('arrow', '\u2190');
  addGroup('op', '[\u2264\u2265\u2260\u2212\u00d7\u00f7]');
  addGroup('op', '\\bmod\\b');
  addGroup('op', '[<>=+]');
  addGroup('punc', '[\\[\\]():,]');

  groupTypes = types;

  tokenRegex = new RegExp(parts.join('|'), 'gu');
}

buildTokenRegex();

/**
 * Highlight one line of pseudocode (raw text).
 * @param {string} line
 * @returns {string} HTML fragment (no outer wrapper)
 */
function highlightLine(line) {
  if (!line && line !== '') return '';
  const re = tokenRegex;
  if (!re) return escapeHtml(line);

  let out = '';
  let lastIndex = 0;
  re.lastIndex = 0;
  let m = re.exec(line);

  while (m !== null) {
    const start = m.index;
    if (start > lastIndex) {
      out += escapeHtml(line.slice(lastIndex, start));
    }

    let tokenType = 'kw';
    for (let i = 1; i < m.length; i += 1) {
      if (m[i] !== undefined) {
        tokenType = groupTypes[i - 1];
        break;
      }
    }

    const inner = escapeHtml(m[0]);
    switch (tokenType) {
      case 'kw':
        out += spanEscaped(C.kw, inner);
        break;
      case 'fn':
        out += spanEscaped(C.fn, inner);
        break;
      case 'num':
        out += spanEscaped(C.num, inner);
        break;
      case 'arrow':
        out += spanEscaped(C.arrow, inner);
        break;
      case 'op':
        out += spanEscaped(C.op, inner);
        break;
      case 'punc':
        out += spanEscaped(C.punc, inner);
        break;
      default:
        out += inner;
    }

    lastIndex = m.index + m[0].length;
    m = re.exec(line);
  }

  if (lastIndex < line.length) {
    out += escapeHtml(line.slice(lastIndex));
  }

  return out;
}

/**
 * Highlight pseudocode for display inside {@code <pre>} (trusted app strings only).
 * @param {string} source
 * @returns {string} HTML
 */
export function highlightPseudocodeToHtml(source) {
  if (!source) return '';

  const rawLines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  for (let i = 0; i < rawLines.length; i += 1) {
    const lineNo = i + 1;
    const bodyHtml = highlightLine(rawLines[i]);
    blocks.push(
      `<span class="pc-line"><span class="pc-lineno" dir="ltr" aria-hidden="true">${lineNo}</span><span class="pc-line-body">${bodyHtml}</span></span>`
    );
  }

  return blocks.join('\n');
}
