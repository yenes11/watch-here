import { MediaBrowsePage } from '@/components/MediaBrowsePage';
import { loadBrowsePage } from '@/lib/browse-page';
import { getTopRatedMovies, getTrending } from '@/lib/tmdb/api';

export default async function MoviesPage() {
  const [{ genres, heroItems, popular, genreSections }, trending, topRated] =
    await Promise.all([
      loadBrowsePage('movie'),
      getTrending('movie'),
      getTopRatedMovies(),
    ]);

  return (
    <MediaBrowsePage
      mediaType="movie"
      heading="Movies"
      heroItems={heroItems}
      genres={genres}
      sections={[
        ...genreSections,
        { key: 'trending', title: 'Trending Now', items: trending.results },
        { key: 'top-rated', title: 'Top Rated', items: topRated.results },
        { key: 'popular', title: 'Popular Movies', items: popular },
      ]}
    />
  );
}
