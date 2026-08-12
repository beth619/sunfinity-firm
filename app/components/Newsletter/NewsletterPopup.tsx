'use client';

import { useEffect, useState, useRef } from 'react';
import NewsletterForm from './NewsletterForm';

export default function NewsletterPopup() {
    const [visible, setVisible] = useState(false);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        // Already subscribed (any form, any past session) or already prompted this session — never show again
        if (localStorage.getItem('sf-newsletter-subscribed') === 'true') return;
        if (sessionStorage.getItem('sf-newsletter-prompted') === 'true') return;

        const trigger = () => {
            if (hasTriggeredRef.current) return;
            hasTriggeredRef.current = true;
            sessionStorage.setItem('sf-newsletter-prompted', 'true');
            setVisible(true);
        };

        const timeoutId = setTimeout(trigger, 30000);

        const handleScroll = () => {
            const scrollPercent =
                window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (scrollPercent >= 0.5) trigger();
        };

        const handleExitIntent = (e: MouseEvent) => {
            if (e.clientY <= 0) trigger();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mouseleave', handleExitIntent);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mouseleave', handleExitIntent);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6">
            <div className="relative max-w-md w-full rounded-2xl bg-white p-8 shadow-xl">
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Close"
                    className="absolute top-4 end-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <p className="text-xs font-semibold uppercase tracking-wide text-primary-green mb-2">
                    Before you go
                </p>
                <h2 className="text-xl font-bold text-primary-navy mb-2">
                    Get the good stuff in your inbox
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                    Curated essays, book notes, and frameworks — no noise, no spam.
                </p>

                <NewsletterForm
                    formClassName="flex flex-col gap-3"
                    inputClassName="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
                    buttonClassName="w-full rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-green transition-colors"
                />
            </div>
        </div>
    );
}