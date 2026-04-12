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
let pendingRunTests = null;

async function executeRunTests(payload) {
  const { code, functionName, testCases } = payload;
  try {
    pyodide.globals.set('__test_cases_json', JSON.stringify(testCases || []));
    pyodide.globals.set('__test_func_name', functionName);
    await pyodide.runPythonAsync(code);
    const harness = `
import json
__test_results = []
__test_cases = json.loads(__test_cases_json)
__func_name = __test_func_name
__func = globals().get(__func_name)
if __func is None:
    for __tc in __test_cases:
        __test_results.append({"id": __tc.get("id",""), "passed": False, "actual": None, "expected": __tc.get("expected",""), "error": "Function '" + __func_name + "' not found"})
else:
    for __tc in __test_cases:
        try:
            __inp = eval(__tc["input"])
            __exp = eval(__tc["expected"])
            if isinstance(__inp, tuple):
                __actual = __func(*__inp)
            else:
                __actual = __func(__inp)
            __passed = __actual == __exp
            __test_results.append({"id": __tc.get("id",""), "passed": __passed, "actual": repr(__actual) if __actual is not None else "None", "expected": repr(__exp) if __exp is not None else "None", "error": None})
        except Exception as __e:
            __test_results.append({"id": __tc.get("id",""), "passed": False, "actual": None, "expected": __tc.get("expected",""), "error": str(__e)})
__test_results_json = json.dumps(__test_results)
`;
    await pyodide.runPythonAsync(harness);
    const resultsJson = pyodide.globals.get('__test_results_json');
    const results = JSON.parse(resultsJson || '[]');
    self.postMessage({ type: 'test-results', results });
  } catch (err) {
    self.postMessage({
      type: 'test-results',
      error: err.message,
      results: [],
    });
  }
}

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
      if (pendingRunTests) {
        const payload = pendingRunTests;
        pendingRunTests = null;
        await executeRunTests(payload);
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
    return;
  }

  if (type === 'run-tests') {
    const payload = {
      code: e.data?.code,
      functionName: e.data?.functionName,
      testCases: e.data?.testCases || [],
    };
    if (!pyodide) {
      pendingRunTests = payload;
      return;
    }
    await executeRunTests(payload);
  }
};
