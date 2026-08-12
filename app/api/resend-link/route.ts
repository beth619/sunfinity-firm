import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Check if this email exists in our users table
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) {
    // Don't reveal whether the email exists — same message either way
    return NextResponse.json({ message: 'If that email is registered, a link has been sent.' })
  }

  const { error } = await supabaseAdmin.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Resend link failed:', error)
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 })
  }

  return NextResponse.json({ message: 'If that email is registered, a link has been sent.' })
}