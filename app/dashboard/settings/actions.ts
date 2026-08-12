"use server";
import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import { revalidatePath } from 'next/cache';

export async function updateDisplayName(formData: FormData) {
  const name = formData.get('name');
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { error: 'Name cannot be empty.' };
  }
  
  if (name.trim().length > 100) {
    return { error: 'Name must be 100 characters or less.' };
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'You must be logged in to update your name.' };
  }
  
  const appUser = await getAppUser(supabase);
  
  if (!appUser) {
    return { error: 'User profile not found.' };
  }

  const { error } = await supabase
    .from('users')
    .update({ name: name.trim() })
    .eq('id', appUser.id);
    
  if (error) {
    console.error('Failed to update name:', error);
    return { error: 'Failed to update name. Please try again.' };
  }
  
  revalidatePath('/dashboard', 'layout');
  
  return { success: true };
}
