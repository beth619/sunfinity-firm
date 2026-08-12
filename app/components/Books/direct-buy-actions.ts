'use server';

import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';

export async function recordDirectBuy(bookId: number) {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    return { success: true };
  }

  const { data: existing, error: selectError } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', appUser.id)
    .eq('book_id', bookId)
    .maybeSingle();

  if (selectError) {
    console.error('recordDirectBuy: select failed:', selectError.message);
    return { error: 'Something went wrong' };
  }

  if (!existing) {
    const { error: insertError } = await supabase
      .from('purchases')
      .insert({ user_id: appUser.id, book_id: bookId });

    if (insertError) {
      console.error('recordDirectBuy: insert failed:', insertError.message);
      return { error: 'Something went wrong' };
    }
  }

  return { success: true };
}