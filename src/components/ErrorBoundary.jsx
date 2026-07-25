/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Component, createElement } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ??
        createElement(
          'div',
          {
            className:
              'flex flex-col items-center justify-center h-full p-8 text-center',
          },
          createElement(
            'p',
            { className: 'text-lg font-semibold mb-2' },
            'Something went wrong.'
          ),
          createElement(
            'button',
            {
              className:
                'mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700',
              onClick: () => this.setState({ hasError: false }),
            },
            'Try again'
          )
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
