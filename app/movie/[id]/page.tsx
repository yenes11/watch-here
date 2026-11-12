import { MediaHero } from '@/components/MediaHero';
import { RelatedTitles } from '@/components/RelatedTitles';
import { WatchProviders } from '@/components/WatchProviders';
import { getMovieFacts } from '@/lib/media';
import { loadMediaPage } from '@/lib/media-page';
import { getRelatedSectionLinks } from '@/lib/related';

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  const { details, watchProviders, country, related } = await loadMediaPage('movie', id);

  return (
    <div className="min-h-screen bg-black">
      <MediaHero
        media={details}
        sectionLinks={getRelatedSectionLinks(related)}
        facts={getMovieFacts(details)}>
        <WatchProviders byCountry={watchProviders} detectedCountry={country} />
      </MediaHero>
      <RelatedTitles mediaType="movie" related={related} />
    </div>
  );
}
