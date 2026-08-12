import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Handled by layout redirect
  }

  const appUser = await getAppUser(supabase);
  if (!appUser) return null;

  const { count: purchasesCount } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', appUser.id);

  const { count: readingListCount } = await supabase
    .from('wishlist')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', appUser.id);

  const { count: activeCoursesCount } = await supabase
    .from('progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', appUser.id)
    .not('course_id', 'is', null);

  const hasPurchases = (purchasesCount ?? 0) > 0;

  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-12">
      <h1 className="text-3xl font-bold text-primary-navy dark:text-white mb-3">
        Welcome{appUser.name ? `, ${appUser.name}` : ''} to SunFinity
      </h1>
      {!appUser.name && (
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2 mb-2">
          Set your name in Account Settings
        </p>
      )}
      <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
        {hasPurchases
          ? "You're all set! Check out your active purchases and continue building your library."
          : "Your library is empty for now — let's find your first read. We'll recommend books and essays as you go, and always tell you why."}
      </p>
      <a
        href={hasPurchases ? "/dashboard/purchases" : "/books"}
        className="bg-primary-navy text-white rounded-lg px-6 py-3 text-sm font-medium mb-10 inline-block hover:bg-opacity-90"
      >
        {hasPurchases ? "View My Purchases" : "Browse Featured Books"}
      </a>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-8 py-6">
          <p className="text-3xl font-bold text-primary-navy dark:text-white">{purchasesCount ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Purchases</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-8 py-6">
          <p className="text-3xl font-bold text-primary-navy dark:text-white">{readingListCount ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reading List</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-8 py-6">
          <p className="text-3xl font-bold text-primary-navy dark:text-white">{activeCoursesCount ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Courses</p>
        </div>
      </div>
    </div >
  );
}