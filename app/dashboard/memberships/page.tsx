import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';

export const metadata = {
  title: 'Membership | Dashboard',
  description: 'View your active membership plan',
};

export default async function MembershipsPage() {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    redirect('/resend-link');
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end, cancel_at_period_end')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error.message, error);
  }

  let planName = null;
  let renewalDate = null;

  if (subscription) {
    planName = subscription.tier
      ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) + ' Plan'
      : 'Active Plan';

    if (subscription.current_period_end) {
      renewalDate = new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <h1 className="text-3xl font-light tracking-tight text-[#14213D] dark:text-white">
          Membership
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          View your current subscription plan details.
        </p>
      </header>

      {!subscription ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-[#14213D] dark:text-white">
            No active membership
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You do not currently have an active plan.
          </p>
          <Link
            href="/courses#pricing"
            className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#14213D] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1F7A4D] transition-colors"
          >
            View Plans
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-semibold text-[#14213D] dark:text-white">
                  {planName}
                </h3>
                {subscription.cancel_at_period_end ? (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                    Cancels at period end
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                    Active
                  </span>
                )}
              </div>
              {renewalDate && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {subscription.cancel_at_period_end ? `Access ends on ${renewalDate}` : `Renews on ${renewalDate}`}
                </p>
              )}
            </div>
            

          </div>
        </div>
      )}
    </div>
  );
}
