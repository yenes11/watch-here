import { notFound } from 'next/navigation';
import { getMediaDetails, getWatchProviders } from './tmdb/api';
import { isTmdbNotFound } from './tmdb/client';
import type { MediaType } from './tmdb/types';
import { getViewerCountry } from './country';
import { parsePositiveInt } from './parse';

/**
 * Everything a movie / TV detail page needs, fetched in parallel.
 * Unknown ids render the route's not-found page; any other failure
 * propagates to the error boundary instead of masquerading as a 404.
 */
export async function loadMediaPage<T extends MediaType>(
  mediaType: T,
  rawId: string
) {
  const id = parsePositiveInt(rawId);
  if (id === null) notFound();

  try {
    const [details, watchProviders, country] = await Promise.all([
      getMediaDetails(mediaType, id),
      getWatchProviders(mediaType, id),
      getViewerCountry(),
    ]);
    return { details, watchProviders, country };
  } catch (error) {
    if (isTmdbNotFound(error)) notFound();
    throw error;
  }
}
