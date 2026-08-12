import Link from 'next/link';

export default function NewsletterConfirmedPage() {
    return (
        <main className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-6">
            <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-primary-navy mb-2">
                    You're confirmed!
                </h1>
                <p className="text-gray-600 mb-6">
                    Thanks for subscribing to SunFinity Firm. Keep an eye on your inbox for curated essays, book notes, and frameworks — no noise, no spam.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/books"
                        className="rounded-full bg-primary-navy px-6 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors"
                    >
                        Browse Books
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-primary-navy transition-colors"
                    >
                        Back to homepage
                    </Link>
                </div>
            </div>
        </main>
    );
}