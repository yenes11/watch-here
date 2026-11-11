'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, CornerDownLeft, Loader2, Search, Star, X } from 'lucide-react';
import { useMediaSearch } from '@/hooks/useMediaSearch';
import { useScrollActiveOption } from '@/hooks/useScrollActiveOption';
import { cn } from '@/lib/utils';
import {
  MEDIA_TYPE_LABEL,
  formatRating,
  getMediaHref,
  getMediaTitle,
  getReleaseYear,
  hasRating,
} from '@/lib/media';
import { tmdbImage } from '@/lib/tmdb/image';
import type { MediaSearchResult, MediaType } from '@/lib/tmdb/types';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';
import { MediaTypeIcon } from './MediaTypeIcon';

type Filter = 'all' | MediaType;

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
];

const RESULTS_ID = 'search-results';
const SKELETON_ROWS = 6;

const resultId = (index: number) => `search-result-${index}`;
const resultHref = (item: MediaSearchResult) =>
  getMediaHref(item.media_type, item.id);

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/80"
        className={cn(
          'flex flex-col gap-0 p-0 overflow-hidden bg-zinc-950 text-white border-zinc-800 shadow-2xl',
          // Mobile: full screen sheet
          'inset-0 top-0 left-0 translate-x-0 translate-y-0 h-dvh max-w-none rounded-none border-0',
          // Desktop: floating panel near the top
          'sm:inset-auto sm:top-[10vh] sm:left-1/2 sm:-translate-x-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-2xl sm:rounded-lg sm:border',
          'data-[state=open]:zoom-in-100 sm:data-[state=open]:zoom-in-95'
        )}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for movies and TV shows. Use arrow keys to navigate results.
        </DialogDescription>
        {/* Content unmounts when the dialog closes, which resets its state. */}
        <SearchPanel onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  const { results, status } = useMediaSearch(query);
  const trimmed = query.trim();
  const isLoading = status === 'loading';

  // Highlight the first row whenever a new set of results arrives.
  const [prevResults, setPrevResults] = React.useState(results);
  if (results !== prevResults) {
    setPrevResults(results);
    setActiveIndex(0);
  }

  const visible = React.useMemo(
    () =>
      filter === 'all'
        ? results
        : results.filter((item) => item.media_type === filter),
    [results, filter]
  );

  const counts = React.useMemo(() => {
    const tally: Record<Filter, number> = { all: results.length, movie: 0, tv: 0 };
    for (const item of results) tally[item.media_type] += 1;
    return tally;
  }, [results]);

  useScrollActiveOption(listRef, activeIndex);

  const openResult = (item: MediaSearchResult) => {
    onClose();
    router.push(resultHref(item));
  };

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setActiveIndex(0);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const count = visible.length;
    if (count === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + count) % count);
        break;
      case 'Enter': {
        event.preventDefault();
        const item = visible[activeIndex];
        if (item) openResult(item);
        break;
      }
    }
  };

  const showSkeleton = isLoading && results.length === 0;
  const showNoResults = Boolean(trimmed) && !isLoading && visible.length === 0;

  return (
    <>
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 pt-[env(safe-area-inset-top)]">
        {isLoading ? (
          <Loader2 aria-hidden className="size-5 shrink-0 text-zinc-400 animate-spin" />
        ) : (
          <Search aria-hidden className="size-5 shrink-0 text-zinc-400" />
        )}
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Search movies, TV shows…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={RESULTS_ID}
          aria-activedescendant={visible[activeIndex] ? resultId(activeIndex) : undefined}
          // 16px+ font prevents iOS from zooming the page on focus
          className="flex-1 min-w-0 h-14 bg-transparent text-base sm:text-lg text-white placeholder:text-zinc-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden text-sm font-medium text-zinc-300 pl-2"
        >
          Cancel
        </button>
        <kbd className="hidden sm:inline-flex items-center h-6 px-1.5 rounded border border-zinc-700 text-[11px] text-zinc-400 font-sans">
          ESC
        </kbd>
      </div>

      {results.length > 0 && (
        <div className="flex gap-2 px-4 py-3 border-b border-zinc-800/60">
          {FILTERS.map(({ value, label }) => (
            <FilterChip
              key={value}
              label={label}
              count={counts[value]}
              isSelected={filter === value}
              onSelect={() => changeFilter(value)}
            />
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        {showSkeleton && <ResultsSkeleton />}

        {showNoResults && (
          <EmptyState
            title={status === 'error' ? 'Something went wrong' : `No results for “${trimmed}”`}
            subtitle={
              status === 'error'
                ? 'Please try again in a moment.'
                : 'Check the spelling or try a different title.'
            }
          />
        )}

        {!trimmed && (
          <EmptyState
            title="Find a movie or show"
            subtitle="See where it’s streaming in your country."
          />
        )}

        {visible.length > 0 && (
          <ul
            id={RESULTS_ID}
            role="listbox"
            ref={listRef}
            className={cn('p-2', isLoading && 'opacity-60')}
          >
            {visible.map((item, index) => (
              <SearchResultRow
                key={`${item.media_type}-${item.id}`}
                item={item}
                index={index}
                isActive={index === activeIndex}
                onHover={() => setActiveIndex(index)}
                onOpen={() => openResult(item)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-zinc-800 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd> open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>esc</Kbd> close
        </span>
      </div>
    </>
  );
}

interface FilterChipProps {
  label: string;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
}

function FilterChip({ label, count, isSelected, onSelect }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'h-8 px-3 rounded-md text-sm font-medium transition-colors border',
        isSelected
          ? 'bg-white text-black border-white'
          : 'text-zinc-300 border-zinc-700 hover:border-zinc-500'
      )}
    >
      {label}
      <span className={cn('ml-1.5 text-xs', isSelected ? 'text-black/60' : 'text-zinc-500')}>
        {count}
      </span>
    </button>
  );
}

interface SearchResultRowProps {
  item: MediaSearchResult;
  index: number;
  isActive: boolean;
  onHover: () => void;
  onOpen: () => void;
}

function SearchResultRow({ item, index, isActive, onHover, onOpen }: SearchResultRowProps) {
  const year = getReleaseYear(item);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks open a new tab / window as usual.
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    onOpen();
  };

  return (
    <li id={resultId(index)} data-index={index} role="option" aria-selected={isActive}>
      <a
        href={resultHref(item)}
        onClick={onClick}
        onMouseMove={onHover}
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg transition-colors',
          isActive ? 'bg-zinc-800/80' : 'hover:bg-zinc-900'
        )}
      >
        <div className="relative w-12 h-18 shrink-0 overflow-hidden bg-zinc-800">
          {item.poster_path ? (
            <Image
              src={tmdbImage(item.poster_path, 'w92')}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MediaTypeIcon mediaType={item.media_type} className="size-5 text-zinc-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{getMediaTitle(item)}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <MediaTypeIcon mediaType={item.media_type} className="size-3" />
              {MEDIA_TYPE_LABEL[item.media_type]}
            </span>
            {year !== null && (
              <>
                <span aria-hidden>·</span>
                <span>{year}</span>
              </>
            )}
            {hasRating(item.vote_average) && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5 text-zinc-300">
                  <Star aria-hidden className="size-3 fill-zinc-300 stroke-zinc-300" />
                  {formatRating(item.vote_average)}
                </span>
              </>
            )}
          </div>
        </div>

        {isActive ? (
          <CornerDownLeft aria-hidden className="hidden sm:block size-4 text-zinc-400 shrink-0" />
        ) : (
          <ChevronRight aria-hidden className="sm:hidden size-4 text-zinc-600 shrink-0" />
        )}
      </a>
    </li>
  );
}

function ResultsSkeleton() {
  return (
    <div className="p-2" aria-hidden>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3 p-2">
          <Skeleton className="w-12 h-18 shrink-0 rounded-none bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 bg-zinc-800" />
            <Skeleton className="h-3 w-1/3 bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded border border-zinc-700 text-[10px] text-zinc-400 font-sans">
      {children}
    </kbd>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="inline-flex items-center justify-center size-12 rounded-md border border-zinc-800 mb-4">
        <Search aria-hidden className="size-6 text-zinc-500" />
      </div>
      <p className="text-zinc-200 font-medium">{title}</p>
      <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}
