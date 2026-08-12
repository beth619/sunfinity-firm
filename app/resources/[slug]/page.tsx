import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';

interface ResourceDetailPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Check if resource is unlocked via cookie
    const cookieStore = await cookies();
    const isUnlocked = cookieStore.get(`unlocked_${slug}`)?.value === 'true';

    // 2. Fetch the specific resource matching the slug from Supabase
    const { data: resource, error } = await supabase
        .from('resources')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !resource) {
        notFound();
    }

    async function unlockResourceAction(formData: FormData) {
        'use server';
        const email = formData.get('email') as string;
        if (!email) return;

        const actionSupabase = await createClient();
        // Insert email into subscribers. Ignore errors (e.g., if already subscribed).
        await actionSupabase.from('subscribers').insert({ email });
        
        const actionCookies = await cookies();
        actionCookies.set(`unlocked_${slug}`, 'true', { maxAge: 60 * 60 * 24 * 365, path: '/' });
    }

    return (
        <main className="bg-[#F2F2F7] min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/resources" className="text-sm font-semibold text-gray-500 hover:text-primary-navy mb-6 inline-block">
                    ← Back to Resources
                </Link>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-8 flex flex-col md:flex-row gap-8">
                    {/* Resource Cover / Preview */}
                    <div className="md:w-1/3 aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {resource.img_url ? (
                            <img src={resource.img_url} alt={resource.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-navy to-primary-green flex items-center justify-center text-white font-bold">
                                {resource.file_type || 'Resource'}
                            </div>
                        )}
                    </div>

                    {/* Details & Conditional Access */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-green">
                                {resource.category} • {resource.file_type}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-primary-navy">
                                {resource.title}
                            </h1>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {resource.description}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
                            {isUnlocked ? (
                                // User HAS unlocked -> Show direct download access
                                <>
                                    <p className="text-xs text-green-600 font-medium">
                                        ✓ Resource unlocked! You can now download the file.
                                    </p>
                                    {resource.file_url ? (
                                        <a
                                            href={resource.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center w-full bg-primary-green text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-sm"
                                        >
                                            Download Resource Now →
                                        </a>
                                    ) : (
                                        <span className="text-sm text-red-500 font-medium">File coming soon.</span>
                                    )}
                                </>
                            ) : (
                                // User HAS NOT unlocked -> Require email
                                <>
                                    <p className="text-xs text-amber-600 font-medium">
                                        🔒 Enter your email to unlock this free resource.
                                    </p>
                                    <form action={unlockResourceAction} className="flex flex-col gap-3">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Your email address"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-green"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full inline-flex items-center justify-center bg-primary-navy text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity text-sm"
                                        >
                                            Unlock Download
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}