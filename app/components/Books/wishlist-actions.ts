'use server';

import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(bookId: number) {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    return { requiresLogin: true };
  }

  const { data: existing, error: selectError } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user-id', appUser.id)
    .eq('book-id', bookId)
    .maybeSingle();

  if (selectError) {
    console.error('toggleWishlist: select failed:', selectError.message);
    return { error: 'Failed to check wishlist status' };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id)
      .eq('user-id', appUser.id);

    if (deleteError) {
      console.error('toggleWishlist: delete failed:', deleteError.message);
      return { error: 'Failed to remove from wishlist' };
    }
  } else {
    const { error: insertError } = await supabase
      .from('wishlist')
      .insert({ 'user-id': appUser.id, 'book-id': bookId });

    if (insertError) {
      console.error('toggleWishlist: insert failed:', insertError.message);
      return { error: 'Failed to add to wishlist' };
    }
  }

  revalidatePath('/books');
  revalidatePath('/dashboard/reading-list');
  return { success: true };
}
