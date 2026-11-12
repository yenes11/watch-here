import { byReleaseDate, getRelatedTitles, isMovie } from './media';
import { getCollection } from './tmdb/api';
import type {
  MediaDetailsOf,
  MediaSummaryOf,
  MediaType,
  MovieDetails,
  MovieSummary,
} from './tmdb/types';

/** Anchors for the rows under a detail page (targets of the jump links). */
export const SERIES_SECTION_ID = 'series';
export const SIMILAR_SECTION_ID = 'more-like-this';

export interface RelatedTitles<T extends MediaType> {
  /** The rest of the movie's series, oldest first. */
  series: { name: string; items: MovieSummary[] } | null;
  similar: MediaSummaryOf<T>[];
}

/**
 * Loads the series (one extra, day-cached request when the movie belongs to
 * one) and derives "More like this" from the details response. Resolved up
 * front so the page knows which rows exist before rendering jump links.
 */
export async function loadRelatedTitles<T extends MediaType>(
  details: MediaDetailsOf<T>
): Promise<RelatedTitles<T>> {
  const series = isMovie(details)
    ? await loadSeries(details as MovieDetails)
    : null;

  // A film from the same series shouldn't show up twice on the page.
  const seriesIds = new Set(series?.items.map((item) => item.id));
  return { series, similar: getRelatedTitles(details, seriesIds) };
}

/** A missing or failing series request only hides that row. */
async function loadSeries(movie: MovieDetails) {
  const ref = movie.belongs_to_collection;
  if (!ref) return null;

  try {
    const collection = await getCollection(ref.id);
    const items = collection.parts
      .filter((part) => part.id !== movie.id)
      .sort(byReleaseDate);
    return items.length ? { name: collection.name, items } : null;
  } catch {
    return null;
  }
}

export interface SectionLink {
  href: string;
  label: string;
  count: number;
}

/** Jump links for the hero, one per row that actually renders. */
export function getRelatedSectionLinks(
  related: RelatedTitles<MediaType>
): SectionLink[] {
  const links: SectionLink[] = [];
  if (related.series) {
    links.push({
      href: `#${SERIES_SECTION_ID}`,
      label: related.series.name,
      count: related.series.items.length,
    });
  }
  if (related.similar.length) {
    links.push({
      href: `#${SIMILAR_SECTION_ID}`,
      label: 'More like this',
      count: related.similar.length,
    });
  }
  return links;
}
