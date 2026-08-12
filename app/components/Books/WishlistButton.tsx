'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleWishlist } from './wishlist-actions';

interface WishlistButtonProps {
  bookId: number;
  initialIsWishlisted: boolean;
  isLoggedIn: boolean;
}

export default function WishlistButton({ bookId, initialIsWishlisted, isLoggedIn }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push('/resend-link');
      return;
    }

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    startTransition(async () => {
      const result = await toggleWishlist(bookId);
      if (result?.error) {
        setIsWishlisted(!nextState);
      } else if (result?.requiresLogin) {
        setIsWishlisted(!nextState);
        router.push('/resend-link');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-colors disabled:opacity-60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-500'}`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s-6.716-4.35-9.428-8.06C.808 10.44 1.2 6.9 3.879 5.257A5.4 5.4 0 0112 6.5a5.4 5.4 0 018.121-1.243c2.679 1.643 3.07 5.183 1.307 7.683C18.716 16.65 12 21 12 21z"
        />
      </svg>
    </button>
  );
}
