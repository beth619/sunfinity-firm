'use client'

import Link from 'next/link';
import NavLinks from './NavLinks';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn: boolean;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    isRTL: boolean;
    onToggleRTL: () => void;
}

export default function MobileDrawer({
    isOpen,
    onClose,
    isLoggedIn,
    darkMode,
    onToggleDarkMode,
    isRTL,
    onToggleRTL,
}: MobileDrawerProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel — "end-0" is a logical property: right edge in LTR, left edge in RTL, automatically */}
            <div
                className={`fixed inset-y-0 end-0 z-50 w-72 bg-white dark:bg-primary-navy shadow-xl md:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-primary-navy dark:text-white">Menu</span>
                    <button type="button" onClick={onClose} aria-label="Close menu" className="inline-flex">
                        <svg className="h-6 w-6 text-primary-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col gap-6 px-6 py-6">
                    <NavLinks vertical onNavigate={onClose} />

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link
                            href={isLoggedIn ? '/dashboard' : '/resend-link'}
                            onClick={onClose}
                            className="text-start text-sm font-medium text-primary-navy dark:text-white"
                        >
                            {isLoggedIn ? 'Dashboard' : 'Log in'}
                        </Link>

                        <button
                            type="button"
                            onClick={onToggleDarkMode}
                            className="text-start text-sm font-medium text-primary-navy dark:text-white"
                        >
                            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </button>

                        <button
                            type="button"
                            onClick={onToggleRTL}
                            className="text-start text-sm font-medium text-primary-navy dark:text-white"
                        >
                            {isRTL ? 'Switch to LTR' : 'Switch to RTL'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}