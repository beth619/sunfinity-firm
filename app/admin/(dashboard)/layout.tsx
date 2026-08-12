import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isAdmin = user?.email === process.env.ADMIN_EMAIL;

    if (!user || !isAdmin) {
        redirect('/admin/login');
    }

    return <>{children}</>;
}