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

interface MoviesPageProps {
  initialMovies: any[];
  initialGenres: Genre[];
  popularMovies: any[];
  trendingMovies: any[];
  topRatedMovies: any[];
  genreMoviesData?: Array<{ genreId: number; genreName: string; movies: any[] }>;
}

export function MoviesPage({
  initialMovies,
  initialGenres,
  popularMovies,
  trendingMovies,
  topRatedMovies,
  genreMoviesData = [],
}: MoviesPageProps) {
  const [selectedGenre, setSelectedGenre] = React.useState<string>('all');
  const [filteredMovies, setFilteredMovies] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  React.useEffect(() => {
    if (selectedGenre === 'all') {
      setFilteredMovies([]);
      setCurrentPage(1);
      return;
    }

    setIsLoading(true);
    setCurrentPage(1);
    fetch(`/api/movies/genre?genreId=${selectedGenre}&page=1`)
      .then((res) => res.json())
      .then((data) => {
        setFilteredMovies(data.results);
        setTotalPages(data.total_pages);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching movies by genre:', error);
        setIsLoading(false);
      });
  }, [selectedGenre]);

  const loadMore = () => {
    if (selectedGenre === 'all' || currentPage >= totalPages || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    fetch(`/api/movies/genre?genreId=${selectedGenre}&page=${currentPage + 1}`)
      .then((res) => res.json())
      .then((data) => {
        setFilteredMovies((prev) => [...prev, ...data.results]);
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      })
      .catch((error) => {
        console.error('Error loading more movies:', error);
        setIsLoadingMore(false);
      });
  };


  return (
    <div className="min-h-screen bg-black">
      <main className="w-full">
        {/* Title and Genre Selector */}
        <div className="absolute top-24 left-0 right-0 z-40 px-8 md:px-16 lg:px-24">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-white/90 uppercase tracking-wider">
              Movies
            </h1>
            <div className="h-6 w-px bg-white/30" />
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[200px] bg-zinc-900/80 backdrop-blur-md border-zinc-800/50 text-white [&>span]:text-white">
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
        </div>

        {/* Poster Carousel */}
        <MovieCarousel movies={popularMovies} />

        {selectedGenre === 'all' ? (
          /* Default: Show genre carousels */
          <div className="pt-8 pb-16">
            {genreMoviesData.map(({ genreId, genreName, movies }) => (
              <GridCarousel
                key={genreId}
                title={genreName}
                items={movies}
                type="movie"
              />
            ))}
            <GridCarousel
              title="Trending Now"
              items={trendingMovies}
              type="movie"
            />
            <GridCarousel
              title="Top Rated"
              items={topRatedMovies}
              type="movie"
            />
            <GridCarousel
              title="Popular Movies"
              items={popularMovies}
              type="movie"
            />
          </div>
        ) : (
          /* Genre Selected: Show grid with load more */
          <div className="px-8 md:px-16 lg:px-24 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {initialGenres.find((g) => g.id.toString() === selectedGenre)
                  ?.name || 'Movies'}
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
                <MovieGrid items={filteredMovies} type="movie" />
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

