'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useGenreFeed } from '@/hooks/useGenreFeed';
import type { MediaSection } from '@/lib/media';
import type { Genre, MediaSummaryOf, MediaType } from '@/lib/tmdb/types';
import { Button } from './ui/button';
import { GenreSelect } from './GenreSelect';
import { HeroCarousel } from './HeroCarousel';
import { MediaGrid } from './MediaGrid';
import { MediaRow } from './MediaRow';

interface MediaBrowsePageProps<T extends MediaType> {
  mediaType: T;
  heading: string;
  heroItems: MediaSummaryOf<T>[];
  genres: Genre[];
  /** Rows shown while no genre filter is active. */
  sections: MediaSection<T>[];
}

/** The /movies and /tv listing: curated rows, or one genre as a grid. */
export function MediaBrowsePage<T extends MediaType>({
  mediaType,
  heading,
  heroItems,
  genres,
  sections,
}: MediaBrowsePageProps<T>) {
  const [genreId, setGenreId] = React.useState<number | null>(null);
  const genreName = genres.find((genre) => genre.id === genreId)?.name;

  const genreSelect = (
    <GenreSelect genres={genres} value={genreId} onChange={setGenreId} />
  );

  return (
    <div className="min-h-screen bg-black">
      <main className="w-full">
        <div className="absolute top-20 md:top-24 left-0 right-0 z-40 px-page">
          <div className="flex items-center gap-3 md:gap-4">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-white/90 uppercase tracking-wider">
              {heading}
            </h1>
            <div aria-hidden className="h-6 w-px bg-white/30" />
            {genreSelect}
          </div>
        </div>

        <HeroCarousel items={heroItems} mediaType={mediaType} />

        {genreId === null ? (
          <div className="pt-8 pb-16">
            {sections.map(({ key, title, items }) => (
              <MediaRow key={key} title={title} items={items} mediaType={mediaType} />
            ))}
          </div>
        ) : (
          <div className="px-page py-8 md:py-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {genreName ?? heading}
              </h2>
              {genreSelect}
            </div>
            <GenreResults mediaType={mediaType} genreId={genreId} />
          </div>
        )}
      </main>
    </div>
  );
}

function GenreResults<T extends MediaType>({
  mediaType,
  genreId,
}: {
  mediaType: T;
  genreId: number;
}) {
  const { items, status, hasMore, loadMore, retry } = useGenreFeed(
    mediaType,
    genreId
  );

  if (status === 'loading') {
    return (
      <div role="status" className="text-center py-12">
        <Loader2 aria-hidden className="size-8 text-zinc-400 mx-auto mb-4 animate-spin" />
        <p className="text-zinc-400 text-lg">Loading…</p>
      </div>
    );
  }

  const isLoadingMore = status === 'loading-more';

  return (
    <>
      <MediaGrid items={items} mediaType={mediaType} />

      {status === 'error' ? (
        <div role="alert" className="flex flex-col items-center gap-4 mt-12 text-zinc-400">
          <p>Couldn’t load titles. Please try again.</p>
          <Button
            onClick={retry}
            variant="outline"
            className="border-zinc-700 bg-transparent text-white hover:bg-zinc-900 hover:text-white"
          >
            Try again
          </Button>
        </div>
      ) : (
        hasMore && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-white text-black hover:bg-white/90 font-semibold"
            >
              {isLoadingMore && <Loader2 aria-hidden className="size-4 mr-2 animate-spin" />}
              {isLoadingMore ? 'Loading…' : 'Load More'}
            </Button>
          </div>
        )
      )}
    </>
  );
}
