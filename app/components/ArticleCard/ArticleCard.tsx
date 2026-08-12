import Link from 'next/link';

interface ArticleCardProps {
  categoryTag: string;
  title: string;
  description: string;
  imgUrl?: string;
  link: string;
  date: string;
}

export default function ArticleCard({
  categoryTag,
  title,
  description,
  imgUrl,
  link,
  date,
}: ArticleCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Image container using object-contain so nothing gets cut off */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-3">
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-navy to-primary-green" />
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-gray-400">
            <span>{categoryTag}</span>
            <span>{date}</span>
          </div>
          <h3 className="text-lg font-bold text-primary-navy dark:text-white line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Read More Link (Green & Underlined) */}
        <div>
          <Link
            href={`/articles/${link}`}
            className="text-sm font-semibold text-primary-green underline hover:opacity-85 transition-opacity inline-flex items-center gap-1"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
}