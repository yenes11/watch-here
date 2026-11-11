import type { MediaSummaryOf, MediaType } from '@/lib/tmdb/types';
import { MediaCard } from './MediaCard';

interface MediaGridProps<T extends MediaType> {
  items: MediaSummaryOf<T>[];
  mediaType: T;
}

export function MediaGrid<T extends MediaType>({
  items,
  mediaType,
}: MediaGridProps<T>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-5 md:gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} mediaType={mediaType} />
      ))}
    </div>
  );
}
