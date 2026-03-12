'use client';

import * as React from 'react';
import { MovieCarousel } from './MovieCarousel';
import { GridCarousel } from './GridCarousel';
import { MovieGrid } from './MovieGrid';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loader2 } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
}

interface TvShowsPageProps {
  initialTvShows: any[];
  initialGenres: Genre[];
  popularTvShows: any[];
  trendingTvShows: any[];
  genreTvShowsData?: Array<{
    genreId: number;
    genreName: string;
    tvShows: any[];
  }>;
}

export function TvShowsPage({
  initialTvShows,
  initialGenres,
  popularTvShows,
  trendingTvShows,
  genreTvShowsData = [],
}: TvShowsPageProps) {
  const [selectedGenre, setSelectedGenre] = React.useState<string>('all');
  const [filteredTvShows, setFilteredTvShows] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  React.useEffect(() => {
    if (selectedGenre === 'all') {
      setFilteredTvShows([]);
      setCurrentPage(1);
      return;
    }

    setIsLoading(true);
    setCurrentPage(1);
    fetch(`/api/tv/genre?genreId=${selectedGenre}&page=1`)
      .then((res) => res.json())
      .then((data) => {
        setFilteredTvShows(data.results);
        setTotalPages(data.total_pages);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching TV shows by genre:', error);
        setIsLoading(false);
      });
  }, [selectedGenre]);

  const loadMore = () => {
    if (selectedGenre === 'all' || currentPage >= totalPages || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    fetch(`/api/tv/genre?genreId=${selectedGenre}&page=${currentPage + 1}`)
      .then((res) => res.json())
      .then((data) => {
        setFilteredTvShows((prev) => [...prev, ...data.results]);
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      })
      .catch((error) => {
        console.error('Error loading more TV shows:', error);
        setIsLoadingMore(false);
      });
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="w-full">
        {/* Poster Carousel */}
        <MovieCarousel movies={popularTvShows} />

        {selectedGenre === 'all' ? (
          /* Default: Show genre carousels */
          <div className="pt-8 pb-16">
            {genreTvShowsData.map(({ genreId, genreName, tvShows }) => (
              <GridCarousel
                key={genreId}
                title={genreName}
                items={tvShows}
                type="tv"
              />
            ))}
            <GridCarousel
              title="Trending Now"
              items={trendingTvShows}
              type="tv"
            />
            <GridCarousel
              title="Popular TV Shows"
              items={popularTvShows}
              type="tv"
            />
          </div>
        ) : (
          /* Genre Selected: Show grid with load more */
          <div className="px-8 md:px-16 lg:px-24 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {initialGenres.find((g) => g.id.toString() === selectedGenre)
                  ?.name || 'TV Shows'}
              </h2>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[200px] bg-zinc-900/50 border-zinc-800/50 text-white [&>span]:text-white">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem
                    value="all"
                    className="text-white hover:text-white focus:text-white focus:bg-zinc-800 hover:bg-zinc-800"
                  >
                    All Genres
                  </SelectItem>
                  {initialGenres.map((genre) => (
                    <SelectItem
                      key={genre.id}
                      value={genre.id.toString()}
                      className="text-white hover:text-white focus:text-white focus:bg-zinc-800 hover:bg-zinc-800"
                    >
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="size-8 text-zinc-400 mx-auto mb-4 animate-spin" />
                <p className="text-zinc-400 text-lg">Loading...</p>
              </div>
            ) : (
              <>
                <MovieGrid items={filteredTvShows} type="tv" />
                {currentPage < totalPages && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="px-8 py-3 bg-white text-black hover:bg-white/90 font-semibold"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
