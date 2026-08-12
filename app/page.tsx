import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import ArticleCard from '@/app/components/ArticleCard/ArticleCard';
import TestimonialCard from '@/app/components/Testimonals/TestimonialCard';
import NewsletterForm from '@/app/components/Newsletter/NewsletterForm';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: featuredBook } = await supabase
    .from('books')
    .select('*')
    .eq('is_featured', true)
    .single();

  const { data: featuredTestimonial } = await supabase
    .from('testimonals')
    .select('*')
    .eq('book_id', featuredBook?.id)
    .single();

  const { data: latestArticles } = await supabase
    .from('Articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3);

  const { data: continueReading } = user
    ? await supabase
      .from('progress')
      .select('progress_percent, articles(*)')
      .eq('user_id', user.id)
      .not('article_id', 'is', null)
    : { data: null };

  return (
    <main className="flex flex-col">
      {/* Hero & Welcome Wrapper (Unified at max-w-5xl) */}
      <section className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-4">

        {/* Sleek Welcome Back Card */}
        {user && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-green">
                Welcome Back
              </span>
              <p className="text-sm font-medium text-primary-navy dark:text-white">
                Ready to pick up where you left off? Jump back into your reading list.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-primary-navy dark:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Dashboard →
            </Link>
          </div>
        )}

        {/* Featured Book Hero Card */}
        {featuredBook && (
          <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="md:w-1/2 aspect-[4/3] md:aspect-auto bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4">
              {featuredBook.cover_image_url ? (
                <img
                  src={featuredBook.cover_image_url}
                  alt={featuredBook.title}
                  className="w-full h-full max-h-[350px] object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-navy to-primary-green" />
              )}
            </div>
            <div className="md:w-1/2 flex flex-col justify-center gap-3 p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-green">
                Featured Book
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-navy dark:text-white">
                {featuredBook.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {featuredBook.description}
              </p>
              <div className="flex gap-3 mt-2">
                <Link
                  href={`/books/${featuredBook.slug}`}
                  className="bg-primary-green text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Get the Book
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Framed Trust Bar Container (Aligned to max-w-5xl) */}
      <section className="max-w-5xl mx-auto w-full px-6 py-2">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-6 px-8 shadow-sm text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            Trusted by readers & builders from top tech ecosystems
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-300">
            <span className="hover:text-primary-green transition-colors cursor-default">TECHSTARS</span>
            <span className="hover:text-primary-green transition-colors cursor-default">PRODUCT HUNT</span>
            <span className="hover:text-primary-green transition-colors cursor-default">INDIE HACKERS</span>
            <span className="hover:text-primary-green transition-colors cursor-default">Y COMBINATOR</span>
            <span className="hover:text-primary-green transition-colors cursor-default">GITHUB</span>
          </div>
        </div>
      </section>

      {/* Continue Reading */}
      {continueReading && continueReading.length > 0 && (
        <section className="max-w-5xl mx-auto w-full px-6 py-10">
          <h2 className="text-xl font-bold text-primary-navy dark:text-white mb-6">
            Continue Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continueReading.map((item: any) => {
              const rawArticle = Array.isArray(item.articles) ? item.articles[0] : item.articles;
              const article = rawArticle as Record<string, any> | null;
              if (!article) return null;

              return (
                <ArticleCard
                  key={article.slug}
                  categoryTag={article.category_tag}
                  title={article.title}
                  description={article.description}
                  imgUrl={article.img_url}
                  link={article.slug}
                  date={article.published_at}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Testimonial */}
      {featuredTestimonial && (
        <section className="max-w-5xl mx-auto w-full px-6 py-12">
          <TestimonialCard
            quote={featuredTestimonial.quote}
            authorName={featuredTestimonial.author_name}
            authorRole={featuredTestimonial.author_role}
            authorImgUrl={featuredTestimonial.author_img_url}
          />
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles && latestArticles.length > 0 && (
        <section className="max-w-5xl mx-auto w-full px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary-navy dark:text-white">
              Latest Essays
            </h2>
            <Link href="/articles" className="text-sm font-medium text-primary-green hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
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
        </section>
      )}

      {/* Email Capture Anchor */}
      <section className="max-w-5xl mx-auto w-full px-6 py-16">
        <div className="bg-primary-navy rounded-2xl p-8 md:p-10 border border-gray-800 shadow-lg flex flex-col md:flex-row items-center gap-8">

          {/* Featured Book Cover Thumbnail Preview */}
          <div className="w-24 h-32 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-gray-800 border border-gray-700 flex items-center justify-center p-1">
            {featuredBook?.cover_image_url ? (
              <img
                src={featuredBook.cover_image_url}
                alt={featuredBook.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-navy to-primary-green" />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2 text-white text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Get a Free Chapter of {featuredBook?.title ?? 'Our Latest Book'}
            </h2>
            <p className="text-sm text-gray-300">
              Curated essays, book notes, and frameworks. No noise, no spam.
            </p>

            <NewsletterForm
              variant="dark"
              className="mt-3"
              formClassName="flex flex-col sm:flex-row gap-3"
              inputClassName="flex-1 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-green"
              buttonClassName="bg-primary-green text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            />

            <p className="text-[11px] text-gray-400 mt-1">
              We'll only ever email you about new essays and books — unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}