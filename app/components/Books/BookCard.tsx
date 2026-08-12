'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface BookCardProps {
  title: string;
  author: string;
  coverImageUrl: string;
  price: number;
  amazonUrl: string;
  slug: string;
  directBuyEnabled: boolean;
  directBuyDisabled?: boolean;
  directBuyUrl?: string;
  onDirectBuy?: (slug: string) => void;
  className?: string;
}

export default function BookCard({
  title,
  author,
  coverImageUrl,
  price,
  amazonUrl,
  slug,
  directBuyEnabled,
  directBuyDisabled = false,
  directBuyUrl,
  onDirectBuy,
  className = '',
}: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  const handleDirectBuyClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.stopPropagation();
    if (onDirectBuy) {
      onDirectBuy(slug);
    }
  };

  const handleAmazonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const detailUrl = `/books/${slug}`;
  const defaultDirectBuyTarget = directBuyUrl || `/checkout?book=${slug}`;

  return (
    <article
      className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <Link
        href={detailUrl}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1F7A4D] focus:ring-offset-2"
        aria-label={`View details for ${title} by ${author}`}
      >
        <span className="sr-only">View {title}</span>
      </Link>

      <div className="relative mb-4 aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        {!imageError && coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={`Cover image for ${title}`}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#14213D] to-[#1F7A4D] text-white">
            <svg
              className="mb-2 h-10 w-10 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="line-clamp-3 text-xs font-semibold uppercase tracking-wider">
              {title}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#14213D] transition-colors group-hover:text-[#1F7A4D] dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
          by {author}
        </p>

        <div className="mt-3 text-xl font-bold text-[#14213D] dark:text-emerald-400">
          {formattedPrice}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        {directBuyEnabled && (
          directBuyDisabled ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Not available for direct download yet"
              className="inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            >
              Buy Direct
            </button>
          ) : onDirectBuy ? (
            <button
              type="button"
              onClick={handleDirectBuyClick}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#1F7A4D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#18623d] active:bg-[#124b2e] focus:outline-none focus:ring-2 focus:ring-[#1F7A4D] focus:ring-offset-2"
            >
              Buy Direct
            </button>
          ) : (
            <a
              href={defaultDirectBuyTarget}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#1F7A4D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#18623d] active:bg-[#124b2e] focus:outline-none focus:ring-2 focus:ring-[#1F7A4D] focus:ring-offset-2 text-center"
            >
              Buy Direct
            </a>
          )
        )}

        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAmazonClick}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[#14213D] underline underline-offset-4 transition-colors hover:text-[#1F7A4D] hover:bg-gray-50 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#14213D] focus:ring-offset-2"
          aria-label={`Buy ${title} on Amazon (opens in a new tab)`}
        >
          Buy on Amazon
        </a>
      </div>
    </article>
  );
}