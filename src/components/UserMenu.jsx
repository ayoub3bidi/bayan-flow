/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Gear, SignOut } from '@phosphor-icons/react';
import { SiGoogle } from 'react-icons/si';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from './UserAvatar';
import Tooltip from './ui/Tooltip';

/**
 * @param {Object} props
 * @param {'landing' | 'compact'} [props.variant]
 * @param {boolean} [props.hideAvatar] - When true, hide the menu if user is authenticated (used on non-/app pages)
 */
function UserMenu({ variant = 'landing', hideAvatar = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isConfigured,
    isLoading,
    isAuthenticated,
    profile,
    signInWithGoogle,
    signOut,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(false);
  const menuRef = useRef(null);
  const isCompact = variant === 'compact';

  useEffect(() => {
    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isConfigured) {
    return null;
  }

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(false);
    try {
      await signInWithGoogle();
      if (variant === 'landing') {
        navigate('/app', { replace: true });
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      // Show feedback for any failure — silent catch hides Auth hook / network errors.
      setSignInError(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div
        className={`rounded-full border border-(--color-glass-border) bg-interactive-bg animate-pulse ${
          isCompact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-9 w-9'
        }`}
        aria-hidden="true"
      />
    );
  }

  if (hideAvatar && isAuthenticated && profile) {
    return null;
  }

  if (!isAuthenticated || !profile) {
    const signInButtonClassName = `flex items-center justify-center bg-interactive-bg backdrop-blur-md rounded-md border border-interactive-border shadow-sm transition-colors duration-200 cursor-pointer touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed ${
      isCompact
        ? 'h-8 w-8 sm:h-9 sm:w-9 p-0'
        : 'gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 py-0 hover:shadow-md transition-all duration-200'
    }`;

    if (isCompact) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Tooltip label={t('auth.sign_in_google')} side="bottom" align="end">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className={signInButtonClassName}
              aria-label={t('auth.sign_in_google')}
            >
              <SiGoogle className="h-4 w-4 shrink-0 text-text-primary" />
            </button>
          </Tooltip>
          {signInError ? (
            <p className="max-w-48 text-end text-[10px] text-text-secondary">
              {t('accessBan.signInUnavailable')}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-1">
        <motion.button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className={signInButtonClassName}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label={t('auth.sign_in_google')}
        >
          <SiGoogle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-text-primary" />
          <span className="text-xs sm:text-sm font-medium text-text-primary">
            {t('auth.sign_in_google')}
          </span>
        </motion.button>
        {signInError ? (
          <p className="max-w-xs text-end text-[10px] sm:text-xs text-text-secondary">
            {t('accessBan.signInUnavailable')}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className={`flex items-center justify-center bg-interactive-bg backdrop-blur-md rounded-full border border-interactive-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation ${
          isCompact
            ? 'h-8 w-8 sm:h-9 sm:w-9 p-0 min-w-8 min-h-8 sm:min-w-9 sm:min-h-9'
            : 'gap-1 h-9 sm:h-10 px-1 sm:px-1.5 py-0 min-w-11 min-h-11 sm:min-w-0 sm:min-h-0'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={t('auth.account_menu_label', { name: profile.displayName })}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <UserAvatar profile={profile} size="sm" />
        {!isCompact && (
          <CaretDown
            size={12}
            weight="bold"
            className={`hidden sm:block shrink-0 transition-colors ${
              isOpen ? 'text-accent-primary' : 'text-text-secondary'
            }`}
            aria-hidden="true"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 w-64 rounded-xl border border-(--color-glass-border) bg-(--color-glass-bg) backdrop-blur-lg shadow-xl z-50 overflow-hidden"
            role="menu"
            aria-label={t('auth.account_menu_label', {
              name: profile.displayName,
            })}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-(--color-glass-border)">
              <UserAvatar profile={profile} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {profile.displayName}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {profile.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                navigate('/settings/profile');
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-text-primary hover:bg-interactive-bg transition-colors cursor-pointer touch-manipulation min-h-11"
            >
              <Gear size={18} weight="regular" className="shrink-0" />
              {t('auth.settings')}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-text-primary hover:bg-interactive-bg transition-colors cursor-pointer touch-manipulation min-h-11"
            >
              <SignOut size={18} weight="regular" className="shrink-0" />
              {t('auth.sign_out')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserMenu;
