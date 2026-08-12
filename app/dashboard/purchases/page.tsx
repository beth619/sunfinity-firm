import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';

export default async function PurchasesPage() {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    redirect('/resend-link');
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id, created_at, books(title, author, cover_image_url, file_url, slug)')
    .eq('user_id', appUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error.message);
  }

  const items = purchases ?? [];

  return (
    <main className="p-8 md:p-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-navy">My Purchases</h1>
        <p className="text-gray-600 mt-1">
          {items.length} {items.length === 1 ? 'book' : 'books'} downloaded
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-primary-navy">
            No purchases yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Books you download directly will show up here.
          </p>
          <a
           href="/books"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary-navy px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-green transition-colors">
                
            Browse Books
            </a>
           
          
          
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item: any) => {
            const book = item.books;
            if (!book) return null;
            return (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="h-20 w-14 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                  {book.cover_image_url && (
                    <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-navy">{book.title}</h3>
                  <p className="text-sm text-gray-500">by {book.author}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Downloaded {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {book.file_url && (
                  <a
                    href={book.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Download Again
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}