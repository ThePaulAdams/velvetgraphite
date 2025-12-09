'use client';

import { useEffect, useState } from 'react';
import { Artwork } from '@/lib/types';
import { getArtworks, getAllTags } from '@/lib/api';
import ArtworkCard from '@/components/ArtworkCard';
import TagFilter from '@/components/TagFilter';

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [artworksData, tagsData] = await Promise.all([
        getArtworks(selectedTag || undefined),
        getAllTags(),
      ]);
      setArtworks(artworksData);
      setTags(tagsData);
      setLoading(false);
    }

    fetchData();
  }, [selectedTag]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
            VelvetGraphite
          </h1>
          <p className="text-gray-400">
            Art Gallery - Reddit-inspired artwork collection
          </p>
        </header>

        <TagFilter
          tags={tags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-pink-600"></div>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center text-gray-400">
            <p className="text-xl">No artwork found</p>
            <p className="mt-2 text-sm">
              {selectedTag
                ? `No artwork with tag "${selectedTag}"`
                : 'Upload some artwork to get started!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-400">
              Showing {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
              {selectedTag && ` with tag "${selectedTag}"`}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
