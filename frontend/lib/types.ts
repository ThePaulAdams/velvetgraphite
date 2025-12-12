export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface ImageData {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  url: string;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

export interface Artwork {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  tags?: string[];
  redditUsername?: string;
  redditPostUrl?: string;
  dateDrawn?: string;
  featured: boolean;
  views: number;
  salePrice?: number;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  image: ImageData;
}

export interface ArtworksResponse {
  data: Artwork[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SalesInquiry {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  artworkTitle?: string;
  artworkId?: string;
}

export interface CustomWorkRequest {
  name: string;
  email: string;
  phone?: string;
  description: string;
  budget?: string;
  timeline?: string;
}
