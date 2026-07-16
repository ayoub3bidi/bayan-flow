/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.lastUpdated
 * @param {Array<{ id: string, title: string, paragraphs: string[], list?: string[] }>} props.sections
 */
function LegalDocument({ title, lastUpdated, sections }) {
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <Header hideLanguageSwitcher />

      <main className="relative z-10 flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <p className="text-sm text-text-secondary mb-2">
          <Link to="/" className="hover:text-theme-primary transition-colors">
            Bayan Flow
          </Link>
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
          {title}
        </h1>
        <p className="text-sm text-text-secondary mb-10">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-10">
          {sections.map(section => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-text-primary mb-3">
                {section.title}
              </h2>
              <div className="space-y-3 text-text-secondary leading-relaxed">
                {section.paragraphs.map(paragraph => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {section.list?.length ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.list.map(item => (
                      <li key={item.slice(0, 40)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LegalDocument;
