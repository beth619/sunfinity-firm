'use server';

import { createClient } from '@/app/utils/supabase/server';
import { getAppUser } from '@/app/utils/get-app-user';

export async function saveArticleProgress(articleId: number, percent: number) {
    const supabase = await createClient();
    const appUser = await getAppUser(supabase);

    if (!appUser) {
        return { skipped: true };
    }

    const clampedPercent = Math.max(0, Math.min(100, Math.round(percent)));

    const { error } = await supabase
        .from('progress')
        .upsert(
            { user_id: appUser.id, article_id: articleId, progress_percent: clampedPercent },
            { onConflict: 'user_id,article_id' }
        );

    if (error) {
        console.error('saveArticleProgress failed:', error.message);
        return { error: 'Failed to save progress' };
    }

    return { success: true };
}