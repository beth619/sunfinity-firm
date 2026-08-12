'use client';

import Link from 'next/link';

export interface CourseCardProps {
    thumbnailUrl?: string;
    categoryTag: string;
    title: string;
    description: string;
    status: 'locked' | 'unlocked';
    slug: string;
    onSubscribeClick: () => void;
    progressPercent?: number;
}

export default function CourseCard({
    thumbnailUrl,
    categoryTag,
    title,
    description,
    status,
    slug,
    onSubscribeClick,
    progressPercent,
}: CourseCardProps) {
    return status === 'unlocked' ? (
        <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-navy to-primary-green" />
                )}
                <img
                    src="/play.svg"
                    alt="Play"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10"
                />
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
                <p className="text-xs uppercase text-gray-500">{categoryTag}</p>
                <h3 className="text-lg font-semibold text-primary-navy dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {description}
                </p>

                {progressPercent !== undefined && (
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                        <div
                            className="h-full bg-primary-green"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                )}

                <Link
                    href={`/courses/${slug}`}
                    className="mt-auto bg-primary-navy text-white text-center rounded-lg py-2 px-4 font-medium hover:opacity-90"
                >
                    Continue Course
                </Link>
            </div>
        </div>
    ) : (
        <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-navy to-primary-green" />
                )}
                <img
                    src="/lock.svg"
                    alt="Locked"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10"
                />
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
                <p className="text-xs uppercase text-gray-500">{categoryTag}</p>
                <h3 className="text-lg font-semibold text-primary-navy dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {description}
                </p>
                <button
                    onClick={onSubscribeClick}
                    className="mt-auto border border-primary-navy text-primary-navy dark:text-white dark:border-white rounded-lg py-2 px-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    Subscribe
                </button>
            </div>
        </div>
    );
}