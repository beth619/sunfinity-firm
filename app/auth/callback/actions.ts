'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/app/utils/supabase/server';

export async function linkAppUserAfterAuth() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return;
  }

  const { data: existingUser, error: selectError } = await supabaseAdmin
    .from('users')
    .select('id, auth_id')
    .eq('email', authUser.email)
    .maybeSingle();

  if (selectError) {
    console.error('linkAppUserAfterAuth: select failed:', selectError.message);
    return;
  }

  if (existingUser) {
    // Always keep auth_id in sync with the current session — not just
    // when it's empty. This self-heals stale links from old test/auth
    // accounts instead of leaving them broken silently.
    if (existingUser.auth_id !== authUser.id) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ auth_id: authUser.id })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('linkAppUserAfterAuth: update failed:', updateError.message);
      }
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({ email: authUser.email, auth_id: authUser.id });

    if (insertError) {
      console.error('linkAppUserAfterAuth: insert failed:', insertError.message);
    }
  }
}