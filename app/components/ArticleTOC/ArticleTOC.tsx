'use client';

import { useEffect, useState } from 'react';

interface TOCItem {
    heading: string;
    id: string;
}

export default function ArticleTOC({ sections }: { sections: TOCItem[] }) {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -70% 0px' }
        );

        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sections]);

    if (sections.length === 0) return null;

    return (
        <nav className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                On this page
            </p>
            <ul className="flex flex-col gap-2 border-l border-gray-200 dark:border-gray-800">
                {sections.map(({ heading, id }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={`block pl-4 -ml-px border-l-2 py-1 text-sm transition-colors ${activeId === id
                                ? 'border-primary-green text-primary-navy dark:text-white font-medium'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-navy dark:hover:text-white'
                                }`}
                        >
                            {heading}
                        </a>
                    </li>
                ))}
            </ul>
        </nav >
    );
}