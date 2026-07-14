/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { FileText, WarningCircle, MapPin } from '@phosphor-icons/react';
import { SiYoutube, SiInstagram, SiTiktok } from 'react-icons/si';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  GITHUB_REPO_NAME,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_URL,
} from '../constants/githubRepo';

function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [version, setVersion] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch release data');
        }
        const data = await response.json();
        const rawTag = data.tag_name;
        if (typeof rawTag !== 'string' || !rawTag.trim()) {
          throw new Error('Missing release tag');
        }
        const versionTag = rawTag.replace(/^v/, '');
        setVersion(versionTag);
      } catch (error) {
        console.error('Failed to fetch latest version:', error);
      }
    };

    fetchLatestVersion();
  }, []);

  const links = [
    {
      label: t('footer.viewDocs'),
      icon: FileText,
      href: `${GITHUB_REPO_URL}/tree/main/docs`,
    },
    {
      label: t('footer.reportIssue'),
      icon: WarningCircle,
      href: `${GITHUB_REPO_URL}/issues`,
    },
    {
      label: t('landing.footer.seeRoadmap'),
      icon: MapPin,
      href: `/roadmap`,
    },
  ];

  const socialLinks = [
    {
      label: t('footer.youtube'),
      href: 'https://www.youtube.com/@bayan-flow',
      ariaLabel: t('footer.youtubeAria'),
      icon: <SiYoutube className="w-5 h-5" />,
      hoverClass: 'hover:text-[#FF0000]',
    },
    {
      label: t('footer.instagram'),
      href: 'https://www.instagram.com/bayanflow.app',
      ariaLabel: t('footer.instagramAria'),
      icon: <SiInstagram className="w-5 h-5" />,
      hoverClass: 'hover:text-[#d62976]',
    },
    {
      label: t('footer.tikTok'),
      href: 'https://www.tiktok.com/@bayanflow.app',
      ariaLabel: t('footer.tikTokAria'),
      icon: <SiTiktok className="w-5 h-5" />,
      hoverClass: 'hover:text-[#8B5CF6]',
    },
  ];

  const contactLinks = [
    {
      label: 'contact@bayanflow.com',
      href: 'mailto:contact@bayanflow.com',
      ariaLabel: t('footer.contactEmailAria'),
    },
  ];

  const handleLinkClick = href => {
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.footer
      data-testid="footer"
      className="relative w-full mt-auto border-t border-(--color-glass-border)"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="absolute inset-0 bg-(--color-glass-bg) backdrop-blur-lg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {/* Left: Project Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 shrink-0 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Bayan Flow logo - representing clarity through flowing waves */}
                  <path
                    d="M3 7C3 7 6 4 12 4C18 4 21 7 21 7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity="0.95"
                  />
                  <path
                    d="M3 12C3 12 6 9 12 9C18 9 21 12 21 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M3 17C3 17 6 14 12 14C18 14 21 17 21 17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity="0.55"
                  />
                  {/* Clarity dot */}
                  <circle
                    cx="12"
                    cy="12"
                    r="1.5"
                    fill="white"
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-text-primary">
                Bayan Flow
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {t('footer.description')}
              <br />
              {t('footer.descriptionNote')}
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                Elastic-2.0 License
              </span>
              {version ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {version}
                </span>
              ) : null}
            </div>
          </div>
          {/* Center: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary">
              {t('footer.forDevelopers')}
            </h3>
            <div className="flex flex-col gap-2">
              {links.map(link => {
                const Icon = link.icon;
                return (
                  <motion.button
                    key={link.label}
                    type="button"
                    onClick={() => handleLinkClick(link.href)}
                    className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary hover:text-[#3b82f6] transition-colors p-2 rounded-lg backdrop-blur-sm text-left"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon
                      size={14}
                      weight="bold"
                      className="opacity-70"
                      aria-hidden
                    />
                    <span>{link.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          {/* Follow us & contact */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary">
                {t('footer.followUs')}
              </h3>
              <div className="flex flex-row flex-wrap gap-2">
                {socialLinks.map(item => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel}
                    className={`flex items-center justify-center w-9 h-9 text-text-secondary ${item.hoverClass} transition-colors rounded-lg backdrop-blur-sm`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {item.icon}
                  </motion.a>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary">
                {t('footer.contact')}
              </h3>
              <div className="flex flex-col gap-2">
                {contactLinks.map(item => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    aria-label={item.ariaLabel}
                    className="text-xs text-text-secondary hover:text-[#3b82f6] transition-colors p-2 rounded-lg backdrop-blur-sm"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary">
              {t('footer.support')}
            </h3>
            <div className="flex flex-col items-start">
              <p className="text-xs text-text-secondary mb-3">
                {t('footer.enjoying')}
              </p>
              <motion.a
                href="https://www.producthunt.com/products/bayan-flow?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-bayan-flow"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1033547&theme=light&t=1762155508930"
                  alt="Bayan Flow - Interactive algorithm visualizer | Product Hunt"
                  width={250}
                  height={54}
                  loading="lazy"
                  className="w-[250px] h-[54px]"
                />
              </motion.a>
            </div>
          </div>
        </div>
        {/* Bottom: Copyright and legal links */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <p className="text-xs text-text-secondary text-center">
              © {currentYear} Bayan Flow. {t('footer.allRightsReserved')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                type="button"
                onClick={() => handleLinkClick('/privacy')}
                className="text-xs text-text-secondary hover:text-[#3b82f6] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('footer.privacy')}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleLinkClick('/terms')}
                className="text-xs text-text-secondary hover:text-[#3b82f6] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('footer.terms')}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
