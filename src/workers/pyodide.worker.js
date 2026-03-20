/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Web Worker that loads Pyodide (CPython via WebAssembly) from CDN
 * and executes Python code in isolation. Captures stdout/stderr.
 */
/* global importScripts, loadPyodide */

let pyodide = null;
let pendingRun = null;

self.onmessage = async e => {
  const { type, code, version = '0.27.5' } = e.data || {};

  if (type === 'init') {
    try {
      self.postMessage({ type: 'loading' });
      const pyodideUrl = `https://cdn.jsdelivr.net/pyodide/v${version}/full/pyodide.js`;
      importScripts(pyodideUrl);
      pyodide = await loadPyodide({
        stdout: text => self.postMessage({ type: 'stdout', text: text + '\n' }),
        stderr: text => self.postMessage({ type: 'stderr', text: text + '\n' }),
      });
      self.postMessage({ type: 'ready' });
      if (pendingRun) {
        const codeToRun = pendingRun;
        pendingRun = null;
        try {
          await pyodide.runPythonAsync(codeToRun);
          self.postMessage({ type: 'done', result: '' });
        } catch (err) {
          self.postMessage({ type: 'error', error: err.message });
        }
      }
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: `Failed to load Python runtime: ${err.message}`,
      });
    }
    return;
  }

  if (type === 'run') {
    if (!pyodide) {
      pendingRun = code;
      return;
    }
    try {
      const result = await pyodide.runPythonAsync(code);
      self.postMessage({
        type: 'done',
        result: result != null ? String(result) : '',
      });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};
