'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchModal from '@/app/components/Search/SearchModal';

interface NavActionsProps {
  isLoggedIn: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function NavActions({
  isLoggedIn,
  darkMode,
  onToggleDarkMode,
}: NavActionsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-green transition-colors"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-green transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707.707m12.728-12.728l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <Link
          href="/admin"
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-green transition-colors"
          aria-label="Admin"
          title="Admin"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </Link>

        <Link
          href={isLoggedIn ? "/dashboard" : "/resend-link"}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-green transition-colors"
          aria-label="User account"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}