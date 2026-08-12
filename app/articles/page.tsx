import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import ArticleCard from '@/app/components/ArticleCard/ArticleCard';

const categories = ['Strategy', 'Startups', 'Leadership', 'Essays'];

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; search?: string }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();

    let query = supabase
        .from('Articles')
        .select('*')
        .order('published_at', { ascending: false });

    if (params.category) {
        query = query.eq('category_tag', params.category);
    }

    if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
    }

    const { data: articles } = await query;

    function buildHref(changes: Record<string, string | undefined>) {
        const next = new URLSearchParams();
        const merged = { ...params, ...changes };
        Object.entries(merged).forEach(([key, value]) => {
            if (value) next.set(key, value);
        });
        return `/articles?${next.toString()}`;
    }

    return (
        <main className="bg-[#F2F2F7] dark:bg-black min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Content Hub</p>
                <h1 className="text-3xl font-bold text-primary-navy dark:text-white mt-2">Articles</h1>

                {/* Search */}
                <form action="/articles" method="GET" className="mt-8">
                    {params.category && <input type="hidden" name="category" value={params.category} />}
                    <input
                        type="text"
                        name="search"
                        defaultValue={params.search}
                        placeholder="Search articles"
                        className="w-full rounded-xl border border-primary-green bg-white dark:bg-gray-900 px-5 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                </form>

                {/* Category chips */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                        href={buildHref({ category: undefined })}
                        className={`px-4 py-2 rounded-full text-sm ${!params.category ? 'bg-primary-navy text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                    >
                        All
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            href={buildHref({ category: cat })}
                            className={`px-4 py-2 rounded-full text-sm ${params.category === cat ? 'bg-primary-navy text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>

                {/* Result count */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-8 mb-6">
                    Showing {articles?.length ?? 0} articles
                </p>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {articles?.map((article) => (
                        <ArticleCard
                            key={article.slug}
                            categoryTag={article.category_tag}
                            title={article.title}
                            description={article.description}
                            imgUrl={article.img_url}
                            link={article.slug}
                            date={article.published_at}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}