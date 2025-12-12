import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArtwork, getImageUrl } from '@/lib/api';
import ArtworkActions from '@/components/ArtworkActions';

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = await getArtwork(id);

  if (!artwork) {
    notFound();
  }

  const imageUrl = getImageUrl(artwork.image.url);
  const dateDrawn = artwork.dateDrawn
    ? new Date(artwork.dateDrawn).toLocaleDateString()
    : null;
  const createdAt = new Date(artwork.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/gallery"
          className="mb-8 inline-flex items-center text-pink-500 hover:text-pink-400"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Gallery
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-800">
            <Image
              src={imageUrl}
              alt={artwork.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {artwork.isSold && (
              <div className="absolute right-0 top-0 m-6 rotate-12 bg-red-600 px-6 py-3 text-xl font-bold uppercase tracking-wider text-white shadow-xl">
                Sold
              </div>
            )}
          </div>

          <div className="text-gray-200">
            <div className="mb-4 flex items-start justify-between">
              <h1 className="text-4xl font-bold text-white">
                {artwork.title}
              </h1>
              {artwork.salePrice && (
                <span className="ml-4 whitespace-nowrap text-3xl font-bold text-pink-400">
                  ${artwork.salePrice}
                </span>
              )}
            </div>

            {artwork.description && (
              <p className="mb-6 text-lg text-gray-300">
                {artwork.description}
              </p>
            )}

            <ArtworkActions
              artworkId={artwork.documentId}
              artworkTitle={artwork.title}
              price={artwork.salePrice}
              sold={artwork.isSold}
            />

            {artwork.tags && artwork.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-sm font-semibold uppercase text-gray-400">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/gallery?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-pink-600/20 px-3 py-1 text-sm text-pink-400 hover:bg-pink-600/30"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-gray-800 pt-6">
              {artwork.redditUsername && (
                <div>
                  <span className="text-sm text-gray-400">Subject: </span>
                  <span className="text-white">{artwork.redditUsername}</span>
                </div>
              )}

              {artwork.redditPostUrl && (
                <div>
                  <span className="text-sm text-gray-400">Reference: </span>
                  <a
                    href={artwork.redditPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-400"
                  >
                    View Reddit Post
                  </a>
                </div>
              )}

              {dateDrawn && (
                <div>
                  <span className="text-sm text-gray-400">Drawn on: </span>
                  <span className="text-white">{dateDrawn}</span>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-400">Uploaded: </span>
                <span className="text-white">{createdAt}</span>
              </div>

              <div>
                <span className="text-sm text-gray-400">Views: </span>
                <span className="text-white">{artwork.views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
