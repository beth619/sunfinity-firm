import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.signOut()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.redirect(new URL('/', request.url), { status: 303 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
