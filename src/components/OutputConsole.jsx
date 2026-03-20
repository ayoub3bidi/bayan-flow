/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Terminal-like output panel for Python execution (stdout/stderr).
 */

import { useEffect, useRef } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {string} props.status - 'idle' | 'loading' | 'ready' | 'running' | 'success' | 'error' | 'timeout'
 * @param {string} props.output - Accumulated stdout
 * @param {string|null} props.error - stderr or exception message
 * @param {Function} props.onClear - Clear output handler
 * @param {boolean} [props.isExpanded=true] - Whether the console is expanded
 * @param {Function} [props.onToggleExpand] - Toggle expand handler
 */
function OutputConsole({
  status,
  output,
  error,
  onClear,
  isExpanded = true,
  onToggleExpand,
}) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, error, isExpanded]);

  const hasContent = output || error;
  const isLoading = status === 'loading';
  const isRunning = status === 'running';

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-[#1e1e1e] shrink-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-[#252526] cursor-pointer select-none"
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
            ? t('python_code.output', { defaultValue: 'Output' })
            : t('python_code.output', { defaultValue: 'Output' }) +
              ' (collapsed)'
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">
            {t('python_code.output', { defaultValue: 'Output' })}
          </span>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
              <span
                className="inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"
                aria-hidden
              />
              {t('python_code.loading_runtime', {
                defaultValue: 'Loading Python runtime...',
              })}
            </span>
          )}
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span
                className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"
                aria-hidden
              />
              {t('python_code.running', { defaultValue: 'Running...' })}
            </span>
          )}
          {status === 'success' && hasContent && (
            <span className="text-xs text-green-400">
              {t('python_code.completed', { defaultValue: 'Completed' })}
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red-400">
              {t('python_code.error', { defaultValue: 'Error' })}
            </span>
          )}
          {status === 'timeout' && (
            <span className="text-xs text-amber-400">
              {t('python_code.timeout', { defaultValue: 'Timeout' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasContent && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
              aria-label={t('python_code.clear_output', {
                defaultValue: 'Clear output',
              })}
              title={t('python_code.clear_output', {
                defaultValue: 'Clear output',
              })}
            >
              <Trash2 size={14} />
            </button>
          )}
          {onToggleExpand && (
            <span className="text-gray-400" aria-hidden>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="h-64 overflow-auto font-mono text-sm p-3 whitespace-pre-wrap break-words"
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
    </div>
  );
}

export default OutputConsole;
