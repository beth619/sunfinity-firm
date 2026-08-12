'use client';

import { useState, useTransition } from 'react';
import { cancelSubscription, downgradeSubscription } from './actions';

interface CancelDowngradePanelProps {
  currentPlanLabel: string;
  nextTier: string | null;
}

export default function CancelDowngradePanel({ currentPlanLabel, nextTier }: CancelDowngradePanelProps) {
  const [view, setView] = useState<'cancel' | 'downgrade'>('cancel');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const nextTierLabel = nextTier ? nextTier.charAt(0).toUpperCase() + nextTier.slice(1) : '';

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result?.error) setErrorMsg(result.error);
    });
  };

  const handleDowngrade = () => {
    if (!nextTier) return;
    startTransition(async () => {
      const result = await downgradeSubscription(nextTier);
      if (result?.error) setErrorMsg(result.error);
    });
  };

  if (dismissed) return null;

  if (view === 'downgrade') {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-semibold text-primary-navy">
          Switch to {nextTierLabel}?
        </h2>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          This takes effect right away. We won't refund the difference for the rest of your current period, but your next bill will reflect the {nextTierLabel} price.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setView('cancel')}
            disabled={isPending}
            className="rounded-lg bg-primary-navy px-6 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors disabled:opacity-50"
          >
            Never Mind
          </button>
          <button
            type="button"
            onClick={handleDowngrade}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Switching...' : `Switch to ${nextTierLabel}`}
          </button>
        </div>
        {errorMsg && <p className="text-xs text-red-600 mt-4">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
      <h2 className="text-2xl font-semibold text-primary-navy">
        Cancel your {currentPlanLabel} membership?
      </h2>
      <p className="text-gray-500 mt-3 max-w-md mx-auto">
        You'll keep access until the end of your current billing period. No fees, no penalty — you're welcome back anytime.
      </p>
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          disabled={isPending}
          className="rounded-lg bg-primary-navy px-6 py-3 text-sm font-semibold text-white hover:bg-primary-green transition-colors disabled:opacity-50"
        >
          Keep My Membership
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Cancelling...' : 'Cancel Membership'}
        </button>
      </div>
      {nextTier && (
        <p className="text-sm text-gray-500 mt-4">
          Prefer to downgrade instead of cancel?{' '}
          <button
            type="button"
            onClick={() => setView('downgrade')}
            className="underline underline-offset-2 hover:text-primary-navy transition-colors"
          >
            Switch to {nextTierLabel}
          </button>
        </p>
      )}
      {errorMsg && <p className="text-xs text-red-600 mt-4">{errorMsg}</p>}
    </div>
  );
}
