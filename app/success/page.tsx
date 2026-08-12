import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="bg-[#F2F2F7] min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h1 className="text-3xl font-bold text-primary-navy mb-3">You're in!</h1>
        <p className="text-gray-600 mb-6">
          Check your email for a magic link to access your dashboard and start exploring your membership.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/courses"
            className="rounded-full bg-primary-navy px-6 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors"
          >
            Browse Courses While You Wait
          </Link>
          <Link
            href="/resend-link"
            className="text-sm text-gray-500 hover:text-primary-navy transition-colors"
          >
            Didn't get the email? Resend it
          </Link>
        </div>
      </div>
    </main>
  );
}