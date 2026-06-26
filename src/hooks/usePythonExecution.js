/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Hook for executing Python code client-side via Pyodide in a Web Worker.
 * Lazy-loads the runtime on first run. Supports timeout, stdout/stderr capture.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { getPyodideCdnBase, PYODIDE_VERSION } from '../constants/pyodideCdn';

const DEFAULT_TIMEOUT = 10_000;
const OUTPUT_CAP = 10_000;

export function usePythonExecution({ timeout = DEFAULT_TIMEOUT } = {}) {
  const [status, setStatus] = useState('idle');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [testStatus, setTestStatus] = useState('idle');
  const [testError, setTestError] = useState(null);
  const workerRef = useRef(null);
  const runtimeReadyRef = useRef(false);
  const timeoutRef = useRef(null);
  const testTimeoutRef = useRef(null);

  const appendOutput = useCallback(text => {
    setOutput(prev => {
      const next = prev + text;
      if (next.length > OUTPUT_CAP) {
        return next.slice(0, OUTPUT_CAP) + '\n[Output truncated]';
      }
      return next;
    });
  }, []);

  const disposeWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    runtimeReadyRef.current = false;
  }, []);

  const createWorker = useCallback(() => {
    runtimeReadyRef.current = false;
    const worker = new Worker(
      new URL('../workers/pyodide.worker.js', import.meta.url)
    );

    worker.onmessage = e => {
      const { type, text, error: errText, results } = e.data || {};
      switch (type) {
        case 'loading':
          setStatus('loading');
          break;
        case 'ready':
          runtimeReadyRef.current = true;
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
          clearTimeout(testTimeoutRef.current);
          testTimeoutRef.current = null;
          setError(errText ?? 'Unknown error');
          setStatus('error');
          if (!runtimeReadyRef.current) {
            disposeWorker();
          }
          break;
        case 'test-results': {
          clearTimeout(testTimeoutRef.current);
          testTimeoutRef.current = null;
          const testErr = e.data?.error ?? null;
          setTestError(testErr);
          setTestResults(results ?? []);
          setTestStatus(testErr ? 'error' : 'success');
          break;
        }
        default:
          break;
      }
    };

    worker.onerror = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      clearTimeout(testTimeoutRef.current);
      testTimeoutRef.current = null;
      setStatus('error');
      setError('Worker crashed unexpectedly');
      disposeWorker();
    };

    return worker;
  }, [appendOutput, disposeWorker]);

  const runCode = useCallback(
    code => {
      setOutput('');
      setError(null);

      if (!workerRef.current) {
        workerRef.current = createWorker();
        workerRef.current.postMessage({
          type: 'init',
          version: PYODIDE_VERSION,
          cdnBase: getPyodideCdnBase(),
        });
      }

      setStatus('running');
      workerRef.current.postMessage({ type: 'run', code });

      timeoutRef.current = setTimeout(() => {
        disposeWorker();
        setStatus('timeout');
        setError(`Execution timed out after ${timeout / 1000}s`);
        timeoutRef.current = null;
      }, timeout);
    },
    [createWorker, disposeWorker, timeout]
  );

  const cancelExecution = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (testTimeoutRef.current) {
      clearTimeout(testTimeoutRef.current);
      testTimeoutRef.current = null;
    }
    workerRef.current?.terminate();
    workerRef.current = null;
    runtimeReadyRef.current = false;
    setStatus('idle');
    setTestStatus('idle');
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
  }, []);

  const runTests = useCallback(
    (code, functionName, testCases) => {
      setTestResults([]);
      setTestError(null);
      setTestStatus('running');

      if (!workerRef.current) {
        workerRef.current = createWorker();
        workerRef.current.postMessage({
          type: 'init',
          version: PYODIDE_VERSION,
          cdnBase: getPyodideCdnBase(),
        });
      }

      workerRef.current.postMessage({
        type: 'run-tests',
        code,
        functionName,
        testCases,
      });

      testTimeoutRef.current = setTimeout(() => {
        disposeWorker();
        setTestStatus('error');
        setTestError(`Tests timed out after ${timeout / 1000}s`);
        testTimeoutRef.current = null;
      }, timeout);
    },
    [createWorker, disposeWorker, timeout]
  );

  const clearTestResults = useCallback(() => {
    setTestResults([]);
    setTestStatus('idle');
    setTestError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
      workerRef.current?.terminate();
    };
  }, []);

  return {
    status,
    output,
    error,
    testResults,
    testStatus,
    testError,
    isRuntimeLoaded: status !== 'idle' && status !== 'loading',
    runCode,
    runTests,
    cancelExecution,
    clearOutput,
    clearTestResults,
  };
}
