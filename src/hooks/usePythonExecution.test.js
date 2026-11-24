/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePythonExecution } from './usePythonExecution';

describe('usePythonExecution', () => {
  let mockWorker;

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null,
    };

    vi.stubGlobal(
      'Worker',
      vi.fn(() => mockWorker)
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should return initial idle state', () => {
    const { result } = renderHook(() => usePythonExecution());

    expect(result.current.status).toBe('idle');
    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.testResults).toEqual([]);
    expect(result.current.testStatus).toBe('idle');
    expect(result.current.testError).toBeNull();
    expect(result.current.isRuntimeLoaded).toBe(false);
    expect(typeof result.current.runCode).toBe('function');
    expect(typeof result.current.runTests).toBe('function');
    expect(typeof result.current.cancelExecution).toBe('function');
    expect(typeof result.current.clearOutput).toBe('function');
    expect(typeof result.current.clearTestResults).toBe('function');
  });

  it('should create worker and post init+run on runCode', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    expect(Worker).toHaveBeenCalled();
    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'init', version: expect.any(String) })
    );
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'run',
      code: 'print(1)',
    });
  });

  it('should clear output and error when runCode is called', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should clear output when clearOutput is called', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.clearOutput();
    });

    expect(result.current.output).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should terminate worker on cancelExecution', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    act(() => {
      result.current.cancelExecution();
    });

    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should terminate worker on unmount when worker was created', () => {
    const { result, unmount } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    unmount();

    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should post run-tests message when runTests is called', () => {
    const { result } = renderHook(() => usePythonExecution());
    const testCases = [
      { id: 'tc1', name: 'Test', input: '[1]', expected: '[1]' },
    ];

    act(() => {
      result.current.runTests('code', 'func', testCases);
    });

    expect(Worker).toHaveBeenCalled();
    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'run-tests',
        code: 'code',
        functionName: 'func',
        testCases,
      })
    );
  });

  it('should clear test results when clearTestResults is called', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.clearTestResults();
    });

    expect(result.current.testResults).toEqual([]);
    expect(result.current.testStatus).toBe('idle');
    expect(result.current.testError).toBeNull();
  });

  it('should recreate worker after runtime init failure', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    expect(Worker).toHaveBeenCalledTimes(1);

    act(() => {
      mockWorker.onmessage?.({
        data: {
          type: 'error',
          error: 'Failed to load Python runtime: bad cdn',
        },
      });
    });

    expect(mockWorker.terminate).toHaveBeenCalled();
    expect(result.current.status).toBe('error');

    act(() => {
      result.current.runCode('print(2)');
    });

    expect(Worker).toHaveBeenCalledTimes(2);
  });

  it('should recreate worker after worker crash before runtime is ready', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    act(() => {
      mockWorker.onerror?.(new ErrorEvent('error'));
    });

    expect(mockWorker.terminate).toHaveBeenCalled();
    expect(result.current.status).toBe('error');

    act(() => {
      result.current.runCode('print(2)');
    });

    expect(Worker).toHaveBeenCalledTimes(2);
  });

  it('should fail active test run when worker errors during runTests', () => {
    const { result } = renderHook(() => usePythonExecution());
    const testCases = [
      { id: 'tc1', name: 'Test', input: '[1]', expected: '[1]' },
    ];

    act(() => {
      result.current.runTests('code', 'func', testCases);
    });

    expect(result.current.testStatus).toBe('running');

    act(() => {
      mockWorker.onmessage?.({
        data: { type: 'error', error: 'Python execution failed' },
      });
    });

    expect(result.current.testStatus).toBe('error');
    expect(result.current.testError).toBe('Python execution failed');
    expect(result.current.status).not.toBe('error');
    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should keep status as loading when init-progress heartbeat is received', () => {
    const { result } = renderHook(() => usePythonExecution());

    act(() => {
      result.current.runCode('print(1)');
    });

    expect(result.current.status).toBe('running');

    act(() => {
      mockWorker.onmessage?.({ data: { type: 'loading' } });
    });

    expect(result.current.status).toBe('loading');

    act(() => {
      mockWorker.onmessage?.({ data: { type: 'init-progress' } });
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.isRuntimeLoaded).toBe(false);
  });

  it('should not mark code-run status as error for test-only worker failures', () => {
    const { result } = renderHook(() => usePythonExecution());
    const testCases = [
      { id: 'tc1', name: 'Test', input: '[1]', expected: '[1]' },
    ];

    act(() => {
      result.current.runTests('code', 'func', testCases);
    });

    act(() => {
      mockWorker.onerror?.(new ErrorEvent('error'));
    });

    expect(result.current.testStatus).toBe('error');
    expect(result.current.testError).toBe('Worker crashed unexpectedly');
    expect(result.current.status).not.toBe('error');
    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  describe('block programs (runVisualization)', () => {
    const OPTS = { functionName: 'bubble_sort' };

    it('posts run-viz with the tracer and caps, and warmUp only inits', () => {
      const { result } = renderHook(() => usePythonExecution());

      act(() => result.current.warmUp());
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'init' })
      );

      act(() =>
        result.current.runVisualization('code', [3, 1], {
          functionName: 'binary_search',
          target: 3,
        })
      );
      expect(Worker).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenLastCalledWith({
        type: 'run-viz',
        code: 'code',
        functionName: 'binary_search',
        input: [3, 1],
        target: 3,
        tracer: expect.stringContaining('def __bf_run'),
        maxEvents: 25_000,
        maxTicks: 1_000_000,
      });
      expect(result.current.status).toBe('running');
    });

    it('stores recorded events from viz-steps', () => {
      const { result } = renderHook(() => usePythonExecution());
      act(() => result.current.runVisualization('code', [2, 1], OPTS));

      const events = [{ kind: 'compare', i: 0, j: 1, array: [2, 1] }];
      act(() => {
        mockWorker.onmessage?.({
          data: { type: 'viz-steps', events, finalArray: [1, 2] },
        });
      });

      expect(result.current.vizResult).toEqual({
        events,
        finalArray: [1, 2],
      });
      expect(result.current.status).toBe('success');
    });

    it('reports a loop-limit result as an error status', () => {
      const { result } = renderHook(() => usePythonExecution());
      act(() => result.current.runVisualization('code', [1], OPTS));
      act(() => {
        mockWorker.onmessage?.({
          data: { type: 'viz-steps', errorKind: 'loop-limit' },
        });
      });

      expect(result.current.vizResult).toEqual({ errorKind: 'loop-limit' });
      expect(result.current.status).toBe('error');
    });

    it('turns a timeout on a ready runtime into a loop-limit result', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => usePythonExecution());
      act(() => result.current.warmUp());
      act(() => mockWorker.onmessage?.({ data: { type: 'ready' } }));
      act(() => result.current.runVisualization('code', [1], OPTS));
      act(() => vi.advanceTimersByTime(10_000));

      expect(mockWorker.terminate).toHaveBeenCalled();
      expect(result.current.status).toBe('timeout');
      expect(result.current.vizResult).toMatchObject({
        errorKind: 'loop-limit',
      });
    });

    it('reports a worker crash during a block run as a runtime error', () => {
      const { result } = renderHook(() => usePythonExecution());
      act(() => result.current.runVisualization('code', [1], OPTS));
      act(() => mockWorker.onerror?.());

      expect(result.current.vizResult).toEqual({
        errorKind: 'runtime',
        error: 'Worker crashed unexpectedly',
      });
    });
  });
});
