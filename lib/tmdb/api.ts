import { ONE_DAY, tmdbFetch } from './client';
import { EMPTY_TITLE_ART, toTitleArt } from './title-art';
import type {
  Genre,
  ImageCollection,
  MediaDetailsOf,
  MediaSearchResult,
  MediaSummaryOf,
  MediaType,
  MovieSummary,
  MultiSearchResult,
  Paginated,
  TitleArt,
  WatchProvidersByCountry,
} from './types';

/** Artwork in English plus artwork with no text at all. */
const IMAGE_LANGUAGES = 'en,null';

const DISCOVER_PARAMS: Record<MediaType, Record<string, string | boolean>> = {
  movie: { include_video: false },
  tv: { include_null_first_air_dates: false },
};

export const emptyPage = <T>(): Paginated<T> => ({
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
});

interface DiscoverOptions {
  genreId?: number;
  page?: number;
}

/** Most popular titles, optionally narrowed to one genre. */
export function discoverMedia<T extends MediaType>(
  mediaType: T,
  { genreId, page = 1 }: DiscoverOptions = {}
) {
  return tmdbFetch<Paginated<MediaSummaryOf<T>>>(`/discover/${mediaType}`, {
    params: {
      ...DISCOVER_PARAMS[mediaType],
      include_adult: false,
      sort_by: 'popularity.desc',
      with_genres: genreId,
      page,
    },
  });
}

export function getTrending<T extends MediaType>(mediaType: T, page = 1) {
  return tmdbFetch<Paginated<MediaSummaryOf<T>>>(
    `/trending/${mediaType}/day`,
    { params: { page } }
  );
}

export function getTopRatedMovies(page = 1) {
  return tmdbFetch<Paginated<MovieSummary>>('/movie/top_rated', {
    params: { page },
  });
}

export async function getGenres(mediaType: MediaType): Promise<Genre[]> {
  const { genres } = await tmdbFetch<{ genres: Genre[] }>(
    `/genre/${mediaType}/list`,
    { revalidate: ONE_DAY }
  );
  return genres;
}

export function getMediaDetails<T extends MediaType>(mediaType: T, id: number) {
  return tmdbFetch<MediaDetailsOf<T>>(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'images',
      include_image_language: IMAGE_LANGUAGES,
    },
  });
}

export async function getWatchProviders(
  mediaType: MediaType,
  id: number
): Promise<WatchProvidersByCountry> {
  const { results } = await tmdbFetch<{ results?: WatchProvidersByCountry }>(
    `/${mediaType}/${id}/watch/providers`
  );
  return results ?? {};
}

const isMediaResult = (
  result: MultiSearchResult
): result is MediaSearchResult => result.media_type !== 'person';

/** Searches movies and TV shows (people are dropped). Never cached. */
export async function searchMedia(
  query: string,
  page = 1
): Promise<Paginated<MediaSearchResult>> {
  const trimmed = query.trim();
  if (!trimmed) return emptyPage();

  const data = await tmdbFetch<Paginated<MultiSearchResult>>('/search/multi', {
    params: { query: trimmed, include_adult: false, page },
    revalidate: false,
  });
  return { ...data, results: data.results.filter(isMediaResult) };
}

/**
 * Title logo and textless poster for a title. Missing art is never fatal —
 * the UI falls back to text and the backdrop — so failures resolve empty.
 */
export async function getTitleArt(
  mediaType: MediaType,
  id: number
): Promise<TitleArt> {
  try {
    const images = await tmdbFetch<ImageCollection>(
      `/${mediaType}/${id}/images`,
      {
        params: { include_image_language: IMAGE_LANGUAGES },
        revalidate: ONE_DAY,
      }
    );
    return toTitleArt(images);
  } catch {
    return EMPTY_TITLE_ART;
  }
}
