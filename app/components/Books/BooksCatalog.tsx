'use client';

import React, { useState, useMemo } from 'react';
import WishlistBookCard from './WishlistBookCard';
import FilterChipGroup from './FilterChipGroup';
import FilterChip from './FilterChip';

export interface BookRow {
  id: number;
  title: string;
  author: string;
  cover_image_url: string;
  price: number;
  amazon_url: string;
  slug: string;
  direct_buy_enabled: boolean;
  topic?: string[];
  format?: string[];
  created_at?: string;
  file_url?: string | null;
}

export interface BooksCatalogProps {
  books: BookRow[];
  wishlistedBookIds: number[];
  isLoggedIn: boolean;
}

const TOPIC_OPTIONS = ['All', 'Scaling', 'Startups', 'Leadership', 'Essays'];
const FORMAT_OPTIONS = ['All Formats', 'Physical', 'eBook', 'Bundle'];
const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest first'];

const ITEMS_PER_PAGE = 24;

export default function BooksCatalog({ books, wishlistedBookIds, isLoggedIn }: BooksCatalogProps) {
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [selectedSort, setSelectedSort] = useState('Recommended');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Price bounds derived from actual catalog data, so the slider
  // always reflects real min/max as books are added over time
  const priceExtent = useMemo(() => {
    if (books.length === 0) return { min: 0, max: 0 };
    const prices = books.map((b) => Number(b.price));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [books]);

  // null means "user hasn't touched the slider" -> defaults to showing everything
  const effectiveMaxPrice = maxPriceFilter ?? priceExtent.max;

  // Handle filter changes and reset page to 1
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  const handlePriceChange = (value: number) => {
    setMaxPriceFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedTopic('All');
    setSelectedFormat('All Formats');
    setSelectedSort('Recommended');
    setMaxPriceFilter(null);
    setCurrentPage(1);
  };

  // Filter books client-side
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Topic filtering (topic is an array — book can belong to multiple)
      if (selectedTopic !== 'All') {
        if (!book.topic?.some((t) => t.toLowerCase() === selectedTopic.toLowerCase())) {
          return false;
        }
      }
      // Format filtering (format is an array — book can have multiple)
      if (selectedFormat !== 'All Formats') {
        if (!book.format?.some((f) => f.toLowerCase() === selectedFormat.toLowerCase())) {
          return false;
        }
      }
      // Price filtering
      if (Number(book.price) > effectiveMaxPrice) {
        return false;
      }
      return true;
    });
  }, [books, selectedTopic, selectedFormat, effectiveMaxPrice]);

  // Sort filtered books
  const sortedBooks = useMemo(() => {
    const list = [...filteredBooks];
    switch (selectedSort) {
      case 'Price: Low to High':
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case 'Price: High to Low':
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case 'Newest first':
        return list.sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        );
      case 'Recommended':
      default:
        return list;
    }
  }, [filteredBooks, selectedSort]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBooks = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedBooks, validCurrentPage]);

  const filtersActive =
    selectedTopic !== 'All' || selectedFormat !== 'All Formats' || maxPriceFilter !== null;

  return (
    <div className="w-full">
      {/* Page Header */}
      <header className="mb-10 border-b border-gray-200 pb-8 dark:border-gray-800">
        <h1 className="text-4xl font-light tracking-tight text-[#14213D] dark:text-white sm:text-5xl">
          Books &amp; Shop
        </h1>
        <p className="mt-3 text-base font-normal text-gray-600 dark:text-gray-400 sm:text-lg">
          {books.length} curated titles for builders and thinkers
        </p>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters (~220px wide) */}
        <aside className="w-full shrink-0 md:w-[220px]">
          <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-[#14213D] dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
              Filters
            </h3>

            {/* Topics Filter Group */}
            <FilterChipGroup
              groupLabel="Topics"
              options={TOPIC_OPTIONS}
              selected={selectedTopic}
              onChange={handleTopicChange}
            />

            {/* Format Filter Group */}
            <FilterChipGroup
              groupLabel="Format"
              options={FORMAT_OPTIONS}
              selected={selectedFormat}
              onChange={handleFormatChange}
            />

            {/* Price Range Filter */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14213D] dark:text-gray-300">
                Price Range
              </h4>
              <input
                type="range"
                min={priceExtent.min}
                max={priceExtent.max}
                value={effectiveMaxPrice}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full accent-[#14213D] dark:accent-emerald-500"
                aria-label="Maximum price"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>${priceExtent.min}</span>
                <span className="font-semibold text-[#14213D] dark:text-white">
                  Up to ${effectiveMaxPrice}
                </span>
                <span>${priceExtent.max}</span>
              </div>
            </div>

            {/* Clear / Reset Filters if modified */}
            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs font-semibold text-[#14213D] underline underline-offset-4 hover:text-[#1F7A4D] dark:text-gray-300 dark:hover:text-emerald-400 text-left"
              >
                Reset Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Sort & Results Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Showing{' '}
              <span className="font-bold text-[#14213D] dark:text-white">
                {sortedBooks.length}
              </span>{' '}
              of{' '}
              <span className="font-bold text-[#14213D] dark:text-white">
                {books.length}
              </span>{' '}
              Books
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14213D] dark:text-gray-300 mr-1">
                SORT:
              </span>
              {SORT_OPTIONS.map((option) => (
                <FilterChip
                  key={option}
                  label={option}
                  isSelected={selectedSort === option}
                  onClick={() => handleSortChange(option)}
                />
              ))}
            </div>
          </div>

          {/* Book Grid or Empty State */}
          {sortedBooks.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-[#14213D] dark:text-white">
                No matching books found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try selecting a different topic, format, or price range.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#14213D] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1F7A4D] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedBooks.map((book) => (
                  <WishlistBookCard
                    key={book.slug}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    coverImageUrl={book.cover_image_url}
                    price={Number(book.price)}
                    amazonUrl={book.amazon_url}
                    slug={book.slug}
                    directBuyEnabled={Boolean(book.direct_buy_enabled)}
                    isWishlisted={wishlistedBookIds.includes(book.id)}
                    isLoggedIn={isLoggedIn}
                    fileUrl={book.file_url ?? null}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-2 pt-6 border-t border-gray-200 dark:border-gray-800"
                >
                  {/* Previous Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={validCurrentPage === 1}
                    className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    aria-label="Previous Page"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-sm font-semibold transition-all shadow-sm ${isActive
                          ? 'bg-[#14213D] text-white border border-[#14213D]'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={validCurrentPage === totalPages}
                    className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    aria-label="Next Page"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}