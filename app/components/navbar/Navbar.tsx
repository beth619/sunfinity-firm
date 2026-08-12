'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavLinks from './NavLinks';
import NavActions from './NavActions';

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 dark:bg-black dark:border-gray-800 relative z-50">
      <div className="max-w-6xl mx-auto h-25 flex items-center justify-between px-6">

        {/* Logo Container */}
        <div className="flex items-center h-full">
          <Link href="/" className="flex items-center h-full">
            <img
              src="/16Sunfinity_Primary_Gold..svg"
              alt="Logo"
              className="h-20 w-auto object-contain mt-2"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center">
          <NavLinks />
        </div>

        {/* Right Actions / Interactive Icons & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <NavActions
            isLoggedIn={isLoggedIn}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Panel with Forced Vertical Stacking */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-6 shadow-xl">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="flex flex-col [&_*]:flex [&_*]:flex-col [&_*]:gap-3 [&_a]:text-lg [&_a]:font-medium [&_a]:py-2 [&_a]:text-gray-800 dark:[&_a]:text-gray-200"
          >
            <NavLinks />
          </div>
        </div>
      )}
    </header>
  );
}