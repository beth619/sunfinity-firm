import React from 'react';

export interface TestimonialCardProps {
    quote: string;
    authorName: string;
    authorRole: string;
    authorImgUrl?: string;
    className?: string;
}

export default function TestimonialCard({
    quote,
    authorName,
    authorRole,
    authorImgUrl,
    className = '',
}: TestimonialCardProps) {
    return (
        <div
            className={`relative flex items-start gap-4 bg-white dark:bg-gray-900 rounded-lg border-l-4 border-primary-green p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
        >
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-trust-bg dark:bg-gray-800">
                {authorImgUrl ? (
                    <img
                        src={authorImgUrl}
                        alt={authorName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-navy dark:text-white font-semibold text-sm">
                        {authorName.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-3">
                <p className="font-light text-primary-navy dark:text-white text-base leading-normal">
                    {quote}
                </p>
                <p className="font-light text-gray-500 dark:text-gray-400 text-xs leading-normal">
                    {authorName}, {authorRole}
                </p>
            </div>
        </div>
    );
}