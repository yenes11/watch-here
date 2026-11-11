'use client';

import * as React from 'react';
import { createUniqueFilter } from '@/lib/media';
import type { MediaSummaryOf, MediaType, Paginated } from '@/lib/tmdb/types';

type FeedStatus = 'idle' | 'loading' | 'loading-more' | 'error';

interface FeedState<T> {
  items: T[];
  page: number;
  totalPages: number;
  status: FeedStatus;
}

const initialState = <T>(): FeedState<T> => ({
  items: [],
  page: 0,
  totalPages: 0,
  status: 'idle',
});

async function fetchGenrePage<T extends MediaType>(
  mediaType: T,
  genreId: number,
  page: number,
  signal: AbortSignal
): Promise<Paginated<MediaSummaryOf<T>>> {
  const query = new URLSearchParams({
    genreId: String(genreId),
    page: String(page),
  });
  const response = await fetch(`/api/discover/${mediaType}?${query}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Discover request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Paginated "browse by genre" feed. Each request cancels the one before it,
 * so switching genres quickly can never show results for a stale genre.
 * Popularity order shifts between requests, so items already loaded are
 * skipped when appending the next page.
 */
export function useGenreFeed<T extends MediaType>(
  mediaType: T,
  genreId: number | null
) {
  type Item = MediaSummaryOf<T>;
  const [state, setState] = React.useState<FeedState<Item>>(initialState);
  const controllerRef = React.useRef<AbortController | null>(null);

  const loadPage = React.useCallback(
    async (page: number) => {
      if (genreId === null) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const isFirstPage = page === 1;
      setState((prev) => ({
        ...(isFirstPage ? initialState<Item>() : prev),
        status: isFirstPage ? 'loading' : 'loading-more',
      }));

      try {
        const data = await fetchGenrePage(
          mediaType,
          genreId,
          page,
          controller.signal
        );
        setState((prev) => {
          const kept = isFirstPage ? [] : prev.items;
          const unique = createUniqueFilter(kept.map(({ id }) => id));
          return {
            items: [...kept, ...unique(data.results)],
            page: data.page,
            totalPages: data.total_pages,
            status: 'idle',
          };
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(`Failed to load ${mediaType} genre ${genreId}:`, error);
        setState((prev) => ({ ...prev, status: 'error' }));
      }
    },
    [mediaType, genreId]
  );

  React.useEffect(() => {
    if (genreId === null) {
      setState(initialState<Item>());
      return;
    }
    void loadPage(1);
    return () => controllerRef.current?.abort();
  }, [genreId, loadPage]);

  const { items, page, totalPages, status } = state;
  const hasMore = page < totalPages;

  const loadMore = () => {
    if (hasMore && status === 'idle') void loadPage(page + 1);
  };

  /** Re-requests whichever page failed. */
  const retry = () => void loadPage(page + 1);

  return { items, status, hasMore, loadMore, retry };
}
