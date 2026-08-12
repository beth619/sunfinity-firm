import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout redirects unauthenticated users
  }

  const appUser = await getAppUser(supabase);


  return (
    <div className="h-full min-h-screen py-12 px-6 lg:px-12 max-w-4xl mx-auto flex flex-col items-start justify-center">
      <h1 className="text-3xl font-bold text-primary-navy mb-8">
        Account Settings
      </h1>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full">
        <h2 className="text-xl font-bold text-primary-navy mb-6">Profile</h2>
        <SettingsForm initialName={appUser?.name || ''} />
      </div>
    </div>
  );
}
