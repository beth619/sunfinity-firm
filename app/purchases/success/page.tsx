import Link from 'next/link';

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  const params = await searchParams;
  const title = params.title || 'your book';

  return (
    <main className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary-navy mb-2">
          You've got it!
        </h1>
        <p className="text-gray-600 mb-6">
          {decodeURIComponent(title)} has been downloaded successfully.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/purchases"
            className="rounded-full bg-primary-navy px-6 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors"
          >
            View My Purchases
          </Link>
          <Link
            href="/books"
            className="text-sm text-gray-500 hover:text-primary-navy transition-colors"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    </main>
  );
}