const API_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'en-US';

export const ONE_HOUR = 60 * 60;
export const ONE_DAY = 24 * ONE_HOUR;

/** TMDB rejects any `page` above this. */
export const MAX_PAGE = 500;

type QueryValue = string | number | boolean | undefined;

interface TmdbRequestOptions {
  params?: Record<string, QueryValue>;
  /** Seconds to keep the response in Next's data cache; `false` disables it. */
  revalidate?: number | false;
}

export class TmdbError extends Error {
  readonly status: number;

  constructor(path: string, status: number) {
    super(`TMDB request to ${path} failed with status ${status}`);
    this.name = 'TmdbError';
    this.status = status;
  }
}

export const isTmdbNotFound = (error: unknown): boolean =>
  error instanceof TmdbError && error.status === 404;

function getAccessToken(): string {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new Error('TMDB_ACCESS_TOKEN environment variable is not set');
  }
  return token;
}

function buildUrl(path: string, params: Record<string, QueryValue>): URL {
  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url;
}

/** Server-only: the access token must never reach the browser. */
export async function tmdbFetch<T>(
  path: string,
  { params = {}, revalidate = ONE_HOUR }: TmdbRequestOptions = {}
): Promise<T> {
  const url = buildUrl(path, { language: DEFAULT_LANGUAGE, ...params });
  const caching: RequestInit =
    revalidate === false ? { cache: 'no-store' } : { next: { revalidate } };

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    ...caching,
  });

  if (!response.ok) throw new TmdbError(path, response.status);

  return (await response.json()) as T;
}
