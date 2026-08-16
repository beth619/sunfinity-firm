import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import DashboardSidebar from './DashboardSidebar';
import { getAppUser } from '@/app/utils/get-app-user';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/resend-link');
  }

  const appUser = await getAppUser(supabase);
  if (!appUser) {
    redirect('/resend-link');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .maybeSingle();

  const displayName = appUser.name || 'there';
  const planName = subscription?.tier
    ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) + ' Plan'
    : 'No active plan';
  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  return (
    <div className="bg-[#F2F2F7] dark:bg-black min-h-screen flex">
      <DashboardSidebar displayName={displayName} planName={planName} isAdmin={isAdmin} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}