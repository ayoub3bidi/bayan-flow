/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Hook for executing Python code client-side via Pyodide in a Web Worker.
 * Lazy-loads the runtime on first run. Supports timeout, stdout/stderr capture.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const PYODIDE_VERSION = '0.27.5';
const DEFAULT_TIMEOUT = 10_000;
const OUTPUT_CAP = 10_000;

export function usePythonExecution({ timeout = DEFAULT_TIMEOUT } = {}) {
  const [status, setStatus] = useState('idle');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  const appendOutput = useCallback(text => {
    setOutput(prev => {
      const next = prev + text;
      if (next.length > OUTPUT_CAP) {
        return next.slice(0, OUTPUT_CAP) + '\n[Output truncated]';
      }
      return next;
    });
  }, []);

  const createWorker = useCallback(() => {
    const worker = new Worker(
      new URL('../workers/pyodide.worker.js', import.meta.url)
    );

    worker.onmessage = e => {
      const { type, text, error: errText } = e.data || {};
      switch (type) {
        case 'loading':
          setStatus('loading');
          break;
        case 'ready':
          setStatus('ready');
          break;
        case 'stdout':
          appendOutput(text);
          break;
        case 'stderr':
          setError(prev => (prev || '') + (text || ''));
          break;
        case 'done':
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          setStatus('success');
          break;
        case 'error':
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          setError(errText ?? 'Unknown error');
          setStatus('error');
          break;
        default:
          break;
      }
    };

    worker.onerror = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setStatus('error');
      setError('Worker crashed unexpectedly');
    };

    return worker;
  }, [appendOutput]);

  const runCode = useCallback(
    code => {
      setOutput('');
      setError(null);

      if (!workerRef.current) {
        workerRef.current = createWorker();
        workerRef.current.postMessage({
          type: 'init',
          version: PYODIDE_VERSION,
        });
      }

      setStatus('running');
      workerRef.current.postMessage({ type: 'run', code });

      timeoutRef.current = setTimeout(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
        setStatus('timeout');
        setError(`Execution timed out after ${timeout / 1000}s`);
        timeoutRef.current = null;
      }, timeout);
    },
    [createWorker, timeout]
  );

  const cancelExecution = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    workerRef.current?.terminate();
    workerRef.current = null;
    setStatus('idle');
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      workerRef.current?.terminate();
    };
  }, []);

  return {
    status,
    output,
    error,
    isRuntimeLoaded: status !== 'idle' && status !== 'loading',
    runCode,
    cancelExecution,
    clearOutput,
  };
}
