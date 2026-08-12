import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any
        const email = session.customer_details?.email
        const customerId = session.customer
        const stripeSubscriptionId = session.subscription as string

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        const priceId = lineItems.data[0]?.price?.id

        const { data: tierRow } = await supabaseAdmin
            .from('pricing_tiers')
            .select('tier_name')
            .eq('price_id', priceId)
            .single()

        const tierName = tierRow?.tier_name || 'unknown'

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .upsert({ email, stripe_customer_id: customerId }, { onConflict: 'email' })
            .select()
            .single()
        if (userError) {
            console.error('User upsert failed:', userError)
            return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
        }

        const { error: deactivateError } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', user.id)
            .eq('status', 'active')

        if (deactivateError) {
            console.error('Deactivating old subscriptions failed:', deactivateError)
        }

        const { error: subError } = await supabaseAdmin.from('subscriptions').insert({
            user_id: user.id,
            tier: tierName,
            status: 'active',
            stripe_subscription_id: stripeSubscriptionId,
        })
        if (subError) {
            console.error('Subscription insert failed:', subError)
            return NextResponse.json({ error: 'Subscription creation failed' }, { status: 500 })
        }

        const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        })

        if (magicLinkError) {
            console.error('Magic link send failed:', magicLinkError)
        }
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any
        const status = subscription.status
        const cancelAtPeriodEnd = subscription.cancel_at_period_end

        const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status, cancel_at_period_end: cancelAtPeriodEnd })
            .eq('stripe_subscription_id', subscription.id)

        if (error) {
            console.error('Subscription update failed:', error)
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any

        const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id)

        if (error) {
            console.error('Subscription cancellation update failed:', error)
        }
    }

    return NextResponse.json({ received: true })
}