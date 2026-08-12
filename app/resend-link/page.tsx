'use client'

import { useState } from 'react'

export default function ResendLink() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const res = await fetch('/api/resend-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        const data = await res.json()

        setIsError(!res.ok)
        setMessage(data.message || data.error)
        setLoading(false)
    }

    return (
        <main className="bg-[#F2F2F7] dark:bg-black min-h-screen flex items-center justify-center px-6">
            <div className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center shadow-sm">
                <div className="w-14 h-14 bg-primary-navy rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-primary-navy dark:text-white mb-2">
                    Log in with your email
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    No password needed — we'll send a secure link straight to your inbox to sign you in.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-center text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary-navy px-4 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Login Link'}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-sm ${isError ? 'text-red-600 dark:text-red-400' : 'text-primary-green'}`}>
                        {message}
                    </p>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
                    New here?{' '}
                    <a href="/courses#pricing" className="underline hover:text-primary-navy dark:hover:text-white">
                        See membership plans
                    </a>{' '}
                    to get started.
                </p>
            </div>
        </main>
    );
}