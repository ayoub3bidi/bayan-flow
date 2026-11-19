/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Theme switch as a BFS flood fill: the new theme spreads from the toggle
 * tile by tile, ring by ring, like the pathfinding visualizer exploring a grid.
 * Uses the View Transitions API; falls back to an instant switch.
 */

const MIN_TILE_PX = 32;
const MAX_TILE_PX = 56;
const GROW_MS = 140;
const TOTAL_MS = 650;
const NEW_LAYER = '::view-transition-new(root)';

let activeTransition = null;

/**
 * BFS depth of every tile from the origin. On an open 4-neighbour grid this is
 * the Manhattan distance, so the wave front is a diamond.
 *
 * @returns {{ rings: number[], maxRing: number }} rings indexed row * cols + col
 */
export function getWaveRings(cols, rows, originCol, originRow) {
  const rings = new Array(cols * rows);
  let maxRing = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ring = Math.abs(col - originCol) + Math.abs(row - originRow);
      rings[row * cols + col] = ring;
      if (ring > maxRing) maxRing = ring;
    }
  }
  return { rings, maxRing };
}

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * SVG mask of every tile revealed at `elapsed` ms, in viewport pixels.
 * Finished runs overlap their neighbours by 1px so the snapshot's scaling
 * can't open hairline seams between them.
 */
function buildMask(grid, elapsed) {
  const { cols, rows, tilePx, rings, stepMs, width, height } = grid;
  let rects = '';
  for (let row = 0; row < rows; row++) {
    const y = row * tilePx;
    let runStart = -1;
    const flushRun = end => {
      if (runStart >= 0) {
        rects += `<rect x="${runStart * tilePx}" y="${y}" width="${(end - runStart) * tilePx + 1}" height="${tilePx + 1}" shape-rendering="crispEdges"/>`;
        runStart = -1;
      }
    };
    for (let col = 0; col < cols; col++) {
      const progress = clamp(
        (elapsed - rings[row * cols + col] * stepMs) / GROW_MS,
        0,
        1
      );
      // Ease-out, rescaled so tiles reach full size before the curve's slow
      // tail: a tile sitting at 95% size reads as a hairline seam.
      const scale = Math.min(1, (1 - (1 - progress) ** 3) / 0.85);
      if (scale >= 1) {
        if (runStart < 0) runStart = col;
        continue;
      }
      flushRun(col);
      if (scale <= 0) continue;
      const size = scale * tilePx;
      const inset = (tilePx - size) / 2;
      rects += `<rect x="${(col * tilePx + inset).toFixed(1)}" y="${(y + inset).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" rx="${((tilePx - size) / 4).toFixed(1)}"/>`;
    }
    flushRun(cols);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="#fff">${rects}</svg>`;
  return `${NEW_LAYER}{mask-image:url("data:image/svg+xml,${encodeURIComponent(svg)}")}`;
}

/**
 * Run `applyChange` (which must update the DOM synchronously) behind a BFS
 * flood-fill reveal starting at viewport point `origin`.
 *
 * @param {{ x: number, y: number }} origin
 * @param {() => void} applyChange
 */
export function runThemeTransition(origin, applyChange) {
  if (
    typeof document === 'undefined' ||
    typeof document.startViewTransition !== 'function' ||
    prefersReducedMotion()
  ) {
    applyChange();
    return;
  }

  // Rapid re-toggle: jump the running wave to its end and start a new one.
  activeTransition?.skipTransition();

  const { innerWidth: vw, innerHeight: vh } = window;
  // About 12 tiles across the short side: fine on phones, not too busy on desktop.
  const tilePx = clamp(
    Math.round(Math.min(vw, vh) / 12),
    MIN_TILE_PX,
    MAX_TILE_PX
  );
  const cols = Math.max(1, Math.ceil(vw / tilePx));
  const rows = Math.max(1, Math.ceil(vh / tilePx));
  const originCol = clamp(Math.floor(origin.x / tilePx), 0, cols - 1);
  const originRow = clamp(Math.floor(origin.y / tilePx), 0, rows - 1);
  const { rings, maxRing } = getWaveRings(cols, rows, originCol, originRow);
  const stepMs = (TOTAL_MS - GROW_MS) / Math.max(1, maxRing);
  const grid = { cols, rows, tilePx, rings, stepMs, width: vw, height: vh };

  const root = document.documentElement;
  const style = document.createElement('style');
  // Fully masked until the first frame so the new theme never flashes.
  style.textContent = buildMask(grid, -1);
  document.head.append(style);
  root.classList.add('theme-transitioning');

  let transition;
  try {
    transition = document.startViewTransition(applyChange);
  } catch {
    style.remove();
    root.classList.remove('theme-transitioning');
    applyChange();
    return;
  }
  activeTransition = transition;

  let frame = 0;
  transition.ready
    .then(() => {
      // Keeps the transition alive until the last tile is revealed.
      root.animate([{ opacity: 1 }, { opacity: 1 }], {
        duration: TOTAL_MS,
        pseudoElement: NEW_LAYER,
      });
      const start = performance.now();
      const tick = now => {
        const elapsed = now - start;
        style.textContent = buildMask(grid, elapsed);
        if (elapsed < TOTAL_MS) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    })
    .catch(() => {});

  transition.finished
    .catch(() => {})
    .finally(() => {
      cancelAnimationFrame(frame);
      style.remove();
      if (activeTransition === transition) {
        activeTransition = null;
        root.classList.remove('theme-transitioning');
      }
    });
}
