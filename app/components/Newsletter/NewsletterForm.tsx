'use client';

import { useState, useTransition } from 'react';
import { subscribeToNewsletter } from './newsletter-actions';

interface NewsletterFormProps {
    className?: string;
    inputClassName?: string;
    buttonClassName?: string;
    formClassName?: string;
    variant?: 'light' | 'dark';
}

export default function NewsletterForm({
    className = '',
    inputClassName = '',
    buttonClassName = '',
    formClassName = 'flex gap-2',
    variant = 'light',
}: NewsletterFormProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('idle');

        startTransition(async () => {
            const result = await subscribeToNewsletter(email);
            if (result?.success) {
                setStatus('success');
                setEmail('');
                localStorage.setItem('sf-newsletter-subscribed', 'true');
            } else {
                setStatus('error');
                setErrorMsg(result?.error || 'Something went wrong.');
            }
        });
    };

    if (status === 'success') {
        return (
            <div className={className}>
                <p className={variant === 'dark' ? 'text-white text-sm' : 'text-primary-navy text-sm'}>
                    Check your inbox to confirm your subscription!
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className={formClassName}>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isPending}
                    className={inputClassName || 'flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green'}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className={buttonClassName || 'rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-green transition-colors disabled:opacity-50'}
                >
                    {isPending ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
            {status === 'error' && (
                <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
            )}
            <p className={`text-xs mt-2 ${variant === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                We'll only ever email you about new essays and books — unsubscribe anytime.
            </p>
        </div>
    );
}