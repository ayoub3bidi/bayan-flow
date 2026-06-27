/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Terminal-like output panel for Python execution (stdout/stderr)
 * with optional Test Cases tab for LeetCode-style validation.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trash,
  CaretDown,
  CaretUp,
  Play,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import TestCasesPanel from './TestCasesPanel';

/**
 * @param {Object} props
 * @param {string} props.status - 'idle' | 'loading' | 'ready' | 'running' | 'success' | 'error' | 'timeout'
 * @param {string} props.output - Accumulated stdout
 * @param {string|null} props.error - stderr or exception message
 * @param {Function} props.onClear - Clear output handler
 * @param {boolean} [props.isExpanded=true] - Whether the console is expanded
 * @param {Function} [props.onToggleExpand] - Toggle expand handler
 * @param {string} [props.activeTab='output'] - 'output' | 'testCases'
 * @param {Function} [props.onTabChange] - (tab: 'output' | 'testCases') => void
 * @param {Array} [props.testCases] - Test cases for Test Cases tab
 * @param {Array} [props.testResults] - Test run results
 * @param {string} [props.testStatus] - Test run status
 * @param {string|null} [props.testError] - Test run error
 * @param {Function} [props.onRunTests] - Run tests handler
 * @param {Function} [props.onAddTestCase] - Add custom test case
 * @param {Function} [props.onEditTestCase] - Edit custom test case
 * @param {Function} [props.onDeleteTestCase] - Delete custom test case
 * @param {Function} [props.onClearTestResults] - Clear test results
 * @param {Function} [props.onRun] - Run Python code handler
 * @param {Function} [props.onReset] - Reset code to default handler
 * @param {boolean} [props.isModified=false] - Whether code differs from default
 */
