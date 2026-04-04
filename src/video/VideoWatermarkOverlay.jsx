/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { staticFile, useVideoConfig } from 'remotion';
import { getVideoExportTheme } from './videoExportTheme.js';

const POSITION_STYLES = {
  br: { bottom: '2%', right: '2%', left: 'auto', top: 'auto' },
  bl: { bottom: '2%', left: '2%', right: 'auto', top: 'auto' },
  tr: { top: '2%', right: '2%', left: 'auto', bottom: 'auto' },
  tl: { top: '2%', left: '2%', right: 'auto', bottom: 'auto' },
};

/**
 * Branding overlay for exported video — sits above all composition content.
 * Large horizontal center text plus optional corner badge.
 *
 * @param {Object} props
 * @param {boolean} props.enabled
 * @param {string} [props.text]
 * @param {string | null} [props.imageUrl] — public URL or path under public/ for staticFile
 * @param {number} [props.cornerOpacity] — small corner label
 * @param {number} [props.diagonalOpacity] — large center watermark opacity (0–1)
 * @param {boolean} [props.showDiagonal]
 * @param {boolean} [props.showCornerBadge]
 * @param {'br'|'bl'|'tr'|'tl'} [props.position] — corner badge only
 * @param {'light'|'dark'} [props.exportTheme]
 */
function VideoWatermarkOverlay({
  enabled,
  text = '',
  imageUrl = null,
  cornerOpacity = 0.88,
  diagonalOpacity = 0.22,
  showDiagonal = true,
  showCornerBadge = true,
  position = 'br',
  exportTheme = 'dark',
}) {
  const { width, height } = useVideoConfig();
  const wt = getVideoExportTheme(exportTheme);

  if (!enabled) return null;

  const pos = POSITION_STYLES[position] ?? POSITION_STYLES.br;
  const minSide = Math.min(width, height);
  const cornerFontSize = Math.max(14, Math.round(width * 0.02));
  const largeWatermarkFontSize = Math.round(minSide * 0.13);

  const imgSrc =
    imageUrl && !/^https?:\/\//i.test(imageUrl)
      ? staticFile(imageUrl)
      : imageUrl;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {showDiagonal && text ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            fontSize: largeWatermarkFontSize,
            fontWeight: 800,
            color: `rgba(${wt.watermarkDiagonalRgb}, ${diagonalOpacity})`,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            maxWidth: '95%',
            textAlign: 'center',
            lineHeight: 1.05,
            textShadow: wt.watermarkDiagonalTextShadow,
            userSelect: 'none',
          }}
        >
          {text}
        </div>
      ) : null}

      {showCornerBadge ? (
        <div
          style={{
            position: 'absolute',
            ...pos,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            maxWidth: '42%',
            opacity: cornerOpacity,
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              style={{
                maxHeight: cornerFontSize * 2.2,
                maxWidth: '45%',
                objectFit: 'contain',
              }}
            />
          ) : null}
          {text ? (
            <span
              style={{
                color: wt.watermarkCornerText,
                fontSize: cornerFontSize,
                fontWeight: 700,
                textShadow: wt.watermarkCornerTextShadow,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {text}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default VideoWatermarkOverlay;
