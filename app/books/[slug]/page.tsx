import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { getAppUser } from '@/app/utils/get-app-user';
import Link from 'next/link';

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !book) {
    notFound();
  }

  const appUser = await getAppUser(supabase);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-8">
        {book.cover_image_url && (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full md:w-72 h-auto rounded-xl object-cover shadow-md"
          />
        )}
        <div className="flex flex-col justify-between flex-1">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold uppercase tracking-wide bg-primary-green/10 text-primary-green px-2.5 py-1 rounded-full">
                {book.topic || 'General'}
              </span>
              <span className="text-xs text-gray-500 uppercase">
                {book.format}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary-navy dark:text-white">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              By {book.author}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
              {book.description}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-8">
            <span className="text-2xl font-bold text-primary-navy dark:text-white">
              ${book.price}
            </span>
            {book.direct_buy_enabled && book.file_url && (
              <a
                href={book.file_url}
                className="bg-primary-green text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Buy Direct
              </a>
            )}
            {book.amazon_url && (
              <a
                href={book.amazon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 dark:border-gray-700 text-primary-navy dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Buy on Amazon
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}