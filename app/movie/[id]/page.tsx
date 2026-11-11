import { MediaHero } from '@/components/MediaHero';
import { WatchProviders } from '@/components/WatchProviders';
import { getMovieFacts } from '@/lib/media';
import { loadMediaPage } from '@/lib/media-page';

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  const { details, watchProviders, country } = await loadMediaPage('movie', id);

  return (
    <div className="min-h-screen bg-black">
      <MediaHero media={details} facts={getMovieFacts(details)}>
        <WatchProviders byCountry={watchProviders} detectedCountry={country} />
      </MediaHero>
    </div>
  );
}
