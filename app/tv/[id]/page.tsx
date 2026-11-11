import { MediaHero } from '@/components/MediaHero';
import { WatchProviders } from '@/components/WatchProviders';
import { getTvShowFacts } from '@/lib/media';
import { loadMediaPage } from '@/lib/media-page';

interface TvShowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TvShowDetailPage({ params }: TvShowDetailPageProps) {
  const { id } = await params;
  const { details, watchProviders, country } = await loadMediaPage('tv', id);

  return (
    <div className="min-h-screen bg-black">
      <MediaHero media={details} facts={getTvShowFacts(details)}>
        <WatchProviders byCountry={watchProviders} detectedCountry={country} />
      </MediaHero>
    </div>
  );
}
