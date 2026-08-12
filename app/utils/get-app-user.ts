import { SupabaseClient } from '@supabase/supabase-js';

export async function getAppUser(supabase: SupabaseClient) {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    return null;
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('id, email, name, stripe_customer_id')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  return appUser || null;
}
