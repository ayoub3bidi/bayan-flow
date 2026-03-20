/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPythonCode, getAlgorithmDisplayName } from '../algorithms/python';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import { usePythonExecution } from '../hooks/usePythonExecution';
import OutputConsole from './OutputConsole';

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

  const [code, setCode] = useState(pythonCode);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const isModified = code !== pythonCode;

  const { status, output, error, runCode, cancelExecution, clearOutput } =
    usePythonExecution({ timeout: 10_000 });

  useEffect(() => {
    setCode(pythonCode);
  }, [pythonCode]);

  useEffect(() => {
    clearOutput();
    return () => cancelExecution();
  }, [algorithm, cancelExecution, clearOutput]);

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

  if (!pythonCode) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]"
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
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  {isMobile && (
                    <h2 className="text-lg font-semibold text-text-primary">
                      {t('python_code.title')}
                    </h2>
                  )}
                  <button
                    onClick={onClose}
                    className={`p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors ${!isMobile ? (isRTL ? 'mr-auto' : 'ml-auto') : ''}`}
                    aria-label={t('python_code.close')}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center text-text-secondary">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

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
            <div className="flex flex-col h-full">
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
                    <X size={20} />
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-2 p-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={status === 'loading' || status === 'running'}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-90 rounded-lg transition-colors min-w-[5.5rem] justify-center"
                  aria-label={
                    output || error
                      ? t('python_code.rerun', { defaultValue: 'Rerun' })
                      : t('python_code.run', { defaultValue: 'Run' })
                  }
                >
                  {status === 'loading' || status === 'running' ? (
                    <span
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden
                    />
                  ) : (
                    <Play size={16} />
                  )}
                  {status === 'loading' || status === 'running'
                    ? t('python_code.running', { defaultValue: 'Running...' })
                    : output || error
                      ? t('python_code.rerun', { defaultValue: 'Rerun' })
                      : t('python_code.run', { defaultValue: 'Run' })}
                </button>
                {isModified && (
                  <button
                    type="button"
                    onClick={() => setCode(pythonCode)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                    aria-label={t('python_code.reset', {
                      defaultValue: 'Reset',
                    })}
                  >
                    <RotateCcw size={16} />
                    {t('python_code.reset', { defaultValue: 'Reset' })}
                  </button>
                )}
              </div>

              {/* Code Editor + Output */}
              <div
                className="flex-1 min-h-0 flex flex-col overflow-hidden"
                dir="ltr"
              >
                <div className="flex-1 min-h-0 overflow-hidden">
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
                <OutputConsole
                  status={status}
                  output={output}
                  error={error}
                  onClear={clearOutput}
                  isExpanded={isOutputExpanded}
                  onToggleExpand={() => setIsOutputExpanded(prev => !prev)}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PythonCodePanel;
