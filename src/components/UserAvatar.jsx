/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useMemo, useState } from 'react';
import { generateAvatarDataUri } from '@/utils/resolveUserAvatar';

const SIZE_CLASSES = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

const SIZE_PX = {
  sm: 36,
  md: 40,
};

/**
 * @param {Object} props
 * @param {{ displayName: string, email: string, avatarSrc: string }} props.profile
 * @param {'sm' | 'md'} [props.size]
 * @param {string} [props.className]
 */
function UserAvatar({ profile, size = 'sm', className = '' }) {
  const [imageSrc, setImageSrc] = useState(profile.avatarSrc);
  const [usedFallback, setUsedFallback] = useState(false);

  const fallbackSrc = useMemo(
    () => generateAvatarDataUri(profile.email, SIZE_PX[size]),
    [profile.email, size]
  );

  useEffect(() => {
    if (profile.avatarSrc) {
      setImageSrc(profile.avatarSrc);
      setUsedFallback(false);
    } else {
      setImageSrc(fallbackSrc);
      setUsedFallback(true);
    }
  }, [profile.avatarSrc, fallbackSrc]);

  const handleError = () => {
    if (!usedFallback) {
      setUsedFallback(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={`${SIZE_CLASSES[size]} shrink-0 rounded-full border border-(--color-glass-border) object-cover bg-surface-elevated ${className}`}
    />
  );
}

export default UserAvatar;
