'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '@/lib/utils';
import type { Genre } from '@/lib/tmdb/types';

/** Radix Select needs a non-empty string value for the "no filter" option. */
const ALL_GENRES = 'all';

const ITEM_CLASS = 'text-white focus:text-white focus:bg-zinc-800';

interface GenreSelectProps {
  genres: Genre[];
  /** `null` means all genres. */
  value: number | null;
  onChange: (genreId: number | null) => void;
  className?: string;
}

export function GenreSelect({
  genres,
  value,
  onChange,
  className,
}: GenreSelectProps) {
  const handleValueChange = (next: string) =>
    onChange(next === ALL_GENRES ? null : Number(next));

  return (
    <Select
      value={value === null ? ALL_GENRES : String(value)}
      onValueChange={handleValueChange}
    >
      <SelectTrigger
        aria-label="Filter by genre"
        className={cn(
          'w-40 sm:w-[200px] bg-zinc-900 border-zinc-700 text-white [&>span]:text-white',
          className
        )}
      >
        <SelectValue placeholder="Filter by genre" />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800 max-h-80">
        <SelectItem value={ALL_GENRES} className={ITEM_CLASS}>
          All Genres
        </SelectItem>
        {genres.map((genre) => (
          <SelectItem key={genre.id} value={String(genre.id)} className={ITEM_CLASS}>
            {genre.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
