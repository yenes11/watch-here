import { HeroCarousel } from '@/components/HeroCarousel';
import { MediaRow } from '@/components/MediaRow';
import { HERO_SLIDE_COUNT } from '@/lib/constants';
import { createUniqueFilter } from '@/lib/media';
import {
  discoverMedia,
  getTitleArt,
  getTopRatedMovies,
  getTrending,
} from '@/lib/tmdb/api';
import type { MovieSummary, TitleArt } from '@/lib/tmdb/types';

async function getTitleArtById(
  movies: MovieSummary[]
): Promise<Record<number, TitleArt>> {
  const entries = await Promise.all(
    movies.map(async ({ id }) => [id, await getTitleArt('movie', id)] as const)
  );
  return Object.fromEntries(entries);
}

export default async function HomePage() {
  const [popular, popularNextPage, trendingMovies, topRated, trendingTv] =
    await Promise.all([
      discoverMedia('movie'),
      discoverMedia('movie', { page: 2 }),
      getTrending('movie'),
      getTopRatedMovies(),
      getTrending('tv'),
    ]);

  const heroMovies = popular.results.slice(0, HERO_SLIDE_COUNT);
  const heroArt = await getTitleArtById(heroMovies);

  // Each movie appears once on the page: rows skip anything already shown
  // in the hero or an earlier row. Order matters — rows claim titles first.
  const unseen = createUniqueFilter(heroMovies.map(({ id }) => id));
  const trendingRow = unseen(trendingMovies.results);
  const topRatedRow = unseen(topRated.results);
  const popularRow = unseen([...popular.results, ...popularNextPage.results]);

  return (
    <div className="min-h-screen bg-black font-sans">
      <main className="w-full">
        <HeroCarousel items={heroMovies} mediaType="movie" art={heroArt} />

        <div className="pt-6 md:pt-10 pb-16">
          <MediaRow title="Trending Movies" items={trendingRow} mediaType="movie" />
          <MediaRow title="Trending TV Shows" items={trendingTv.results} mediaType="tv" />
          <MediaRow title="Top Rated Movies" items={topRatedRow} mediaType="movie" />
          <MediaRow title="Popular Movies" items={popularRow} mediaType="movie" />
        </div>
      </main>
    </div>
  );
}
