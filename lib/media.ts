import type {
  MediaSummary,
  MediaSummaryOf,
  MediaType,
  MovieDetails,
  TvShowDetails,
} from './tmdb/types';

const UNTITLED = 'Untitled';

/** A titled row of posters on a listing page. */
export interface MediaSection<T extends MediaType> {
  key: string;
  title: string;
  items: MediaSummaryOf<T>[];
}

export const MEDIA_TYPE_LABEL: Record<MediaType, string> = {
  movie: 'Movie',
  tv: 'TV Show',
};

export const isMovie = (
  item: MediaSummary
): item is Extract<MediaSummary, { title: string }> => 'title' in item;

export const getMediaTitle = (item: MediaSummary): string =>
  (isMovie(item) ? item.title : item.name) || UNTITLED;

export const getMediaHref = (mediaType: MediaType, id: number): string =>
  `/${mediaType}/${id}`;

/**
 * Reads the year straight from a TMDB `YYYY-MM-DD` date. Going through
 * `new Date()` would parse it as UTC midnight and report the previous year
 * for January 1st releases anywhere west of Greenwich.
 */
export function yearOf(date: string | null | undefined): number | null {
  if (!date) return null;
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

export const getReleaseYear = (item: MediaSummary): number | null =>
  yearOf(isMovie(item) ? item.release_date : item.first_air_date);

/** `0` means "no votes yet" on TMDB, so it is treated as missing. */
export const hasRating = (voteAverage: number | undefined): voteAverage is number =>
  typeof voteAverage === 'number' && voteAverage > 0;

export const formatRating = (voteAverage: number): string =>
  voteAverage.toFixed(1);

export const pluralize = (count: number, singular: string): string =>
  `${count} ${singular}${count === 1 ? '' : 's'}`;

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

/** Plain-text facts shown under a movie's title, e.g. `["2024", "2h 15m"]`. */
export function getMovieFacts(movie: MovieDetails): string[] {
  const year = yearOf(movie.release_date);
  return [
    year === null ? null : String(year),
    movie.runtime ? formatRuntime(movie.runtime) : null,
  ].filter((fact) => fact !== null);
}

function formatYearRange(first: number | null, last: number | null) {
  if (first === null) return null;
  if (last === null || last === first) return String(first);
  return `${first} – ${last}`;
}

function formatSeasons({ number_of_seasons, number_of_episodes }: TvShowDetails) {
  if (!number_of_seasons) return null;
  const seasons = pluralize(number_of_seasons, 'season');
  return number_of_episodes
    ? `${seasons}, ${pluralize(number_of_episodes, 'episode')}`
    : seasons;
}

/** e.g. `["2019 – 2023", "50m", "4 seasons, 36 episodes"]`. */
export function getTvShowFacts(show: TvShowDetails): string[] {
  const [episodeRuntime] = show.episode_run_time;
  return [
    formatYearRange(yearOf(show.first_air_date), yearOf(show.last_air_date)),
    episodeRuntime ? `${episodeRuntime}m` : null,
    formatSeasons(show),
  ].filter((fact) => fact !== null);
}

/**
 * Returns a filter that lets each id through only once across every call,
 * so a page made of several rows never repeats a title. `seenIds` seeds the
 * ids that are already on screen.
 */
export function createUniqueFilter(seenIds: Iterable<number> = []) {
  const seen = new Set(seenIds);

  return <T extends { id: number }>(items: readonly T[]): T[] =>
    items.filter(({ id }) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}
