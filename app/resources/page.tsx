import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import ResourceCard from '@/app/components/Resources/ResourceCard';

const categories = ['Startups', 'Scaling', 'Leadership', 'Toolkits', 'Woman in Business', 'MENA Stories'];
const types = ['PDF', 'Template', 'Checklist', 'Video', 'Case Study', 'Framework'];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string; free?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('resources').select('id, title, description, img_url, category, file_type, date, file_url, is_gated, slug');

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.type) {
    query = query.eq('file_type', params.type);
  }

  if (params.free === 'true') {
    query = query.eq('is_gated', false);
  }

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  const { data: resources } = await query;

  // Clean filter builder with mutually exclusive logic for Free vs File Types
  function buildHref(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    const merged: Record<string, string | undefined> = { ...params, ...changes };

    if ('free' in changes) {
      if (changes.free === undefined) {
        delete merged.free;
      } else {
        delete merged.type; // Clears specific file types when Free is toggled
      }
    }
    if ('type' in changes) {
      if (changes.type === undefined) {
        delete merged.type;
      } else {
        delete merged.free; // Clears Free when a specific file type is toggled
      }
    }

    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        next.set(key, value);
      }
    });

    const res = next.toString();
    return res ? `/resources?${res}` : '/resources';
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Library</p>
        <h1 className="text-3xl font-bold text-primary-navy dark:text-white mt-2">Resources & Downloads</h1>

        {/* Search */}
        <form action="/resources" method="GET" className="mt-8">
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.type && <input type="hidden" name="type" value={params.type} />}
          {params.free && <input type="hidden" name="free" value={params.free} />}
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search frameworks, templates, toolkits"
            className="w-full rounded-xl border border-primary-green px-5 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href={buildHref({ category: undefined })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!params.category
                ? 'bg-primary-navy text-white dark:bg-primary-green dark:text-primary-navy font-semibold'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={buildHref({ category: cat })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${params.category === cat
                  ? 'bg-primary-navy text-white dark:bg-primary-green dark:text-primary-navy font-semibold'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Type chips / Free Filter */}
        <div className="flex flex-wrap gap-3 mt-3">
          <Link
            href={buildHref({ free: params.free === 'true' ? undefined : 'true' })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${params.free === 'true'
                ? 'bg-primary-navy text-white dark:bg-primary-green dark:text-primary-navy font-semibold'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
          >
            Free
          </Link>
          {types.map((t) => (
            <Link
              key={t}
              href={buildHref({ type: params.type === t ? undefined : t })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${params.type === t
                  ? 'bg-primary-navy text-white dark:bg-primary-green dark:text-primary-navy font-semibold'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-8 mb-6">
          Showing {resources?.length ?? 0} resources
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources?.map((resource) => (
            <ResourceCard
              key={resource.id}
              imgUrl={resource.img_url}
              categoryTag={resource.category}
              fileType={resource.file_type}
              date={resource.date}
              title={resource.title}
              description={resource.description}
              fileUrl={resource.file_url}
              isGated={resource.is_gated}
              slug={resource.slug}
            />
          ))}
        </div>
      </div>
    </main>
  );
}