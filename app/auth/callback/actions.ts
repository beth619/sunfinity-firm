'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/app/utils/supabase/server';

export async function linkAppUserAfterAuth() {
  // Use the regular client only to identify who's currently signed in
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return;
  }

  // Everything below uses supabaseAdmin (service role, bypasses RLS)
  // because this operation is what ESTABLISHES the auth_id link that
  // RLS policies depend on — it can't be gated by a policy that
  // requires the link to already exist.
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
    if (!existingUser.auth_id) {
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