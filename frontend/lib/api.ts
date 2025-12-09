import { ArtworksResponse, Artwork } from './types';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getArtworks(tag?: string): Promise<Artwork[]> {
  try {
    let url = `${API_URL}/api/artworks?populate=*&sort=createdAt:desc`;

    // If tag filter is provided, add it to the query
    if (tag) {
      url += `&filters[tags][$contains]=${encodeURIComponent(tag)}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch artworks: ${response.statusText}`);
    }

    const data: ArtworksResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }
}

export async function getArtwork(documentId: string): Promise<Artwork | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/artworks/${documentId}?populate=*`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch artwork: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const artworks = await getArtworks();
    const tagsSet = new Set<string>();

    artworks.forEach((artwork) => {
      if (artwork.tags && Array.isArray(artwork.tags)) {
        artwork.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export function getImageUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${API_URL}${url}`;
}
