import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import PricingCard from '@/app/components/PricingCard/PricingCard';
import CoursesGrid from '@/app/components/CoursesGrid/CoursesGrid';
import TestimonialCard from '@/app/components/Testimonals/TestimonialCard';
import CancelDowngradePanel from '@/app/dashboard/memberships/CancelDowngradePanel';

const DOWNGRADE_PATH: Record<string, string> = {
  premium: 'growth',
  growth: 'basic',
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasActiveSubscription = false;
  let subscription: any = null;

  if (user) {
    const appUser = await getAppUser(supabase);
    if (appUser) {
      const { data } = await supabase
        .from('subscriptions')
        .select('status, tier, current_period_end, cancel_at_period_end')
        .eq('user_id', appUser.id)
        .eq('status', 'active')
        .maybeSingle();

      subscription = data;
      hasActiveSubscription = !!subscription;
    }
  }

  const { data: courses } = await supabase.from('courses').select('*');

  const { data: pricingTiers } = await supabase
    .from('pricing_tiers')
    .select('*')
    .order('price', { ascending: true });

  const { data: membershipTestimonials } = await supabase
    .from('testimonals')
    .select('*')
    .is('book_id', null)
    .limit(3);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-navy to-primary-green text-white text-center py-20 px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-200">Membership & Courses</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">
          Learning built for people who build
        </h1>
        <p className="text-white/80 mt-4 max-w-xl mx-auto">
          Access the complete library of courses, book summaries, and long-form essays — or go deeper with 1:1 mentorship.
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-primary-navy dark:text-white mb-10">
          Choose your plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers?.map((tier) => (
            <PricingCard
              key={tier.id}
              tierName={tier.tier_name}
              price={tier.price}
              billingPeriod={tier.billing_period}
              description={tier.description}
              features={tier.features}
              isPopular={tier.is_popular}
              priceId={tier.price_id}
              ctaLabel={tier.cta_label}
            />
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-primary-navy dark:text-white mb-10">
          Real examples, not generic case studies
        </h2>
        <CoursesGrid courses={courses ?? []} hasActiveSubscription={hasActiveSubscription} />
      </section>

      {/* Testimonials */}
      {membershipTestimonials && membershipTestimonials.length > 0 && (
        <section className="bg-trust-bg dark:bg-gray-950 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center text-primary-navy dark:text-white mb-10">
              What Members Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipTestimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  quote={t.quote}
                  authorName={t.author_name}
                  authorRole={t.author_role}
                  authorImgUrl={t.author_img_url}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Manage Membership (Fixed conditional wrapper) */}
      {hasActiveSubscription && subscription && !subscription.cancel_at_period_end && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center text-primary-navy mb-10">
            Manage your Membership
          </h2>
          <CancelDowngradePanel
            currentPlanLabel={subscription.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) + ' Plan' : ''}
            nextTier={subscription.tier ? DOWNGRADE_PATH[subscription.tier.toLowerCase()] ?? null : null}
          />
        </section>
      )}
    </main>
  );
}