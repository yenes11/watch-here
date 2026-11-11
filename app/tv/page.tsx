import { MediaBrowsePage } from '@/components/MediaBrowsePage';
import { loadBrowsePage } from '@/lib/browse-page';
import { getTrending } from '@/lib/tmdb/api';

export default async function TvShowsPage() {
  const [{ genres, heroItems, popular, genreSections }, trending] =
    await Promise.all([loadBrowsePage('tv'), getTrending('tv')]);

  return (
    <MediaBrowsePage
      mediaType="tv"
      heading="TV Shows"
      heroItems={heroItems}
      genres={genres}
      sections={[
        ...genreSections,
        { key: 'trending', title: 'Trending Now', items: trending.results },
        { key: 'popular', title: 'Popular TV Shows', items: popular },
      ]}
    />
  );
}
