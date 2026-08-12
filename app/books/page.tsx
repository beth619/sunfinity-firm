import { Metadata } from 'next';
import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import BooksCatalog, { BookRow } from '@/app/components/Books/BooksCatalog';

export const metadata: Metadata = {
  title: 'Books & Shop | Curated Titles for Builders and Thinkers',
  description: 'Browse our complete catalog of books, filter by topics and formats, and buy direct or download files.',
};

export type { BookRow };

export default async function BooksPage() {
  const supabase = await createClient();

  // Safely select columns that are guaranteed to exist
  const { data: books, error } = await supabase
    .from('books')
    .select('*');

  const appUser = await getAppUser(supabase);

  let wishlistedBookIds: number[] = [];
  if (appUser) {
    const { data: wishlistRows } = await supabase
      .from('wishlist')
      .select('book-id')
      .eq('user-id', appUser.id);
    wishlistedBookIds = (wishlistRows ?? []).map((row: any) => row['book-id']);
  }

  if (error) {
    console.error('Error fetching books from Supabase:', error.message);
  }

  const typedBooks: BookRow[] = (books || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    cover_image_url: b.cover_image_url || b.cover_url || '',
    file_url: b.file_url || '',
    price: b.price || 0,
    amazon_url: b.amazon_url || '',
    slug: b.slug || b.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
    direct_buy_enabled: b.direct_buy_enabled ?? true,
    topic: b.topic || 'Startups',
    format: b.format || 'eBook',
    created_at: b.created_at,
  }));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h3 className="text-lg font-bold">Failed to load books</h3>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        ) : (
          <BooksCatalog books={typedBooks} wishlistedBookIds={wishlistedBookIds} isLoggedIn={!!appUser} />
        )}
      </div>
    </main>
  );
}