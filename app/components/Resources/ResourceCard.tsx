import Link from 'next/link';

interface ResourceCardProps {
  imgUrl?: string | null;
  categoryTag?: string | null;
  fileType?: string | null;
  date?: string | null;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  isGated?: boolean | null;
  slug?: string | null;
}

export default function ResourceCard({
  imgUrl,
  categoryTag,
  fileType,
  date,
  title,
  description,
  fileUrl,
  isGated,
  slug,
}: ResourceCardProps) {
  const formattedDate = date ? new Date(date).toLocaleDateString() : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {imgUrl ? (
          <img src={imgUrl} alt={title || 'Resource'} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-navy to-primary-green flex items-center justify-center text-white text-sm font-semibold">
            {fileType || 'Resource'}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            <span>{categoryTag || fileType || 'Resource'}</span>
            {formattedDate && <span>{formattedDate}</span>}
          </div>

          <h3 className="text-xl font-bold text-primary-navy dark:text-white mb-2 line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
            {description}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0">
        {isGated && slug ? (
          // Routes to the unique gated resource detail page when is_gated is true
          <Link
            href={`/resources/${slug}`}
            className="inline-flex items-center justify-center w-full bg-primary-navy text-white dark:bg-primary-green dark:text-primary-navy text-sm font-semibold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Access Resource
          </Link>
        ) : fileUrl ? (
          // Direct file download for free resources
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-primary-navy text-white dark:bg-primary-green dark:text-primary-navy text-sm font-semibold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Download Free
          </a>
        ) : (
          <span className="inline-flex items-center justify-center w-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-sm font-semibold py-2.5 px-4 rounded-xl cursor-not-allowed">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}