'use client';

import { useEffect, useRef } from 'react';
import { saveArticleProgress } from './progress-actions';

export default function ArticleProgressTracker({ articleId }: { articleId: number }) {
    const hasSavedRef = useRef(false);

    useEffect(() => {
        const saveNow = () => {
            if (hasSavedRef.current) return; // avoid double-save if both events fire
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            if (percent > 2) {
                hasSavedRef.current = true;
                saveArticleProgress(articleId, percent);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') saveNow();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', saveNow);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', saveNow);
        };
    }, [articleId]);

    return null;
}