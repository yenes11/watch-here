import { type NextRequest, NextResponse } from 'next/server';
import { jsonError, upstreamError } from '@/lib/api-response';
import { parsePositiveInt } from '@/lib/parse';
import { discoverMedia } from '@/lib/tmdb/api';
import { MAX_PAGE } from '@/lib/tmdb/client';
import { isMediaType } from '@/lib/tmdb/types';

interface RouteContext {
  params: Promise<{ mediaType: string }>;
}

/** `GET /api/discover/{movie|tv}?genreId=28&page=2` */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { mediaType } = await params;
  if (!isMediaType(mediaType)) return jsonError('Unknown media type', 404);

  const { searchParams } = request.nextUrl;
  const genreId = parsePositiveInt(searchParams.get('genreId'));
  const page = parsePositiveInt(searchParams.get('page') ?? '1');

  if (genreId === null) return jsonError('A valid genreId is required', 400);
  if (page === null || page > MAX_PAGE) {
    return jsonError(`page must be between 1 and ${MAX_PAGE}`, 400);
  }

  try {
    return NextResponse.json(await discoverMedia(mediaType, { genreId, page }));
  } catch (error) {
    return upstreamError(`Discover ${mediaType} failed`, error);
  }
}
