/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * LeetCode-style test case validation panel. Shows pass/fail per test case,
 * supports adding/editing/deleting custom test cases.
 */

import { useState } from 'react';
import {
  Play,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {Array<{id: string, name: string, input: string, expected: string, isCustom?: boolean}>} props.testCases
 * @param {Array<{id: string, passed: boolean, actual?: string, expected?: string, error?: string}>} props.testResults
 * @param {string} props.testStatus - 'idle' | 'running' | 'success' | 'error'
 * @param {string|null} props.testError - Global error message
 * @param {Function} props.onRunTests
 * @param {Function} props.onAddTestCase - (name, input, expected) => void
 * @param {Function} props.onEditTestCase - (id, name, input, expected) => void
 * @param {Function} props.onDeleteTestCase - (id) => void
 * @param {boolean} [props.isRuntimeLoading] - Whether Pyodide is still loading
 */
function TestCasesPanel({
  testCases,
  testResults,
  testStatus,
  testError,
  onRunTests,
  onAddTestCase,
  onEditTestCase,
  onDeleteTestCase,
  isRuntimeLoading = false,
}) {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addForm, setAddForm] = useState({ name: '', input: '', expected: '' });
  const [editForm, setEditForm] = useState({
    name: '',
    input: '',
    expected: '',
  });

  const getResult = id => testResults.find(r => r.id === id);
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  const hasRun = testStatus === 'success' || testStatus === 'error';
  const isRunning = testStatus === 'running';

  const toggleExpand = id => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSubmit = e => {
    e.preventDefault();
    const { name, input, expected } = addForm;
    if (name.trim() && input.trim() && expected.trim()) {
      onAddTestCase(name.trim(), input.trim(), expected.trim());
      setAddForm({ name: '', input: '', expected: '' });
      setIsAdding(false);
    }
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    const { name, input, expected } = editForm;
    if (editingId && name.trim() && input.trim() && expected.trim()) {
      onEditTestCase(editingId, name.trim(), input.trim(), expected.trim());
      setEditingId(null);
    }
  };

  const startEdit = tc => {
    setEditingId(tc.id);
    setEditForm({ name: tc.name, input: tc.input, expected: tc.expected });
  };

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden bg-[#1e1e1e]">
      {/* Summary bar + Run button */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#252526] shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          {hasRun && totalCount > 0 && (
            <span
              className={`text-sm font-medium ${
                passedCount === totalCount ? 'text-green-400' : 'text-amber-400'
              }`}
            >
              {t('python_code.tests_passed', {
                defaultValue: '{{passed}}/{{total}} passed',
                passed: passedCount,
                total: totalCount,
              })}
            </span>
          )}
          {testError && (
            <span className="text-sm text-red-400 truncate" title={testError}>
              {testError}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRunTests}
          disabled={isRuntimeLoading || isRunning || testCases.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors shrink-0"
          aria-label={t('python_code.run_tests', { defaultValue: 'Run tests' })}
        >
          {isRunning ? (
            <span
              className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              aria-hidden
            />
          ) : (
            <Play size={14} />
          )}
          {t('python_code.run_tests', { defaultValue: 'Run tests' })}
        </button>
      </div>

      {/* Test case list */}
      <div className="min-h-0 flex-1 overflow-auto p-2 space-y-1">
        {testCases.length === 0 && (
          <div className="text-gray-500 text-sm p-3">
            {t('python_code.no_test_cases', {
              defaultValue: 'No test cases for this algorithm.',
            })}
          </div>
        )}
        {testCases.map(tc => {
          const result = getResult(tc.id);
          const isExpanded = expandedIds.has(tc.id) || !!result;
          const isCustom = tc.isCustom === true;

          return (
            <div
              key={tc.id}
              className="rounded-lg border border-gray-700 bg-[#252526] overflow-hidden"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => toggleExpand(tc.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(tc.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span className="text-gray-400 shrink-0">
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </span>
                {result && (
                  <span
                    className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs ${
                      result.passed
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {result.passed ? '✓' : '✗'}
                  </span>
                )}
                <span className="text-sm text-gray-300 truncate flex-1">
                  {tc.name}
                </span>
                {isCustom && (
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => startEdit(tc)}
                      className="p-1 text-gray-400 hover:text-gray-200 rounded"
                      aria-label={t('python_code.edit_test_case', {
                        defaultValue: 'Edit test case',
                      })}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTestCase(tc.id)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded"
                      aria-label={t('python_code.delete_test_case', {
                        defaultValue: 'Delete test case',
                      })}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {editingId === tc.id && (
                <form
                  onSubmit={handleEditSubmit}
                  className="p-3 border-t border-gray-700 space-y-2"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e =>
                      setEditForm(f => ({ ...f, name: e.target.value }))
                    }
                    placeholder={t('python_code.test_case_name', {
                      defaultValue: 'Test case name',
                    })}
                    className="w-full px-2 py-1.5 text-sm bg-[#1e1e1e] border border-gray-600 rounded text-gray-200 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    value={editForm.input}
                    onChange={e =>
                      setEditForm(f => ({ ...f, input: e.target.value }))
                    }
                    placeholder={t('python_code.test_input', {
                      defaultValue: 'Input (Python expression)',
                    })}
                    className="w-full px-2 py-1.5 text-sm font-mono bg-[#1e1e1e] border border-gray-600 rounded text-gray-200 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    value={editForm.expected}
                    onChange={e =>
                      setEditForm(f => ({ ...f, expected: e.target.value }))
                    }
                    placeholder={t('python_code.test_expected', {
                      defaultValue: 'Expected output (Python expression)',
                    })}
                    className="w-full px-2 py-1.5 text-sm font-mono bg-[#1e1e1e] border border-gray-600 rounded text-gray-200 placeholder-gray-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t('common.save', { defaultValue: 'Save' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-sm text-gray-400 hover:text-gray-200"
                    >
                      {t('python_code.cancel', { defaultValue: 'Cancel' })}
                    </button>
                  </div>
                </form>
              )}

              {isExpanded && editingId !== tc.id && (
                <div
                  className="px-3 pb-3 pt-1 border-t border-gray-700 space-y-2 font-mono text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  <div>
                    <span className="text-gray-500">
                      {t('python_code.input_label', {
                        defaultValue: 'Input:',
                      })}{' '}
                    </span>
                    <pre className="text-gray-300 break-all whitespace-pre-wrap mt-0.5">
                      {tc.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {t('python_code.expected_label', {
                        defaultValue: 'Expected:',
                      })}{' '}
                    </span>
                    <pre className="text-gray-300 break-all whitespace-pre-wrap mt-0.5">
                      {tc.expected}
                    </pre>
                  </div>
                  {result && (
                    <>
                      {result.error && (
                        <div>
                          <span className="text-red-400">
                            {t('python_code.error_label', {
                              defaultValue: 'Error:',
                            })}{' '}
                          </span>
                          <pre className="text-red-400 break-all whitespace-pre-wrap mt-0.5">
                            {result.error}
                          </pre>
                        </div>
                      )}
                      {!result.passed && result.actual != null && (
                        <div>
                          <span className="text-amber-400">
                            {t('python_code.actual_label', {
                              defaultValue: 'Actual:',
                            })}{' '}
                          </span>
                          <pre className="text-amber-400 break-all whitespace-pre-wrap mt-0.5">
                            {result.actual}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add test case form */}
        {isAdding ? (
          <form
            onSubmit={handleAddSubmit}
            className="rounded-lg border border-gray-700 bg-[#252526] p-3 space-y-2"
          >
            <input
              type="text"
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('python_code.test_case_name', {
                defaultValue: 'Test case name',
              })}
              className="w-full px-2 py-1.5 text-sm bg-[#1e1e1e] border border-gray-600 rounded text-gray-200 placeholder-gray-500"
            />
            <input
              type="text"
              value={addForm.input}
              onChange={e => setAddForm(f => ({ ...f, input: e.target.value }))}
              placeholder={t('python_code.test_input', {
                defaultValue: 'Input (Python expression)',
              })}
              className="w-full px-2 py-1.5 text-sm font-mono bg-[#1e1e1e] border border-gray-600 rounded text-gray-200 placeholder-gray-500"
            />
            <input
              type="text"
              value={addForm.expected}
              onChange={e =>
                setAddForm(f => ({ ...f, expected: e.target.value }))
              }
              placeholder={t('python_code.test_expected', {
                defaultValue: 'Expected output (Python expression)',
              })}
              className="w-full px-2 py-1.5 text-sm font-mono bg-[#1e1e1e] border border-gray-600 rounded text-gray-200 placeholder-gray-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('python_code.add_test_case', {
                  defaultValue: 'Add test case',
                })}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setAddForm({ name: '', input: '', expected: '' });
                }}
                className="px-2 py-1 text-sm text-gray-400 hover:text-gray-200"
              >
                {t('python_code.cancel', { defaultValue: 'Cancel' })}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg border border-dashed border-gray-600 transition-colors"
          >
            <Plus size={14} />
            {t('python_code.add_test_case', {
              defaultValue: 'Add test case',
            })}
          </button>
        )}
      </div>
    </div>
  );
}

export default TestCasesPanel;
