/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArrayBarChart, {
  BAR_LABEL_LIMIT,
  BAR_LABEL_LIMIT_COMPACT,
} from './ArrayBarChart';
import { STATE_COLORS } from '../constants';

const bars = () => screen.getAllByTestId('array-bar');
const fill = bar => bar.firstElementChild;

describe('ArrayBarChart', () => {
  it('renders one bar per value, scaled to maxValue, colored by state', () => {
    render(
      <ArrayBarChart
        array={[50, 100, 25]}
        states={['default', 'comparing', 'sorted']}
        maxValue={100}
      />
    );

    expect(bars()).toHaveLength(3);
    expect(bars().map(b => fill(b).style.height)).toEqual([
      '50%',
      '100%',
      '25%',
    ]);
    expect(fill(bars()[1]).style.backgroundColor).toBe(
      'rgb(251, 191, 36)' // STATE_COLORS.comparing
    );
    expect(STATE_COLORS.comparing).toBe('#fbbf24');
  });

  it('keeps tiny values visible with a minimum height', () => {
    render(<ArrayBarChart array={[1, 500]} states={[]} maxValue={500} />);
    expect(fill(bars()[0]).style.height).toBe('4%');
  });

  it('falls back to the array max when no maxValue is given', () => {
    render(<ArrayBarChart array={[10, 40]} states={[]} />);
    expect(fill(bars()[0]).style.height).toBe('25%');
  });

  it('always lays out left-to-right, even in RTL pages', () => {
    render(<ArrayBarChart array={[1, 2]} states={[]} />);
    expect(screen.getByTestId('array-bar-chart')).toHaveAttribute('dir', 'ltr');
  });

  it('shows value labels only up to the size limit', () => {
    const small = Array.from({ length: BAR_LABEL_LIMIT }, (_, i) => i + 1);
    const { rerender } = render(<ArrayBarChart array={small} states={[]} />);
    expect(screen.getByText(String(BAR_LABEL_LIMIT))).toBeInTheDocument();

    const large = [...small, 999];
    rerender(<ArrayBarChart array={large} states={[]} />);
    expect(screen.queryByText('999')).not.toBeInTheDocument();
    expect(fill(bars()[BAR_LABEL_LIMIT])).toHaveAttribute('title', '999');

    const compact = Array.from(
      { length: BAR_LABEL_LIMIT_COMPACT + 1 },
      (_, i) => i + 1
    );
    rerender(<ArrayBarChart array={compact} states={[]} compact />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('rings the search target', () => {
    render(<ArrayBarChart array={[3, 7]} states={[]} targetValue={7} />);
    expect(fill(bars()[1]).style.boxShadow).toContain('234, 88, 12');
    expect(fill(bars()[0]).style.boxShadow).toBe('');
  });

  it('keeps the same DOM node for an element after it swaps slots', () => {
    const { rerender } = render(
      <ArrayBarChart
        array={[9, 4]}
        states={['default', 'default']}
        elementIds={[0, 1]}
      />
    );
    const nodeForId0 = bars()[0];

    rerender(
      <ArrayBarChart
        array={[4, 9]}
        states={['swapping', 'swapping']}
        elementIds={[1, 0]}
      />
    );

    expect(bars()[1]).toBe(nodeForId0);
    expect(nodeForId0).toHaveAttribute('data-element-id', '0');
  });
});
