'use server';

import { stripe } from '@/lib/stripe';
import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import { revalidatePath } from 'next/cache';

export async function cancelSubscription() {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    return { error: 'Not authenticated' };
  }

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .maybeSingle();

  if (fetchError || !subscription?.stripe_subscription_id) {
    console.error('cancelSubscription: no active subscription found', fetchError?.message);
    return { error: 'No active subscription found' };
  }

  try {
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  } catch (err: any) {
    console.error('cancelSubscription: Stripe call failed', err.message);
    return { error: 'Failed to cancel subscription' };
  }

  await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('stripe_subscription_id', subscription.stripe_subscription_id);

  revalidatePath('/dashboard/memberships');
  return { success: true };
}

export async function downgradeSubscription(newTier: string) {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    return { error: 'Not authenticated' };
  }

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, tier')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .maybeSingle();

  if (fetchError || !subscription?.stripe_subscription_id) {
    console.error('downgradeSubscription: no active subscription found', fetchError?.message);
    return { error: 'No active subscription found' };
  }

  const { data: tierRow, error: tierError } = await supabase
    .from('pricing_tiers')
    .select('price_id')
    .eq('tier_name', newTier)
    .maybeSingle();

  if (tierError || !tierRow?.price_id) {
    console.error('downgradeSubscription: target tier not found', tierError?.message);
    return { error: 'Target plan not found' };
  }

  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    const currentItemId = stripeSubscription.items.data[0]?.id;

    if (!currentItemId) {
      return { error: 'Could not find subscription item to update' };
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [{ id: currentItemId, price: tierRow.price_id }],
      proration_behavior: 'none',
    });
  } catch (err: any) {
    console.error('downgradeSubscription: Stripe call failed', err.message);
    return { error: 'Failed to downgrade subscription' };
  }

  await supabase
    .from('subscriptions')
    .update({ tier: newTier })
    .eq('stripe_subscription_id', subscription.stripe_subscription_id);

  revalidatePath('/dashboard/memberships');
  return { success: true };
}
