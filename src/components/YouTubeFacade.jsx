/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState } from 'react';
import { Play } from '@phosphor-icons/react';

/**
 * Click-to-load YouTube embed — no third-party requests until the visitor activates play.
 *
 * @param {Object} props
 * @param {string} props.videoId
 * @param {string} props.title
 * @param {string} [props.className]
 * @param {string} [props.embedParams] - Extra query params (without leading &)
 */
export function YouTubeFacade({
  videoId,
  title,
  className = '',
  embedParams = '',
}) {
  const [isActivated, setIsActivated] = useState(false);

  const iframeSrc = embedParams
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&${embedParams}`
    : `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  if (isActivated) {
    return (
      <iframe
        className={`absolute inset-0 h-full w-full ${className}`.trim()}
        src={iframeSrc}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const handleActivate = () => setIsActivated(true);

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsActivated(true);
    }
  };

  return (
    <button
      type="button"
      className={`group relative block h-full w-full overflow-hidden bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 ${className}`.trim()}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`/thumbnails/${videoId}.jpg`}
        alt=""
        loading="lazy"
        width={480}
        height={360}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span
        className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40"
        aria-hidden="true"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition-transform group-hover:scale-105">
          <Play weight="fill" className="h-8 w-8" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

export default YouTubeFacade;
