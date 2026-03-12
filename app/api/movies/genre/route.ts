import { NextRequest, NextResponse } from 'next/server';
import { getMoviesByGenre } from '@/lib/api-calls';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const genreId = searchParams.get('genreId');
  const page = searchParams.get('page') || '1';

  if (!genreId) {
    return NextResponse.json({ error: 'Genre ID is required' }, { status: 400 });
  }

  try {
    const data = await getMoviesByGenre(parseInt(genreId), parseInt(page));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Movies by genre API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

