import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import {
  formatRating,
  getMediaHref,
  getMediaTitle,
  getReleaseYear,
  hasRating,
} from '@/lib/media';
import { tmdbImage } from '@/lib/tmdb/image';
import type { MediaSummaryOf, MediaType } from '@/lib/tmdb/types';
import { MediaTypeIcon } from './MediaTypeIcon';

const DEFAULT_SIZES =
  '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 20vw, 16vw';

interface MediaCardProps<T extends MediaType> {
  item: MediaSummaryOf<T>;
  mediaType: T;
  sizes?: string;
}

export function MediaCard<T extends MediaType>({
  item,
  mediaType,
  sizes = DEFAULT_SIZES,
}: MediaCardProps<T>) {
  const title = getMediaTitle(item);
  const year = getReleaseYear(item);
  const rating = hasRating(item.vote_average) ? item.vote_average : null;

  return (
    <Link
      href={getMediaHref(mediaType, item.id)}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <div className="relative aspect-2/3 overflow-hidden bg-zinc-900">
        {item.poster_path ? (
          <Image
            src={tmdbImage(item.poster_path, 'w342')}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 md:group-hover:scale-105"
            sizes={sizes}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center">
            <MediaTypeIcon mediaType={mediaType} className="size-8 text-zinc-600" />
            <span className="text-xs text-zinc-500 line-clamp-3">{title}</span>
          </div>
        )}

        {/* Hover details (desktop only) */}
        <div className="hidden md:flex absolute inset-0 flex-col justify-end p-3 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {title}
          </h3>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-300">
            {year}
            {year !== null && rating !== null && <span aria-hidden>·</span>}
            {rating !== null && (
              <span className="inline-flex items-center gap-0.5">
                <Star aria-hidden className="size-3 fill-zinc-300 stroke-zinc-300" />
                {formatRating(rating)}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Caption (touch / small screens) */}
      <div className="md:hidden pt-2">
        <h3 className="text-white text-sm font-medium leading-snug line-clamp-1">
          {title}
        </h3>
        {year !== null && <span className="text-xs text-zinc-500">{year}</span>}
      </div>
    </Link>
  );
}
