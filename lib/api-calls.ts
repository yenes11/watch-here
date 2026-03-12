interface PopularMoviesResponse {
  results: any[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface PopularTvShowsResponse {
  results: any[];
  page: number;
  total_pages: number;
  total_results: number;
}

export const getPopularMovies = async (
  page: number = 1
): Promise<PopularMoviesResponse> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch popular movies');
  }

  const data = await response.json();
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

export const getPopularTvShows = async (
  page: number = 1
): Promise<PopularTvShowsResponse> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=popularity.desc`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch popular TV shows');
  }

  const data = await response.json();
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

export const getTrendingMovies = async (
  page: number = 1
): Promise<PopularMoviesResponse> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch trending movies');
  }

  const data = await response.json();
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

export const getTopRatedMovies = async (
  page: number = 1
): Promise<PopularMoviesResponse> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch top rated movies');
  }

  const data = await response.json();
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

export const getTrendingTvShows = async (
  page: number = 1
): Promise<PopularTvShowsResponse> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch trending TV shows');
  }

  const data = await response.json();
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

interface SearchResponse {
  results: any[];
  page: number;
  total_pages: number;
  total_results: number;
}

export const searchMulti = async (
  query: string,
  page: number = 1
): Promise<SearchResponse> => {
  if (!query.trim()) {
    return {
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    };
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
      query
    )}&include_adult=false&language=en-US&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      cache: 'no-store', // Don't cache search results
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search');
  }

  const data = await response.json();
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

export const getMovieDetails = async (movieId: number) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }

  return await response.json();
};

export const getMovieWatchProviders = async (movieId: number) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch watch providers');
  }

  const data = await response.json();
  return data.results; // { TR: { flatrate: [...], buy: [...], rent: [...] }, US: {...} }
};

export const getTvShowDetails = async (tvId: number) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${tvId}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch TV show details');
  }

  return await response.json();
};

export const getTvShowWatchProviders = async (tvId: number) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${tvId}/watch/providers`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch watch providers');
  }

  const data = await response.json();
  return data.results; // { TR: { flatrate: [...], buy: [...], rent: [...] }, US: {...} }
};
