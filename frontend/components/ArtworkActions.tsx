'use client';

import { useState } from 'react';
import PurchaseInquiryForm from './PurchaseInquiryForm';

interface ArtworkActionsProps {
  artworkId: string;
  artworkTitle: string;
  price?: number;
  sold: boolean;
}

export default function ArtworkActions({
  artworkId,
  artworkTitle,
  price,
  sold,
}: ArtworkActionsProps) {
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        {!sold && price && (
          <button
            onClick={() => setIsPurchaseFormOpen(true)}
            className="flex-1 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Buy Now
          </button>
        )}
        <button
          onClick={() => setIsPurchaseFormOpen(true)}
          className="flex-1 rounded-lg border-2 border-pink-600 px-6 py-3 font-semibold text-pink-400 transition-colors hover:bg-pink-600/10"
        >
          Inquire About This Piece
        </button>
      </div>

      <PurchaseInquiryForm
        artworkId={artworkId}
        artworkTitle={artworkTitle}
        isOpen={isPurchaseFormOpen}
        onClose={() => setIsPurchaseFormOpen(false)}
      />
    </>
  );
}
