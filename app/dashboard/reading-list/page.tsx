import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import BookCard from '@/app/components/Books/BookCard';
import RemoveButton from './RemoveButton';

export const metadata = {
  title: 'Reading List | Dashboard',
  description: 'Your saved books',
};

export default async function ReadingListPage() {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    redirect('/resend-link');
  }

  // Use exact column name with hyphen in .eq('user-id', appUser.id)
  const { data: wishlistItems, error } = await supabase
    .from('wishlist')
    .select('id, "book-id", books(title, author, cover_image_url, price, slug, amazon_url, direct_buy_enabled)')
    .eq('user-id', appUser.id);

  if (error) {
    console.error('Error fetching reading list:', error.message, error);
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <h1 className="text-3xl font-light tracking-tight text-[#14213D] dark:text-white">
          Reading List
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Books you've saved to read later.
        </p>
      </header>

      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-[#14213D] dark:text-white">
            Your reading list is empty
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You haven't added any books to your wishlist yet.
          </p>
          <Link
            href="/books"
            className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#14213D] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1F7A4D] transition-colors"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => {
            // Handle both object and array just in case of different PostgREST return types
            const book = Array.isArray(item.books) ? item.books[0] : item.books;
            if (!book) return null;

            return (
              <div key={item.id} className="flex flex-col h-full relative group">
                <div className="flex-1">
                  <BookCard
                    title={book.title}
                    author={book.author}
                    coverImageUrl={book.cover_image_url}
                    price={Number(book.price)}
                    amazonUrl={book.amazon_url}
                    slug={book.slug}
                    directBuyEnabled={Boolean(book.direct_buy_enabled)}
                  />
                </div>
                <div className="mt-4">
                  <RemoveButton wishlistItemId={item.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
