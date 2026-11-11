'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { MapPin } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import {
  formatRating,
  getMediaHref,
  getMediaTitle,
  getReleaseYear,
  hasRating,
} from '@/lib/media';
import { tmdbImage } from '@/lib/tmdb/image';
import type {
  MediaSummaryOf,
  MediaType,
  TitleArt,
} from '@/lib/tmdb/types';
import { TitleLogo } from './TitleLogo';

const AUTOPLAY_DELAY_MS = 5000;
const CAROUSEL_OPTIONS = { align: 'start', loop: true, duration: 35 } as const;

interface HeroCarouselProps<T extends MediaType> {
  items: MediaSummaryOf<T>[];
  mediaType: T;
  /** Optional TMDB title logos + textless posters keyed by id. */
  art?: Record<number, TitleArt>;
}

/**
 * Full-bleed, auto-advancing showcase. Embla drives the timing and swipe
 * gestures through an invisible track; the visible slides cross-fade.
 */
export function HeroCarousel<T extends MediaType>({
  items,
  mediaType,
  art = {},
}: HeroCarouselProps<T>) {
  const [api, setApi] = React.useState<CarouselApi>();
  const current = useSelectedSlide(api);
  // Lazy initialiser: the plugin is created once, not on every render.
  const [autoplay] = React.useState(() =>
    Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false })
  );

  return (
    <div className="relative w-full h-[70svh] min-h-[440px] md:h-[75vh]">
      <Carousel
        setApi={setApi}
        plugins={[autoplay]}
        opts={CAROUSEL_OPTIONS}
        className="w-full h-full"
      >
        <div className="relative w-full h-full overflow-hidden">
          {items.map((item, index) => (
            <HeroSlide
              key={item.id}
              item={item}
              mediaType={mediaType}
              art={art[item.id]}
              isActive={index === current}
              isFirst={index === 0}
            />
          ))}
        </div>

        <CarouselContent className="ml-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-0 basis-full">
              <div className="w-full h-px" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current}
            className={cn(
              'h-1.5 md:h-2 rounded-full transition-all',
              index === current
                ? 'w-6 md:w-8 bg-white'
                : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/75'
            )}
          />
        ))}
      </div>
    </div>
  );
}

function useSelectedSlide(api: CarouselApi): number {
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return selected;
}

/**
 * Phones get portrait art. Regular posters have the title baked in, which
 * would repeat the logo, so prefer a textless poster; with a logo but no
 * textless poster, use the backdrop instead.
 */
function pickMobileArt(
  { poster_path, backdrop_path }: { poster_path: string | null; backdrop_path: string | null },
  art: TitleArt | undefined
): string | null {
  if (art?.textlessPoster) return art.textlessPoster;
  if (art?.logo && backdrop_path) return backdrop_path;
  return poster_path ?? backdrop_path;
}

interface HeroSlideProps<T extends MediaType> {
  item: MediaSummaryOf<T>;
  mediaType: T;
  art: TitleArt | undefined;
  isActive: boolean;
  isFirst: boolean;
}

function HeroSlide<T extends MediaType>({
  item,
  mediaType,
  art,
  isActive,
  isFirst,
}: HeroSlideProps<T>) {
  const href = getMediaHref(mediaType, item.id);
  const mobileArt = pickMobileArt(item, art);
  const desktopArt = item.backdrop_path ?? item.poster_path;
  // Only the visible slide's links are reachable by keyboard.
  const tabIndex = isActive ? 0 : -1;

  const year = getReleaseYear(item);
  const facts = [
    year === null ? null : String(year),
    hasRating(item.vote_average) ? `${formatRating(item.vote_average)} / 10` : null,
  ].filter((fact) => fact !== null);

  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        'absolute inset-0 transition-opacity duration-1500 ease-in-out',
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      )}
    >
      {mobileArt && (
        <Image
          src={tmdbImage(mobileArt, 'w780')}
          alt=""
          fill
          priority={isFirst}
          className="object-cover object-top md:hidden"
          sizes="100vw"
        />
      )}
      {desktopArt && (
        <Image
          src={tmdbImage(desktopArt, 'original')}
          alt=""
          fill
          priority={isFirst}
          className="object-cover object-top hidden md:block"
          sizes="100vw"
        />
      )}

      {/* Legibility: bottom fade into the page, top for the header,
          and a left fade behind the text column on wide screens */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 md:h-1/2 bg-linear-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent" />
      <div className="absolute inset-y-0 left-0 hidden md:block w-2/3 bg-linear-to-r from-black/75 via-black/30 to-transparent" />

      {/* Whole slide opens the title (mouse/touch); keyboard users get the
          real links below instead */}
      <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 z-10" />

      <div className="absolute bottom-0 left-0 right-0 px-page pb-14 md:pb-20 z-20 pointer-events-none">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4 text-balance">
            <Link
              href={href}
              tabIndex={tabIndex}
              className="pointer-events-auto inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
            >
              <TitleLogo
                title={getMediaTitle(item)}
                logo={art?.logo}
                priority={isFirst}
                logoClassName="[--logo-max-h:6.5rem] [--logo-max-w:80%] sm:[--logo-max-h:7rem] lg:[--logo-max-h:9rem] sm:[--logo-max-w:28rem]"
              />
            </Link>
          </h2>
          <p className="mb-3 text-sm md:text-base text-zinc-300">
            {facts.join('  ·  ')}
          </p>
          <p className="text-zinc-200 text-sm md:text-base leading-relaxed mb-6 line-clamp-2 md:line-clamp-3">
            {item.overview}
          </p>
          <Link
            href={`${href}#watch-providers`}
            tabIndex={tabIndex}
            className="pointer-events-auto h-11 px-5 inline-flex items-center gap-2 bg-white text-black rounded-md font-semibold hover:bg-zinc-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MapPin aria-hidden className="size-4" />
            Where to watch
          </Link>
        </div>
      </div>
    </div>
  );
}
