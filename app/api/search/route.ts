import { type NextRequest, NextResponse } from 'next/server';
import { upstreamError } from '@/lib/api-response';
import { searchMedia } from '@/lib/tmdb/api';

/** `GET /api/search?query=dune` — movies and TV shows only. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') ?? '';

  try {
    return NextResponse.json(await searchMedia(query));
  } catch (error) {
    return upstreamError('Search failed', error);
  }
}
