'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { MediaSummaryOf, MediaType } from '@/lib/tmdb/types';
import { MediaCard } from './MediaCard';

const CAROUSEL_OPTIONS = {
  align: 'start',
  slidesToScroll: 'auto',
  dragFree: true,
  breakpoints: { '(min-width: 768px)': { dragFree: false } },
} as const;

interface MediaRowProps<T extends MediaType> {
  title: string;
  items: MediaSummaryOf<T>[];
  mediaType: T;
}

/** A titled, horizontally scrolling row of posters. */
export function MediaRow<T extends MediaType>({
  title,
  items,
  mediaType,
}: MediaRowProps<T>) {
  const [api, setApi] = React.useState<CarouselApi>();
  const { canScrollPrev, canScrollNext } = useScrollAvailability(api);

  if (items.length === 0) return null;

  return (
    <section className="mb-10 md:mb-14">
      <h2 className="mb-3 md:mb-4 px-page text-lg md:text-xl lg:text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>

      <div className="group/row relative">
        <Carousel setApi={setApi} opts={CAROUSEL_OPTIONS} className="w-full">
          {/* Cards start and end on the page gutter (the item's own left
              padding is the gap, so subtract it from the start margin) */}
          <CarouselContent className="ml-[calc(var(--page-gutter)-var(--card-gap))] mr-(--page-gutter)">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-[38%] sm:basis-1/4 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-(--card-gap) select-none"
              >
                <MediaCard item={item} mediaType={mediaType} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Edge arrows (desktop; touch users swipe). Each sits on a fade at
            its edge and only exists while there is more to scroll that way. */}
        {canScrollPrev && (
          <EdgeArrow
            side="left"
            label={`${title}: previous`}
            onClick={() => api?.scrollPrev()}
          />
        )}
        {canScrollNext && (
          <EdgeArrow
            side="right"
            label={`${title}: next`}
            onClick={() => api?.scrollNext()}
          />
        )}
      </div>
    </section>
  );
}

function useScrollAvailability(api: CarouselApi) {
  const [state, setState] = React.useState({
    canScrollPrev: false,
    canScrollNext: false,
  });

  React.useEffect(() => {
    if (!api) return;

    const update = () =>
      setState({
        canScrollPrev: api.canScrollPrev(),
        canScrollNext: api.canScrollNext(),
      });

    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);

  return state;
}

interface EdgeArrowProps {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
}

function EdgeArrow({ side, label, onClick }: EdgeArrowProps) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group/arrow absolute inset-y-0 z-10 hidden md:flex items-center w-16 lg:w-20 text-white focus-visible:outline-none',
        'from-black via-black/70 to-transparent',
        side === 'left'
          ? 'left-0 justify-start pl-2 lg:pl-3 bg-linear-to-r'
          : 'right-0 justify-end pr-2 lg:pr-3 bg-linear-to-l'
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={2.5}
        className={cn(
          'size-9 transition-[opacity,scale] duration-150 ease-out',
          // Revealed on row hover / keyboard focus; always shown on touch
          'opacity-0 group-hover/row:opacity-100 group-focus-visible/arrow:opacity-100 pointer-coarse:opacity-100',
          'group-hover/arrow:scale-110 group-active/arrow:scale-95'
        )}
      />
    </button>
  );
}
