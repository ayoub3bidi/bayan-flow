# Contributing to Bayan Flow

Thank you for your interest in contributing to Bayan Flow! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/bayan-flow.git
   cd bayan-flow
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ayoub3bidi/bayan-flow.git
   ```

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Generate coverage report
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier

## Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

- **Bug fixes** - Fix existing issues
- **New algorithms** - Add sorting or pathfinding algorithms
- **Feature enhancements** - Improve existing functionality
- **Documentation** - Improve docs, comments, or examples
- **Performance improvements** - Optimize code performance
- **UI/UX improvements** - Enhance user interface and experience
- **Tests** - Add or improve test coverage

### Before You Start

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** to discuss major changes before implementing them
3. **Keep changes focused** - one feature/fix per pull request
4. **Follow the coding standards** outlined below

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Write or update tests** for your changes

4. **Run the test suite** to ensure everything passes:
   ```bash
   pnpm test:run
   pnpm lint
   pnpm format:check
   ```

5. **Commit your changes** with a clear commit message:
   ```bash
   git commit -m "feat: add insertion sort algorithm"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a pull request** on GitHub with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/GIFs for UI changes
   - Test results if applicable

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

### Requesting Features

Use the feature request template and include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Alternative solutions considered

### Requesting New Algorithms

Use the algorithm request template and include:
- Algorithm name and type (sorting/pathfinding)
- Brief description and use cases
- Time/space complexity
- Reference links or resources

## Coding Standards

### JavaScript/React

- Use **ES6+ features** and modern JavaScript
- Follow **React best practices** and hooks patterns
- Use **functional components** with hooks
- Implement **proper error boundaries** where needed
- Use **TypeScript-style JSDoc** for complex functions

### Code Style

- **ESLint** and **Prettier** are configured - run `pnpm lint:fix` and `pnpm format`
- Use **camelCase** for variables and functions
- Use **PascalCase** for components and classes
- Use **UPPER_SNAKE_CASE** for constants
- Keep functions **small and focused**
- Use **descriptive variable names**

### File Organization

```
src/
├── algorithms/          # Algorithm implementations
│   ├── sorting/        # Sorting algorithms
│   ├── pathfinding/    # Pathfinding algorithms
│   ├── python/         # Python code examples
│   └── index.js       # Main algorithms export
├── components/         # React components
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── constants/         # App constants
└── test/              # Test configuration
```

### Adding New Algorithms

#### Sorting Algorithms

1. Create algorithm file in `src/algorithms/sorting/`:
   ```javascript
   import { ELEMENT_STATES } from '../../constants';

   export function yourSort(array) {
     const steps = [];
     const arr = [...array];
     
     // Implementation with step recording
     // Each step: { array, states, description }
     
     return steps;
   }

   export function yourSortPure(array) {
     // Pure implementation for testing
     return sortedArray;
   }
   ```

2. Export in `src/algorithms/sorting/index.js`
3. Add to settings panel dropdown
4. Add complexity metadata in constants
5. Write tests in `src/algorithms/sorting/algorithms.test.js`
6. Add Python implementation in `src/algorithms/python/`

#### Pathfinding Algorithms

1. Create algorithm file in `src/algorithms/pathfinding/`
2. Follow similar pattern with grid-based steps
3. Export in pathfinding index file
4. Add complexity metadata
5. Write tests

## Testing

### Test Requirements

- **Unit tests** for algorithm implementations
- **Integration tests** for React components
- **Edge case testing** for algorithms
- **Accessibility testing** for UI components

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { yourSort, yourSortPure } from './yourSort';

describe('Your Sort Algorithm', () => {
  it('should sort array correctly', () => {
    const input = [3, 1, 4, 1, 5];
    const expected = [1, 1, 3, 4, 5];
    expect(yourSortPure(input)).toEqual(expected);
  });

  it('should generate visualization steps', () => {
    const input = [3, 1, 2];
    const steps = yourSort(input);
    expect(steps).toHaveLength(greaterThan(0));
    expect(steps[0]).toHaveProperty('array');
    expect(steps[0]).toHaveProperty('states');
    expect(steps[0]).toHaveProperty('description');
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm test:ui
```

## License Compliance

### Contribution Requirements

By contributing to this project, you agree that:

- Your contributions will be licensed under **MPL-2.0**
- All new files must include the MPL-2.0 header at the top:

```javascript
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */
```

- Contributions must be MPL-2.0 compatible
- You have the right to submit your contribution under MPL-2.0
- Your contribution does not violate any third-party licenses

### Third-Party Dependencies

- Only add dependencies licensed under MPL-2.0-compatible licenses (MIT, Apache-2.0, BSD, ISC)
- **Do not** add GPL-licensed dependencies (incompatible with MPL-2.0)
- Document any new dependencies and their licenses in your pull request

## Documentation

### Code Documentation

- Use **JSDoc comments** for complex functions
- Include **parameter types** and **return values**
- Document **algorithm complexity** in comments
- Explain **non-obvious logic** with inline comments

### README Updates

- Update feature lists for new algorithms
- Add usage examples for new features
- Update installation instructions if needed
- Keep the project structure section current

### Architecture Documentation

- Update `docs/ARCHITECTURE.md` for structural changes
- Document new patterns or conventions
- Explain complex component interactions

## Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Code Review** - Ask for feedback on pull requests

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special mentions for major features

Thank you for contributing to Bayan Flow! 🎉
