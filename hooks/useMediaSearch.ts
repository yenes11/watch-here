'use client';

import * as React from 'react';
import type { MediaSearchResult, Paginated } from '@/lib/tmdb/types';

const DEBOUNCE_MS = 250;

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SearchState {
  results: MediaSearchResult[];
  status: SearchStatus;
}

const IDLE: SearchState = Object.freeze({ results: [], status: 'idle' });

async function fetchSearchResults(
  query: string,
  signal: AbortSignal
): Promise<MediaSearchResult[]> {
  const params = new URLSearchParams({ query });
  const response = await fetch(`/api/search?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Search request failed with status ${response.status}`);
  }
  const data: Paginated<MediaSearchResult> = await response.json();
  return data.results;
}

/**
 * Debounced search-as-you-type. The cleanup cancels both the pending
 * debounce and any in-flight request, so a slow response for an old query
 * can never overwrite newer results. Previous results stay visible while
 * the next query loads.
 */
export function useMediaSearch(query: string): SearchState {
  const [state, setState] = React.useState<SearchState>(IDLE);
  const trimmed = query.trim();

  React.useEffect(() => {
    if (!trimmed) {
      setState(IDLE);
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading' }));
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const results = await fetchSearchResults(trimmed, controller.signal);
        setState({ results, status: 'success' });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Search failed:', error);
        setState({ results: [], status: 'error' });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return state;
}
