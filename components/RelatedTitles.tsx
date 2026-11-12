import {
  SERIES_SECTION_ID,
  SIMILAR_SECTION_ID,
  type RelatedTitles as RelatedTitlesData,
} from '@/lib/related';
import type { MediaType } from '@/lib/tmdb/types';
import { MediaRow } from './MediaRow';

interface RelatedTitlesProps<T extends MediaType> {
  mediaType: T;
  related: RelatedTitlesData<T>;
}

/** Rows under a detail page: the rest of the series and "More like this". */
export function RelatedTitles<T extends MediaType>({
  mediaType,
  related: { series, similar },
}: RelatedTitlesProps<T>) {
  if (!series && similar.length === 0) return null;

  return (
    <div className="pb-6">
      {series && (
        <MediaRow
          id={SERIES_SECTION_ID}
          title={series.name}
          items={series.items}
          mediaType="movie"
        />
      )}
      <MediaRow
        id={SIMILAR_SECTION_ID}
        title="More like this"
        items={similar}
        mediaType={mediaType}
      />
    </div>
  );
}
