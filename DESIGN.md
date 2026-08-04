---
name: Bayan Flow
description: Clarity-first algorithm visualization — calm product UI with semantic state color
colors:
  primary: "#2b7fff"
  primary-hover: "#2563eb"
  accent-sky: "#0ea5e9"
  accent-purple: "#8b5cf6"
  accent-pink: "#ec4899"
  bg-light: "#f9fafb"
  surface-light: "#ffffff"
  surface-elevated-light: "#f2f4f7"
  text-primary-light: "#364153"
  text-secondary-light: "#6b7280"
  bg-dark: "#0a0f1a"
  surface-dark: "#1a2332"
  surface-elevated-dark: "#2d3748"
  viz-comparing: "#fbbf24"
  viz-swapping: "#ef4444"
  viz-sorted: "#10b981"
  viz-pivot: "#8b5cf6"
typography:
  display:
    fontFamily: "Source Serif 4 Variable, Source Serif 4, Georgia, Times New Roman, serif"
    fontWeight: 800
    fontSize: "3.5rem"
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  displayMobile:
    fontFamily: "Source Serif 4 Variable, Source Serif 4, Georgia, Times New Roman, serif"
    fontWeight: 800
    fontSize: "2.5rem"
    lineHeight: 1.1
  heading:
    fontFamily: "Source Serif 4 Variable, Source Serif 4, Georgia, Times New Roman, serif"
    fontWeight: 700
    fontSize: "2.5rem"
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headingMobile:
    fontFamily: "Source Serif 4 Variable, Source Serif 4, Georgia, Times New Roman, serif"
    fontWeight: 700
    fontSize: "2rem"
    lineHeight: 1.2
  landingBody:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1.125rem"
    lineHeight: 1.7
  body:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.5
  label:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.875rem"
    letterSpacing: "0.02em"
rounded:
  xs: "0.25rem"
  scrollbar: "3px"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "0.75rem"
spacing:
  touch: "44px"
  panel: "1rem"
  section: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-cta:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "12px 28px"
---

# Design System: Bayan Flow

## Overview

**Creative North Star: "The Clarity Lab"**

Bayan Flow looks like a focused lab instrument: generous whitespace, tinted neutrals, and a single confident blue primary. The visualization canvas owns attention; panels and controls recede until needed. Glass surfaces and soft elevation separate tool chrome from the algorithm stage without nesting decorative cards.

**Key Characteristics:**

- CSS-variable tokens in `src/index.css` — light and `.dark` themes share one vocabulary
- Inter Variable for all UI copy (intentional, not a placeholder font)
- Phosphor icons only — no emoji stand-ins
- Semantic visualization colors are sacred — never repurpose for marketing gradients
- Framer Motion for feedback (scale 1.02 on hover), not bounce/elastic choreography
- RTL via `rtlManager` — layout must mirror cleanly in Arabic

## Colors

A cool slate-and-blue product palette with saturated accents reserved for algorithm states and rare CTAs.

### Primary

