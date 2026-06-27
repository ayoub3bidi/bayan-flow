/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
  getPythonCode,
  getAlgorithmDisplayName,
  getTestCases,
} from '../algorithms/python';
import { getPseudocodeForLocale } from '../algorithms/pseudocode';
import { highlightPseudocodeToHtml } from '../utils/pseudocodeHighlight';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import { usePythonExecution } from '../hooks/usePythonExecution';
import OutputConsole from './OutputConsole';

const STORAGE_KEY_OUTPUT_PERCENT = 'python-panel-output-percent';
const getCustomTestsStorageKey = algo => `python-test-cases-${algo}`;
const DEFAULT_OUTPUT_PERCENT = 35;
const MIN_OUTPUT_PERCENT = 15;
const MAX_OUTPUT_PERCENT = 70;

function getStoredOutputPercent() {
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY_OUTPUT_PERCENT), 10);
    if (
      Number.isFinite(v) &&
      v >= MIN_OUTPUT_PERCENT &&
      v <= MAX_OUTPUT_PERCENT
    ) {
      return v;
    }
  } catch {
    // localStorage not available
  }
  return DEFAULT_OUTPUT_PERCENT;
}

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.algorithm - Current algorithm name
 */
function PythonCodePanel({ isOpen, onClose, algorithm }) {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const { isDark } = useTheme();
  const isRTL = i18n.dir() === 'rtl';

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = event => {
        if (event.key === 'Escape') {
          onClose();
        } else if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const pythonCode = getPythonCode(algorithm);
  const displayName = getAlgorithmDisplayName(algorithm);
  const pseudocodeText = useMemo(
    () =>
      getPseudocodeForLocale(
        algorithm,
        i18n.resolvedLanguage ?? i18n.language
      ) ?? t('python_code.noPseudocode'),
    [algorithm, i18n.resolvedLanguage, i18n.language, t]
  );

  const pseudocodeHtml = useMemo(
    () => highlightPseudocodeToHtml(pseudocodeText),
    [pseudocodeText]
  );

  const [activeCodeTab, setActiveCodeTab] = useState(
    /** @type {'python' | 'pseudocode'} */ ('python')
  );
  const [code, setCode] = useState(pythonCode);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [outputHeightPercent, setOutputHeightPercent] = useState(
    getStoredOutputPercent
  );
  const [isResizing, setIsResizing] = useState(false);
  const resizeContainerRef = useRef(null);
  const lastPercentRef = useRef(outputHeightPercent);
  lastPercentRef.current = outputHeightPercent;
  const isModified = code !== pythonCode;

  const handleResizeStart = useCallback(e => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const container = resizeContainerRef.current;
    if (!container) return;

    const handleMove = e => {
      const rect = container.getBoundingClientRect();
      const totalHeight = rect.height;
      const handleOffset = rect.top;
      const mouseY = e.clientY;
      const yFromTop = mouseY - handleOffset;
      if (totalHeight <= 0) return;
      let percent = (1 - yFromTop / totalHeight) * 100;
      percent = Math.max(
        MIN_OUTPUT_PERCENT,
        Math.min(MAX_OUTPUT_PERCENT, percent)
      );
      lastPercentRef.current = Math.round(percent);
      setOutputHeightPercent(lastPercentRef.current);
    };

    const handleUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem(
          STORAGE_KEY_OUTPUT_PERCENT,
          String(lastPercentRef.current)
        );
      } catch {
        // localStorage not available
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const {
    status,
    output,
    error,
    runCode,
    runTests,
    cancelExecution,
    clearOutput,
    clearTestResults,
    testResults,
    testStatus,
    testError,
  } = usePythonExecution();

  const predefined = getTestCases(algorithm);
  const [customTests, setCustomTests] = useState(() => {
    try {
      const key = getCustomTestsStorageKey(algorithm);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      const key = getCustomTestsStorageKey(algorithm);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCustomTests(Array.isArray(parsed) ? parsed : []);
      } else {
        setCustomTests([]);
      }
    } catch {
      setCustomTests([]);
    }
  }, [algorithm]);

  const testCases = useMemo(
    () => [
      ...(predefined?.testCases?.map(tc => ({ ...tc, isCustom: false })) ?? []),
      ...customTests.map(tc => ({ ...tc, isCustom: true })),
    ],
    [predefined?.testCases, customTests]
  );

  const handleAddTestCase = useCallback(
    (name, input, expected) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newTest = { id, name, input, expected };
      setCustomTests(prev => {
        const next = [...prev, newTest];
        try {
          localStorage.setItem(
            getCustomTestsStorageKey(algorithm),
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [algorithm]
  );

  const handleEditTestCase = useCallback(
    (id, name, input, expected) => {
      setCustomTests(prev => {
        const next = prev.map(tc =>
          tc.id === id ? { ...tc, name, input, expected } : tc
        );
        try {
          localStorage.setItem(
            getCustomTestsStorageKey(algorithm),
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [algorithm]
  );

  const handleDeleteTestCase = useCallback(
    id => {
      setCustomTests(prev => {
        const next = prev.filter(tc => tc.id !== id);
        try {
          localStorage.setItem(
            getCustomTestsStorageKey(algorithm),
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [algorithm]
  );

  const handleRunTests = useCallback(() => {
    if (!predefined?.functionName || testCases.length === 0) return;
    runTests(code, predefined.functionName, testCases);
    setIsOutputExpanded(true);
  }, [code, predefined, testCases, runTests]);

  useEffect(() => {
    setCode(pythonCode);
  }, [pythonCode]);

  useEffect(() => {
    setActiveCodeTab('python');
  }, [algorithm]);

  useEffect(() => {
    clearOutput();
    clearTestResults();
    return () => cancelExecution();
  }, [algorithm, cancelExecution, clearOutput, clearTestResults]);

  const handleRun = useCallback(() => {
    if (status === 'running') return;
    runCode(code);
    setIsOutputExpanded(true);
  }, [code, runCode, status]);

  const runHandlerRef = useRef(handleRun);
  runHandlerRef.current = handleRun;

  // Update Monaco editor theme when theme changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const newTheme = isDark ? 'vs-dark' : 'vs-light';
      monacoRef.current.editor.setTheme(newTheme);
    }
  }, [isDark]);

  // Panel variants for desktop (side panel)
  const panelVariants = {
    hidden: {
      x: isRTL ? '-100%' : '100%',
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: isRTL ? '-100%' : '100%',
      opacity: 0,
    },
  };

  // Mobile variants (bottom sheet)
  const mobileVariants = {
    hidden: {
      y: '100%',
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: '100%',
      opacity: 0,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]"
            style={!isMobile ? { top: '56px' } : {}}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={`
              fixed z-[60] bg-surface shadow-xl
              ${isMobile ? 'inset-0' : `${isRTL ? 'left-0' : 'right-0'} w-full max-w-2xl h-full`}
            `}
            style={!isMobile ? { top: '56px' } : {}}
            variants={isMobile ? mobileVariants : panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={`flex flex-col h-full ${!isMobile ? 'pt-2' : ''}`}>
              {/* Header - show on mobile */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t('python_code.title')}: {displayName}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors"
                    aria-label={t('python_code.close')}
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>
              )}

              {/* Pseudocode vs Python (pseudocode first) */}
              <div
                className="mx-2 shrink-0 flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated"
                role="tablist"
                aria-label={t('python_code.title')}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCodeTab === 'pseudocode'}
                  onClick={() => setActiveCodeTab('pseudocode')}
                  className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 touch-manipulation ${
                    activeCodeTab === 'pseudocode'
                      ? 'bg-theme-primary-consistent text-white shadow-md'
                      : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
                  }`}
                >
                  {t('python_code.tabPseudocode')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCodeTab === 'python'}
                  onClick={() => setActiveCodeTab('python')}
                  className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 touch-manipulation ${
                    activeCodeTab === 'python'
                      ? 'bg-theme-primary-consistent text-white shadow-md'
                      : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
                  }`}
                >
                  {t('python_code.tabPython')}
                </button>
              </div>

              {activeCodeTab === 'pseudocode' ? (
                <div className="flex-1 min-h-0 flex flex-col p-2">
                  <pre
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="pseudocode-view flex-1 min-h-0 overflow-auto rounded-lg p-4 leading-relaxed shadow-inner"
                  >
                    <code
                      className="block w-full font-mono text-sm [word-spacing:normal]"
                      dangerouslySetInnerHTML={{ __html: pseudocodeHtml }}
                    />
                  </pre>
                </div>
              ) : !pythonCode ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-0">
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={`self-end mb-2 p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors ${isRTL ? 'ml-auto' : 'mr-auto'}`}
                      aria-label={t('python_code.close')}
                    >
                      <X size={20} weight="bold" />
                    </button>
                  )}
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary">
                    <div className="text-6xl mb-4">🐍</div>
                    <h3 className="text-lg font-medium mb-2 text-text-primary">
                      {t('python_code.not_available') ||
                        'No Python Implementation Available'}
                    </h3>
                    <p className="text-sm">
                      {t('python_code.not_available_desc', {
                        algorithm: displayName,
                      }) ||
                        `Python code for ${displayName} is not yet available.`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Toolbar — LTR so Run stays visually right in RTL app */}
                  <div
                    className="flex items-center justify-end gap-2 p-2 shrink-0"
                    dir="ltr"
                  >
                    {isModified && (
                      <button
                        type="button"
                        onClick={() => setCode(pythonCode)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                        aria-label={t('python_code.reset', {
                          defaultValue: 'Reset',
                        })}
                      >
                        <ArrowCounterClockwise size={16} weight="bold" />
                        {t('python_code.reset', { defaultValue: 'Reset' })}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRun}
                      disabled={status === 'loading' || status === 'running'}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-90 rounded-lg transition-colors min-w-[5.5rem] justify-center"
                      aria-label={
                        status === 'loading'
                          ? t('python_code.loading_runtime', {
                              defaultValue: 'Loading Python...',
                            })
                          : status === 'running'
                            ? t('python_code.running', {
                                defaultValue: 'Running...',
                              })
                            : output || error
                              ? t('python_code.rerun', {
                                  defaultValue: 'Rerun',
                                })
                              : t('python_code.run', { defaultValue: 'Run' })
                      }
                    >
                      {status === 'loading' || status === 'running' ? (
                        <span
                          className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                          aria-hidden
                        />
                      ) : (
                        <Play size={16} weight="bold" />
                      )}
                      {status === 'loading'
                        ? t('python_code.loading_runtime', {
                            defaultValue: 'Loading Python...',
                          })
                        : status === 'running'
                          ? t('python_code.running', {
                              defaultValue: 'Running...',
                            })
                          : output || error
                            ? t('python_code.rerun', { defaultValue: 'Rerun' })
                            : t('python_code.run', { defaultValue: 'Run' })}
                    </button>
                  </div>

                  {/* Code Editor + Output (resizable on desktop) */}
                  <div
                    ref={resizeContainerRef}
                    className="flex-1 min-h-0 flex flex-col overflow-hidden relative"
                    dir="ltr"
                  >
                    <div
                      className={`min-h-0 overflow-hidden ${isMobile ? 'touch-pan-y' : ''}`}
                      style={{
                        flex:
                          isMobile || !isOutputExpanded
                            ? '1 1 0'
                            : `0 0 calc(${100 - outputHeightPercent}% - 2px)`,
                        minHeight: isMobile ? 100 : 80,
                      }}
                    >
                      <Editor
                        height="100%"
                        defaultLanguage="python"
                        value={code}
                        onChange={value => setCode(value ?? '')}
                        theme={isDark ? 'vs-dark' : 'vs-light'}
                        onMount={(editor, monaco) => {
                          editorRef.current = editor;
                          monacoRef.current = monaco;
                          editor.addAction({
                            id: 'run-python',
                            label: 'Run Python',
                            keybindings: [
                              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                            ],
                            run: () => runHandlerRef.current?.(),
                          });
                          if (isMobile) {
                            const container = editor.getContainerDomNode?.();
                            if (container) {
                              container.style.touchAction = 'pan-y';
                              const scrollable =
                                container.querySelector(
                                  '.monaco-scrollable-element'
                                ) ??
                                container.querySelector(
                                  '[class*="scrollable"]'
                                );
                              if (scrollable) {
                                scrollable.style.webkitOverflowScrolling =
                                  'touch';
                              }
                            }
                          }
                        }}
                        options={{
                          readOnly: false,
                          minimap: { enabled: !isMobile },
                          scrollBeyondLastLine: false,
                          fontSize: isMobile ? 12 : 14,
                          lineNumbers: 'on',
                          folding: true,
                          wordWrap: 'on',
                          automaticLayout: true,
                          padding: { top: 16, bottom: 16 },
                          scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                          },
                        }}
                        loading={
                          <div className="flex items-center justify-center h-full bg-surface">
                            <div className="text-text-secondary">
                              {t('python_code.loading') || 'Loading editor...'}
                            </div>
                          </div>
                        }
                      />
                    </div>
                    {!isMobile && isOutputExpanded && (
                      <div
                        role="separator"
                        aria-orientation="horizontal"
                        aria-valuenow={outputHeightPercent}
                        aria-valuemin={MIN_OUTPUT_PERCENT}
                        aria-valuemax={MAX_OUTPUT_PERCENT}
                        aria-label={t('python_code.resize_output', {
                          defaultValue: 'Resize output panel',
                        })}
                        onMouseDown={handleResizeStart}
                        className={`shrink-0 h-1 flex items-center justify-center cursor-row-resize hover:bg-blue-500/30 active:bg-blue-500/50 transition-colors group ${
                          isResizing
                            ? 'bg-blue-500/50'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <div className="w-12 h-0.5 rounded-full bg-gray-400 group-hover:bg-blue-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
                      </div>
                    )}
                    <div
                      className="min-h-0 overflow-hidden flex flex-col"
                      style={{
                        flex:
                          isMobile || !isOutputExpanded
                            ? '0 0 auto'
                            : `0 0 calc(${outputHeightPercent}% - 2px)`,
                        minHeight:
                          isOutputExpanded && !isMobile ? 80 : undefined,
                      }}
                    >
                      <OutputConsole
                        status={status}
                        output={output}
                        error={error}
                        onClear={clearOutput}
                        isExpanded={isOutputExpanded}
                        onToggleExpand={() =>
                          setIsOutputExpanded(prev => !prev)
                        }
                        testCases={testCases}
                        testResults={testResults}
                        testStatus={testStatus}
                        testError={testError}
                        onRunTests={handleRunTests}
                        onAddTestCase={handleAddTestCase}
                        onEditTestCase={handleEditTestCase}
                        onDeleteTestCase={handleDeleteTestCase}
                        onClearTestResults={clearTestResults}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PythonCodePanel;
