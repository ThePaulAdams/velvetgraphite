import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new Response('Image URL is required', { status: 400 });
  }

  try {
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return new Response('Failed to fetch image', { status: imageResponse.status });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new Response('Error fetching image', { status: 500 });
  }
}
