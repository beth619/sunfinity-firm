import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';
import ArticleCard from '@/app/components/ArticleCard/ArticleCard';
import BookCard from '@/app/components/Books/BookCard';
import ResourceCard from '@/app/components/Resources/ResourceCard';
import ArticleTOC from '@/app/components/ArticleTOC/ArticleTOC';
import ArticleProgressTracker from '@/app/components/ArticleProgress/ArticleProgressTracker';
import ResumeBanner from '@/app/components/ArticleProgress/ResumeBanner';
import Link from 'next/link';

interface ContentSection {
    heading: string;
    body: string;
    pullQuote?: string;
}

function slugifyHeading(heading: string) {
    return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (!slug) {
        return (
            <main className="bg-[#F2F2F7] dark:bg-black min-h-screen flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">Article not found.</p>
            </main>
        );
    }

    const { data: article } = await supabase
        .from('Articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (!article) {
        return (
            <main className="bg-[#F2F2F7] dark:bg-black min-h-screen flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">Article not found.</p>
            </main>
        );
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    let existingProgress: number | null = null;
    let hasActiveSubscription = false;

    if (user) {
        const { data: progressRow } = await supabase
            .from('progress')
            .select('progress_percent')
            .eq('article_id', article.id)
            .maybeSingle();
        existingProgress = progressRow?.progress_percent ?? null;

        const appUser = await getAppUser(supabase);
        if (appUser) {
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', appUser.id)
                .eq('status', 'active')
                .maybeSingle();
            hasActiveSubscription = !!subscription;
        }
    }

    const { data: relatedArticles } = await supabase
        .from('Articles')
        .select('*')
        .eq('category_tag', article.category_tag)
        .neq('slug', slug)
        .limit(2);

    let recommendedBooks: any[] = [];
    if (article.category_tag) {
        const { data: recommendedBooksRaw } = await supabase
            .from('books')
            .select('*')
            .contains('topic', [article.category_tag])
            .limit(3);
        recommendedBooks = recommendedBooksRaw ?? [];
    }

    let isTopicMatch = recommendedBooks.length > 0;

    if (!isTopicMatch) {
        const { data: featuredFallback } = await supabase
            .from('books')
            .select('*')
            .eq('is_featured', true)
            .limit(3);
        recommendedBooks = featuredFallback ?? [];
    }

    let premiumResource = null;
    if (article.category_tag) {
        const { data: resourceData } = await supabase
            .from('resources')
            .select('*')
            .eq('category', article.category_tag)
            .eq('is_gated', true)
            .limit(1)
            .maybeSingle();
        premiumResource = resourceData;
    }

    const sections: ContentSection[] = Array.isArray(article.content) ? article.content : [];

    return (
        <main className="bg-[#F2F2F7] dark:bg-black min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-16 pb-32">
                <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 items-start">
                    <div className="max-w-3xl">
                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-4">
                            {article.category_tag && (
                                <span className="text-xs font-semibold uppercase bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                                    {article.category_tag}
                                </span>
                            )}
                            {article.published_at && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(article.published_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Resume banner */}
                        {existingProgress !== null && existingProgress > 5 && existingProgress < 95 && (
                            <ResumeBanner percent={existingProgress} />
                        )}

                        {/* Title & description */}
                        <h1 className="text-3xl md:text-4xl font-bold text-primary-navy dark:text-white mb-3">
                            {article.title}
                        </h1>
                        {article.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{article.description}</p>
                        )}

                        {/* Author byline */}
                        {article.author_name && (
                            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-gray-200 dark:border-gray-800">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                                    {article.author_img_url && (
                                        <img
                                            src={article.author_img_url}
                                            alt={article.author_name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-primary-navy dark:text-white">{article.author_name}</p>
                                    {article.author_role && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{article.author_role}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Featured image */}
                        {article.img_url ? (
                            <img
                                src={article.img_url}
                                alt={article.title}
                                className="w-full h-80 object-cover rounded-xl mb-10"
                            />
                        ) : (
                            <div className="w-full h-80 bg-gradient-to-br from-primary-navy to-primary-green rounded-xl mb-10" />
                        )}

                        {/* Table of Contents (mobile only) */}
                        {sections.length > 0 && (
                            <nav className="lg:hidden mb-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                                    On this page
                                </p>
                                <ul className="flex flex-col gap-2">
                                    {sections.map((section, index) => (
                                        <li key={index}>
                                            <a
                                                href={`#${slugifyHeading(section.heading)}`}
                                                className="text-sm text-primary-navy dark:text-gray-300 hover:text-primary-green underline underline-offset-4"
                                            >
                                                {section.heading}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}

                        {/* Content sections */}
                        <div className="flex flex-col gap-10">
                            {sections.map((section, index) => (
                                <div key={index} id={slugifyHeading(section.heading)} className="scroll-mt-24">
                                    <h2 className="text-xl font-semibold text-primary-navy dark:text-white mb-4">
                                        {section.heading}
                                    </h2>
                                    <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {section.body}
                                    </p>
                                    {section.pullQuote && (
                                        <blockquote className="border-l-4 border-primary-green pl-4 italic text-gray-600 dark:text-gray-400 my-6">
                                            {section.pullQuote}
                                        </blockquote>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Share buttons */}
                        <div className="flex gap-3 mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <a
                                href={`https://twitter.com/intent/tweet?url=${siteUrl}/articles/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900"
                            >
                                Share on X
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}/articles/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900"
                            >
                                Share on LinkedIn
                            </a>
                        </div>

                        {/* Related articles */}
                        {relatedArticles && relatedArticles.length > 0 && (
                            <div className="mt-16">
                                <h2 className="text-xl font-bold text-primary-navy dark:text-white mb-2">
                                    More on {article.category_tag}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Related reads from the SunFinity library
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {relatedArticles.map((related) => (
                                        <ArticleCard
                                            key={related.slug}
                                            categoryTag={related.category_tag}
                                            title={related.title}
                                            description={related.description}
                                            imgUrl={related.img_url}
                                            link={related.slug}
                                            date={related.published_at}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Book recommendations */}
                        {recommendedBooks.length > 0 && (
                            <div className="mt-16">
                                <h2 className="text-xl font-bold text-primary-navy dark:text-white mb-2">
                                    {isTopicMatch ? `Books on ${article.category_tag}` : 'Featured picks from the library'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    {isTopicMatch
                                        ? `Because this article is about ${article.category_tag}`
                                        : 'A few reader favorites to get you started'}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {recommendedBooks.map((book: any) => (
                                        <BookCard
                                            key={book.slug}
                                            title={book.title}
                                            author={book.author}
                                            coverImageUrl={book.cover_image_url}
                                            price={Number(book.price)}
                                            amazonUrl={book.amazon_url}
                                            slug={book.slug}
                                            directBuyEnabled={Boolean(book.direct_buy_enabled)}
                                            directBuyDisabled={!book.file_url}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Premium resource embed */}
                        {premiumResource && (
                            <div className="mt-16">
                                <h2 className="text-xl font-bold text-primary-navy dark:text-white mb-2">
                                    Go deeper with a premium resource
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    {hasActiveSubscription
                                        ? 'Included with your membership'
                                        : 'Available with a SunFinity membership'}
                                </p>
                                <div className="max-w-sm">
                                    <ResourceCard
                                        imgUrl={premiumResource.img_url}
                                        categoryTag={premiumResource.category}
                                        fileType={premiumResource.file_type}
                                        date={premiumResource.date}
                                        title={premiumResource.title}
                                        description={premiumResource.description}
                                        fileUrl={hasActiveSubscription ? premiumResource.file_url : undefined}
                                        isGated={premiumResource.is_gated}
                                    />
                                </div>
                                {!hasActiveSubscription && (
                                    <a
                                        href="/courses#pricing"
                                        className="inline-block mt-3 text-sm font-semibold text-primary-green hover:underline"
                                    >
                                        See membership plans →
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Unified Sticky Desktop Sidebar with matching Card Style and Full-Height Sticky Scope */}
                    <aside className="hidden lg:flex lg:flex-col lg:gap-6 sticky top-24 self-start">
                        {sections.length > 0 && (
                            <ArticleTOC
                                sections={sections.map((s) => ({
                                    heading: s.heading,
                                    id: slugifyHeading(s.heading),
                                }))}
                            />
                        )}

                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                                Books We Recommend
                            </p>
                            <div className="flex flex-col gap-4">
                                {recommendedBooks.map((book: any) => (
                                    <Link
                                        key={book.slug}
                                        href={`/books/${book.slug}`}
                                        className="flex items-center gap-3 group"
                                    >
                                        {book.cover_image_url ? (
                                            <img
                                                src={book.cover_image_url}
                                                alt={book.title}
                                                className="w-10 h-14 object-cover rounded border border-gray-200 dark:border-gray-800 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-14 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-primary-navy dark:text-white truncate group-hover:text-primary-green">
                                                {book.title}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                {book.author}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {article.author_name && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                                    About the Author
                                </p>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                                        {article.author_img_url && (
                                            <img
                                                src={article.author_img_url}
                                                alt={article.author_name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-primary-navy dark:text-white truncate">
                                            {article.author_name}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            {article.author_role || 'Editor and writer focusing on product strategy and engineering.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {user && <ArticleProgressTracker articleId={article.id} />}
        </main>
    );
}