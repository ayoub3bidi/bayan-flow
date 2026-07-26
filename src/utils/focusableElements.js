/**
 * Returns an ordered list of focusable elements within a container,
 * excluding disabled, hidden, and inert elements.
 * @param {Element} container
 * @returns {Element[]}
 */
export function getFocusableElements(container) {
  const selector =
    'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([hidden])';
  return Array.from(container.querySelectorAll(selector)).filter(
    el => !el.closest('[inert]') && el.offsetParent !== null
  );
}
