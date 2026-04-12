## Contribution workflow

<!-- Required for every PR -->

- [ ] **Base branch is `develop`:** This PR targets **`develop`**, not `main`. (If the base is wrong, edit the PR on GitHub and change the base branch.)
- [ ] **Guidelines and docs:** I have read [CONTRIBUTING.md](../CONTRIBUTING.md) and the docs relevant to my change ([DEVELOPMENT.md](../docs/DEVELOPMENT.md), [ARCHITECTURE.md](../docs/ARCHITECTURE.md) as needed).
- [ ] **This template:** I kept the PR template structure and filled in the sections below that apply to this change.

## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Style/UI improvement
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition or improvement
- [ ] 🔧 Chore (maintenance, dependencies, etc.)

## Related Issues

<!-- Link to related issues using "Fixes #123" or "Closes #123" -->

Fixes #

## Changes Made

<!-- List the specific changes made in this PR -->

- 
- 
- 

## Algorithm Details (if applicable)

<!-- For new algorithms, provide the following information -->

- **Algorithm Name**: 
- **Type**: Sorting / Pathfinding
- **Time Complexity**: 
  - Best: O()
  - Average: O()
  - Worst: O()
- **Space Complexity**: O()
- **Use Cases**: 

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

- [ ] All existing tests pass (`pnpm test:run`)
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

### Test Results

```
<!-- Paste test results here -->
```

## Screenshots/GIFs

<!-- Add screenshots or GIFs for UI changes -->

| Before | After |
|--------|-------|
| <!-- Screenshot --> | <!-- Screenshot --> |

## Code Quality

<!-- Confirm that code quality checks pass -->

- [ ] Code follows the project's coding standards
- [ ] ESLint passes (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)
- [ ] No console errors or warnings
- [ ] Code is properly documented with JSDoc (if applicable)

## Performance Impact

<!-- Describe any performance implications -->

- [ ] No performance impact
- [ ] Performance improved
- [ ] Performance impact assessed and acceptable
- [ ] Performance benchmarks included

## Accessibility

<!-- For UI changes, confirm accessibility compliance -->

- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility maintained
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible

## Breaking Changes

<!-- List any breaking changes and migration steps -->

- None

## Checklist

<!-- Confirm the following before submitting -->

- [ ] I have completed the **Contribution workflow** checklist at the top of this template
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Notes

<!-- Add any additional notes, concerns, or context -->

---

**Reviewer Guidelines:**
- Check that all tests pass
- Verify code follows project standards
- Test the changes locally
- Review for security implications
- Ensure documentation is updated