function OutputConsole({
  status,
  output,
  error,
  onClear,
  isExpanded = true,
  onToggleExpand,
  activeTab: controlledActiveTab,
  onTabChange,
  testCases = [],
  testResults = [],
  testStatus = 'idle',
  testError = null,
  onRunTests,
  onAddTestCase,
  onEditTestCase,
  onDeleteTestCase,
  onClearTestResults,
  onRun,
  onReset,
  isModified = false,
}) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [internalTab, setInternalTab] = useState('output');
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const setActiveTab = tab => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  useEffect(() => {
    if (scrollRef.current && isExpanded && activeTab === 'output') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, error, isExpanded, activeTab]);

  const hasContent = output || error;
  const isLoading = status === 'loading';
  const isRunning = status === 'running';
  const hasTestSupport =
    onRunTests && onAddTestCase && onEditTestCase && onDeleteTestCase;

  const runLabel =
    status === 'loading'
      ? t('python_code.loading_runtime', { defaultValue: 'Loading Python...' })
      : status === 'running'
        ? t('python_code.running', { defaultValue: 'Running...' })
        : output || error
          ? t('python_code.rerun', { defaultValue: 'Rerun' })
          : t('python_code.run', { defaultValue: 'Run' });

  const runBusy = isLoading || isRunning;

  const collapsedBannerLabel = t('python_code.output_dock_label', {
    defaultValue: 'Output & Test Cases',
  });

  if (!isExpanded) {
    return (
      <div
        data-testid="output-dock-collapsed"
        className="shrink-0 w-full border-t-2 border-teal-600/30 bg-[#252526] shadow-[0_-4px_12px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center min-h-11">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex-1 flex items-center gap-2 px-3 py-2 min-h-11 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-[#2a2d2e] transition-colors text-left"
            aria-expanded={false}
            aria-label={t('python_code.expand_output', {
              defaultValue: 'Expand output panel',
            })}
          >
            <CaretUp
              size={16}
              weight="bold"
              className="shrink-0 text-gray-400"
            />
            <span className="truncate">{collapsedBannerLabel}</span>
          </button>
          {onRun && (
            <div className="flex items-center gap-1.5 px-2 shrink-0" dir="ltr">
              {isModified && onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded transition-colors"
                  aria-label={t('python_code.reset', { defaultValue: 'Reset' })}
                >
                  <ArrowCounterClockwise size={14} weight="bold" />
                  {t('python_code.reset', { defaultValue: 'Reset' })}
                </button>
              )}
              <button
                type="button"
                onClick={onRun}
                disabled={runBusy}
                className={`flex items-center justify-center text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/60 disabled:cursor-not-allowed disabled:opacity-90 rounded transition-colors ${
                  runBusy
                    ? 'w-8 h-8'
                    : 'gap-1.5 px-2.5 py-1 text-xs font-medium min-w-[4.5rem]'
                }`}
                aria-label={runLabel}
              >
                {runBusy ? (
                  isLoading ? (
                    <span
                      className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="inline-flex gap-0.5 items-center"
                      aria-hidden
                    >
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1 h-1 rounded-full bg-white animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                  )
                ) : (
                  <>
                    <Play size={14} weight="bold" />
                    {runLabel}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col border-t border-gray-200 dark:border-gray-700 bg-[#1e1e1e] w-full overflow-hidden ${
        isExpanded ? 'min-h-0 flex-1' : 'shrink-0'
      }`}
    >
      {/* Header with tabs */}
      <div className="flex items-center shrink-0 bg-[#252526] min-h-11">
        <div className="flex items-center gap-1 px-1 py-1 border-b border-transparent shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('output')}
            className={`px-3 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === 'output'
                ? 'bg-[#1e1e1e] text-gray-200'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t('python_code.output', { defaultValue: 'Output' })}
          </button>
          {hasTestSupport && (
            <button
              type="button"
              onClick={() => setActiveTab('testCases')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t transition-colors ${
                activeTab === 'testCases'
                  ? 'bg-[#1e1e1e] text-gray-200'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t('python_code.test_cases', { defaultValue: 'Test Cases' })}
              <span
                className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-semibold rounded-full border border-amber-500/20 whitespace-nowrap"
                title={t('settings.experimental', {
                  defaultValue: 'Experimental',
                })}
              >
                {t('settings.experimental', { defaultValue: 'Experimental' })}
              </span>
            </button>
          )}
        </div>
        {onRun && (
          <div className="flex items-center gap-1.5 px-2 shrink-0" dir="ltr">
            {isModified && onReset && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onReset();
                }}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded transition-colors"
                aria-label={t('python_code.reset', { defaultValue: 'Reset' })}
              >
                <ArrowCounterClockwise size={14} weight="bold" />
                {t('python_code.reset', { defaultValue: 'Reset' })}
              </button>
            )}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRun();
              }}
              disabled={runBusy}
              className={`flex items-center justify-center text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/60 disabled:cursor-not-allowed disabled:opacity-90 rounded transition-colors ${
                runBusy
                  ? 'w-8 h-8'
                  : 'gap-1.5 px-2.5 py-1 text-xs font-medium min-w-[4.5rem]'
              }`}
              aria-label={runLabel}
            >
              {runBusy ? (
                isLoading ? (
                  <span
                    className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden
                  />
                ) : (
                  <span
                    className="inline-flex gap-0.5 items-center"
                    aria-hidden
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full bg-white animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                )
              ) : (
                <>
                  <Play size={14} weight="bold" />
                  {runLabel}
                </>
              )}
            </button>
          </div>
        )}
        <div
          className="flex-1 flex items-center justify-end gap-2 px-3 py-2 cursor-pointer min-w-0"
          onClick={onToggleExpand}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleExpand?.();
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? t('python_code.collapse_output', {
                  defaultValue: 'Collapse output panel',
                })
              : t('python_code.expand_output', {
                  defaultValue: 'Expand output panel',
                })
          }
        >
          {activeTab === 'output' && (
            <>
              {isRunning && (
                <span className="flex items-center gap-1.5 text-xs text-green-400 shrink-0">
                  <span
                    className="inline-flex gap-0.5 items-center"
                    aria-hidden
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full bg-green-400 animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                  <span className="sr-only">
                    {t('python_code.running', { defaultValue: 'Running...' })}
                  </span>
                </span>
              )}
              {status === 'success' && hasContent && (
                <span className="text-xs text-green-400 shrink-0">
                  {t('python_code.completed', { defaultValue: 'Completed' })}
                </span>
              )}
              {status === 'error' && (
                <span className="text-xs text-red-400 shrink-0">
                  {t('python_code.error', { defaultValue: 'Error' })}
                </span>
              )}
              {status === 'timeout' && (
                <span className="text-xs text-amber-400 shrink-0">
                  {t('python_code.timeout', { defaultValue: 'Timeout' })}
                </span>
              )}
              {hasContent && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors shrink-0"
                  aria-label={t('python_code.clear_output', {
                    defaultValue: 'Clear output',
                  })}
                  title={t('python_code.clear_output', {
                    defaultValue: 'Clear output',
                  })}
                >
                  <Trash size={14} weight="bold" />
                </button>
              )}
            </>
          )}
          {activeTab === 'testCases' &&
            (testStatus === 'success' || testStatus === 'error') &&
            testResults.length > 0 &&
            onClearTestResults && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onClearTestResults();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors shrink-0"
                aria-label={t('python_code.clear_output', {
                  defaultValue: 'Clear',
                })}
                title={t('python_code.clear_output', {
                  defaultValue: 'Clear',
                })}
              >
                <Trash size={14} weight="bold" />
              </button>
            )}
          {onToggleExpand && (
            <span className="text-gray-400 shrink-0" aria-hidden>
              {isExpanded ? (
                <CaretDown size={16} weight="bold" />
              ) : (
                <CaretUp size={16} weight="bold" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Indeterminate progress bar shown during Pyodide initialization */}
      {isLoading && (
        <div className="h-1 w-full overflow-hidden bg-transparent shrink-0">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '30%' }}
          />
        </div>
      )}

      {/* Content */}
      <>
        {activeTab === 'output' && (
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-auto font-mono text-sm p-3 whitespace-pre-wrap break-words"
          >
            {!hasContent && !isLoading && (
              <div className="text-gray-500">
                {t('python_code.output_placeholder', {
                  defaultValue: 'Run the code to see output here.',
                })}
              </div>
            )}
            {output && <div className="text-[#d4d4d4] mb-2">{output}</div>}
            {error && <div className="text-red-400">{error}</div>}
          </div>
        )}
        {activeTab === 'testCases' && hasTestSupport && (
          <TestCasesPanel
            testCases={testCases}
            testResults={testResults}
            testStatus={testStatus}
            testError={testError}
            onRunTests={onRunTests}
            onAddTestCase={onAddTestCase}
            onEditTestCase={onEditTestCase}
            onDeleteTestCase={onDeleteTestCase}
            isRuntimeLoading={status === 'loading'}
          />
        )}
      </>
    </div>
  );
}

export default OutputConsole;
