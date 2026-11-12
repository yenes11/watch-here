/**
 * The subset of the TMDB v3 API shapes this app relies on.
 * @see https://developer.themoviedb.org/reference
 */

export type MediaType = 'movie' | 'tv';

export const isMediaType = (value: unknown): value is MediaType =>
  value === 'movie' || value === 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface Paginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface MediaSummaryBase {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface MovieSummary extends MediaSummaryBase {
  title: string;
  release_date?: string;
}

export interface TvShowSummary extends MediaSummaryBase {
  name: string;
  first_air_date?: string;
}

export type MediaSummary = MovieSummary | TvShowSummary;

export type MediaSummaryOf<T extends MediaType> = T extends 'movie'
  ? MovieSummary
  : TvShowSummary;

export type MediaSearchResult =
  | (MovieSummary & { media_type: 'movie' })
  | (TvShowSummary & { media_type: 'tv' });

/** `/search/multi` also returns people, which this app does not show. */
export type MultiSearchResult =
  | MediaSearchResult
  | { id: number; media_type: 'person' };

export interface ImageAsset {
  file_path: string;
  width: number;
  height: number;
  /** `null` marks artwork without any text on it. */
  iso_639_1: string | null;
}

export interface ImageCollection {
  logos?: ImageAsset[];
  posters?: ImageAsset[];
}

interface MediaDetailsBase {
  genres: Genre[];
  tagline: string;
  images?: ImageCollection;
}

/** A movie series ("Dune Collection"), as referenced from a movie. */
export interface CollectionRef {
  id: number;
  name: string;
}

export interface MovieCollection extends CollectionRef {
  parts: MovieSummary[];
}

/** Titles TMDB relates to this one (appended to the details request). */
interface RelatedTitles<T> {
  /** Based on what viewers watched next — usually the better list. */
  recommendations?: Paginated<T>;
  /** Based on shared genres and keywords. */
  similar?: Paginated<T>;
}

export interface MovieDetails
  extends MovieSummary,
    MediaDetailsBase,
    RelatedTitles<MovieSummary> {
  runtime: number | null;
  belongs_to_collection: CollectionRef | null;
}

export interface TvShowDetails
  extends TvShowSummary,
    MediaDetailsBase,
    RelatedTitles<TvShowSummary> {
  last_air_date: string | null;
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
}

export type MediaDetails = MovieDetails | TvShowDetails;

export type MediaDetailsOf<T extends MediaType> = T extends 'movie'
  ? MovieDetails
  : TvShowDetails;

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface CountryWatchProviders {
  /** JustWatch page listing prices and deep links for this country. */
  link?: string;
  flatrate?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

/** Keyed by ISO 3166-1 country code, e.g. `{ TR: {...}, US: {...} }`. */
export type WatchProvidersByCountry = Record<string, CountryWatchProviders>;

export interface LogoImage {
  file_path: string;
  width: number;
  height: number;
}

export interface TitleArt {
  logo: LogoImage | null;
  /** A poster without baked-in title text. */
  textlessPoster: string | null;
}
