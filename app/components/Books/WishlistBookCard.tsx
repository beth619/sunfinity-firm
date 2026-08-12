'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import BookCard from './BookCard';
import WishlistButton from './WishlistButton';
import { recordDirectBuy } from './direct-buy-actions';

interface WishlistBookCardProps {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string;
  price: number;
  amazonUrl: string;
  slug: string;
  directBuyEnabled: boolean;
  isWishlisted: boolean;
  isLoggedIn: boolean;
  fileUrl: string | null;
}

export default function WishlistBookCard({
  id,
  isWishlisted,
  isLoggedIn,
  fileUrl,
  title,
  directBuyEnabled,
  slug,
  ...bookCardProps
}: WishlistBookCardProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDirectBuy = async (slug: string) => {
    if (!fileUrl) return;

    const result = await recordDirectBuy(id);


    if (result?.error) {
      setErrorMsg(result.error);
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = fileUrl.split('/').pop() || `${title}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    router.push(`/purchases/success?title=${encodeURIComponent(title)}`);
  };

  return (
    <div className="relative">
      <WishlistButton bookId={id} initialIsWishlisted={isWishlisted} isLoggedIn={isLoggedIn} />

      {/* Render BookCard directly without the outer Link wrapper */}
      <BookCard
        title={title}
        slug={slug}
        directBuyEnabled={directBuyEnabled}
        directBuyDisabled={!fileUrl}
        {...bookCardProps}
        onDirectBuy={handleDirectBuy}
      />

      {errorMsg && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs text-center font-medium rounded-lg border border-red-100">
          {errorMsg}
        </div>
      )}
    </div>
  )
};