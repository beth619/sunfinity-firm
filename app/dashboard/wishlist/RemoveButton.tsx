'use client';

import React, { useTransition } from 'react';
import { removeBookFromWishlist } from './actions';

export default function RemoveButton({ wishlistItemId }: { wishlistItemId: string | number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await removeBookFromWishlist(wishlistItemId);
        });
      }}
      disabled={isPending}
      className="w-full inline-flex min-h-[40px] items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-900/50 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      {isPending ? 'Removing...' : 'Remove from List'}
    </button>
  );
}
