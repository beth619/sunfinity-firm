import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role key to securely bypass RLS restrictions for backend email dispatch
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { subject, bodyContent } = await request.json();

        // 1. Fetch subscribers using admin client
        const { data: subscribers, error: subError } = await supabaseAdmin
            .from('subscribers')
            .select('email');

        if (subError) throw subError;

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ error: 'No subscribers found in database.' }, { status: 400 });
        }

        const recipients = subscribers.map((s) => s.email);

        // 2. Send via Resend
        const data = await resend.emails.send({
            from: 'SunFinity <onboarding@resend.dev>',
            to: recipients,
            subject: subject,
            text: bodyContent,
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}