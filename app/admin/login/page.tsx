'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg('Invalid email or password.');
            setLoading(false);
            return;
        }

        // Hard navigation so the server-side layout check sees the new session immediately
        window.location.href = '/admin';
    }

    return (
        <main className="bg-[#F2F2F7] dark:bg-black min-h-screen flex items-center justify-center px-6">
            <div className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center shadow-sm">
                <div className="w-14 h-14 bg-primary-navy rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-primary-navy dark:text-white mb-2">
                    Admin Login
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Restricted access. Sign in with your admin credentials.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-center text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green disabled:opacity-60"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-center text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary-navy px-4 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {errorMsg && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                )}
            </div>
        </main>
    );
}