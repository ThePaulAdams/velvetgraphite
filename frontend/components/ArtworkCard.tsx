import Image from 'next/image';
import Link from 'next/link';
import { Artwork } from '@/lib/types';
import { getImageUrl } from '@/lib/api';

interface ArtworkCardProps {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const imageUrl = getImageUrl(artwork.image.url);
  const thumbnailUrl = artwork.image.formats?.medium?.url
    ? getImageUrl(artwork.image.formats.medium.url)
    : imageUrl;

  return (
    <div className="group relative overflow-hidden rounded-lg bg-gray-900 shadow-lg transition-transform hover:scale-[1.02]">
      <Link href={`/gallery/${artwork.documentId}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={artwork.title}
            fill
            className="object-cover transition-opacity group-hover:opacity-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {artwork.sold && (
            <div className="absolute right-0 top-0 m-4 rotate-12 bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg">
              Sold
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-white">{artwork.title}</h3>
            {artwork.price && (
              <span className="ml-2 whitespace-nowrap text-lg font-bold text-pink-400">
                ${artwork.price}
              </span>
            )}
          </div>
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {artwork.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
              {artwork.tags.length > 3 && (
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  +{artwork.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
