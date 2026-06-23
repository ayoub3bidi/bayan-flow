/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import TestCasesPanel from './TestCasesPanel';
import i18n from '../i18n';

const customTestCase = {
  id: 'tc1',
  name: 'Example',
  input: '[1]',
  expected: '1',
  isCustom: true,
};

function getBaseProps(overrides = {}) {
  return {
    testCases: [customTestCase],
    testResults: [],
    testStatus: 'idle',
    testError: null,
    onRunTests: vi.fn(),
    onAddTestCase: vi.fn(),
    onEditTestCase: vi.fn(),
    onDeleteTestCase: vi.fn(),
    ...overrides,
  };
}

describe('TestCasesPanel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the run tests button with a play icon', () => {
    renderWithI18n(<TestCasesPanel {...getBaseProps()} />);

    const runButton = screen.getByRole('button', { name: 'Run tests' });
    expect(runButton).toBeInTheDocument();
    expect(runButton.querySelector('svg')).toBeTruthy();
  });

  it('expands a collapsed test case row when clicked', () => {
    renderWithI18n(<TestCasesPanel {...getBaseProps()} />);

    const row = screen.getByRole('button', { name: /Example/i });
    fireEvent.click(row);

    expect(screen.getByText('Input:')).toBeInTheDocument();
    expect(screen.getByText('[1]')).toBeInTheDocument();
  });

  it('renders edit and delete icons for custom test cases', () => {
    renderWithI18n(<TestCasesPanel {...getBaseProps()} />);

    expect(
      screen.getByRole('button', { name: 'Edit test case' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete test case' })
    ).toBeInTheDocument();
  });

  it('shows the add test case button with a plus icon', () => {
    renderWithI18n(<TestCasesPanel {...getBaseProps()} />);

    const addButton = screen.getByRole('button', { name: 'Add test case' });
    expect(addButton.querySelector('svg')).toBeTruthy();
  });
});
