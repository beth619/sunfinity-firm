'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setBooks([]);
            setArticles([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const { data: bookResults } = await supabase
                    .from('books')
                    .select('title, slug, description, cover_image_url')
                    .ilike('title', `%${query}%`)
                    .limit(3);

                const { data: articleResults } = await supabase
                    .from('Articles')
                    .select('title, slug, description, category_tag')
                    .ilike('title', `%${query}%`)
                    .limit(3);

                setBooks(bookResults || []);
                setArticles(articleResults || []);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books, essays, and frameworks..."
                        autoFocus
                        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
                    />
                    <button
                        onClick={onClose}
                        className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                        ESC
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex flex-col gap-6">
                    {loading && (
                        <p className="text-center text-sm text-gray-400 py-4">Searching...</p>
                    )}

                    {!loading && query && books.length === 0 && articles.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-4">No results found for "{query}".</p>
                    )}

                    {books.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-green">Books</h3>
                            <div className="flex flex-col gap-2">
                                {books.map((book) => (
                                    <Link
                                        key={book.slug}
                                        href={`/books/${book.slug}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    >
                                        <div className="w-10 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                            {book.cover_image_url && <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary-navy dark:text-white">{book.title}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-1">{book.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {articles.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-green">Essays</h3>
                            <div className="flex flex-col gap-2">
                                {articles.map((article) => (
                                    <Link
                                        key={article.slug}
                                        href={`/articles/${article.slug}`}
                                        onClick={onClose}
                                        className="flex flex-col gap-1 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    >
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase">{article.category_tag}</span>
                                        <h4 className="text-sm font-bold text-primary-navy dark:text-white">{article.title}</h4>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {!query && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            Type something to search SunFinity...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}