- **Bayan Blue** (#2b7fff): Primary actions, links, focus rings, landing CTA base. Hover deepens to #2563eb.

### Secondary

- **Sky Accent** (#0ea5e9): Secondary highlights, informational emphasis.

### Tertiary

- **Viz Purple** (#8b5cf6): Pivot nodes, grid start, secondary accent — algorithm semantics first.
- **Signal Pink** (#ec4899): Tertiary accent only; never body text.

### Neutral

- **Cool Paper** (#f9fafb / #ffffff / #f2f4f7): Light backgrounds and elevated panels.
- **Midnight Lab** (#0a0f1a / #1a2332 / #2d3748): Dark mode elevation stack.
- **Slate Text** (#364153 / #6b7280): Primary and secondary copy; always tinted, never pure #000.

### Named Rules

**The Semantic Color Rule.** Colors like comparing (#fbbf24), swapping (#ef4444), sorted (#10b981), and path (#10b981) are visualization vocabulary. Do not reuse them for buttons, badges, or hero gradients.

**The One Voice Rule.** Primary blue appears on ≤15% of any product screen surface. Rarity signals action.

## Typography

**Display Font (landing / marketing headings):** Source Serif 4 Variable — academic lab character on `.landing-h1` / `.landing-h2` only.
**Body Font:** Inter Variable (system-ui fallback) — product UI, body copy, controls.

**Character:** Clean, legible, technical-but-warm. Optimized for step descriptions and control labels at a glance. Marketing display adds a restrained serif for Clarity Lab presence without replacing Inter in the app.

### Hierarchy

- **Display** (700–800, clamp on landing heroes): Marketing headlines only (Source Serif 4).
- **Title** (600, 1.125–1.25rem): Panel titles, algorithm names (Inter).
- **Body** (400, 1rem, line-height 1.5): Descriptions, insight copy, settings (Inter).
- **Label** (600, 0.875rem, slight tracking): Control groups, tabs, chips (Inter).

### Named Rules

**The Inter Lock Rule.** Inter is the established brand face for product UI and body copy. Do not swap Inter app-wide unless the user explicitly requests a rebrand. **Exception:** landing/marketing display headings (`.landing-h1`, `.landing-h2`) may use Source Serif 4 Variable for academic-lab character.

## Elevation

Depth comes from tinted surface steps and restrained shadows, plus selective glass on floating controls (`--color-glass-bg`). Shadows use `--shadow-sm` through `--shadow-lg`; dark mode leans on surface elevation more than shadow blur.

### Shadow Vocabulary

- **Control lift** (`0 4px 6px -1px rgb(0 0 0 / 0.1)`): Primary buttons at rest.
- **Panel float** (`0 10px 15px -3px rgb(0 0 0 / 0.1)`): Modals, export progress.

### Named Rules

**The Flat Canvas Rule.** The visualizer canvas stays flat. Elevation belongs to chrome (header, panels, FABs), not bars/cells/nodes.

## Components

### Buttons

- **Shape:** Rounded-lg (8px) standard; CTA uses rounded-xl with layered shimmer (landing only).
- **Primary:** `bg-theme-primary`, white text, shadow-lg → shadow-xl on hover, `min-h-touch`.
- **Secondary:** Surface fill, 2px border, text-primary.
- **Motion:** `scale(1.02)` hover, spring stiffness 400 / damping 17 — no bounce easing.

### Cards / Containers

- **Corner Style:** rounded-lg to rounded-xl on marketing sections.
- **Background:** `surface` / `surface-elevated`; glass for floating overlays.
- **Border:** Subtle `border-border`; stronger on interactive chips.
- **Internal Padding:** 1rem panels; 1.5–2rem marketing sections.

### Navigation

- **Header:** Compact on `/app`; fixed controls (theme, language, user) top-right on landing.
- **Category tabs:** Icon + label from `categoryConfig`; active state uses primary tint.

### Visualizer Chrome

- **Control panel:** Horizontal transport + settings access; must stay usable at 375px width.
- **FABs:** Code and insight panels as floating actions, not permanent sidebars.

## Do's and Don'ts

### Do:

- **Do** use CSS variables from `src/index.css` for every new surface and text color.
- **Do** verify Arabic RTL after horizontal layout changes.
- **Do** keep visualization state colors consistent across interactive view and Remotion export.
- **Do** use Phosphor icons at 20–24px with matching stroke weight.
- **Do** preserve 44px minimum touch targets on playback and settings controls.

### Don't:

- **Don't** use generic AI SaaS landing tropes — purple gradient heroes, metric filler cards, icon-in-rounded-square feature grids.
- **Don't** nest cards inside cards in the visualizer shell; use spacing and dividers.
- **Don't** apply gradient text to headings or step descriptions.
- **Don't** use bounce or elastic easing on UI transitions.
- **Don't** swap Inter app-wide or replace Phosphor with emoji icons without an explicit rebrand request (landing display serif on `.landing-h1` / `.landing-h2` is the documented exception).
- **Don't** add UI click sounds — audio is for visualization steps only.
