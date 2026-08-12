'use server';

import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import { revalidatePath } from 'next/cache';

export async function removeBookFromWishlist(wishlistItemId: string | number) {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);

  if (!appUser) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', wishlistItemId)
    .eq('user-id', appUser.id);

  if (error) {
    console.error('Failed to remove book from wishlist:', error);
    throw new Error('Failed to remove book from wishlist');
  }

  revalidatePath('/dashboard/reading-list');
}
