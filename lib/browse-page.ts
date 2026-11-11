import { FEATURED_GENRE_COUNT, HERO_SLIDE_COUNT } from './constants';
import type { MediaSection } from './media';
import { discoverMedia, getGenres } from './tmdb/api';
import type { Genre, MediaSummaryOf, MediaType } from './tmdb/types';

async function getGenreSections<T extends MediaType>(
  mediaType: T,
  genres: Genre[]
): Promise<MediaSection<T>[]> {
  return Promise.all(
    genres.slice(0, FEATURED_GENRE_COUNT).map(async (genre) => {
      const { results } = await discoverMedia(mediaType, { genreId: genre.id });
      return { key: `genre-${genre.id}`, title: genre.name, items: results };
    })
  );
}

interface BrowsePageData<T extends MediaType> {
  genres: Genre[];
  heroItems: MediaSummaryOf<T>[];
  popular: MediaSummaryOf<T>[];
  genreSections: MediaSection<T>[];
}

/** Shared data for the /movies and /tv listing pages. */
export async function loadBrowsePage<T extends MediaType>(
  mediaType: T
): Promise<BrowsePageData<T>> {
  const [{ results: popular }, genres] = await Promise.all([
    discoverMedia(mediaType),
    getGenres(mediaType),
  ]);
  const genreSections = await getGenreSections(mediaType, genres);

  return {
    genres,
    heroItems: popular.slice(0, HERO_SLIDE_COUNT),
    popular,
    genreSections,
  };
}
