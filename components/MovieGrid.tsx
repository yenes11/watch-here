'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Film, Tv } from 'lucide-react';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface MovieGridProps {
  items: MediaItem[];
  type?: 'movie' | 'tv';
}

export function MovieGrid({ items, type = 'movie' }: MovieGridProps) {
  const getMediaTitle = (item: MediaItem) =>
    item.title || item.name || 'Untitled';
  const getMediaDate = (item: MediaItem) =>
    item.release_date || item.first_air_date;
  const getMediaPath = (id: number) => `/${type}/${id}`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {items.map((item) => (
        <Link key={item.id} href={getMediaPath(item.id)}>
          <div className="group relative aspect-2/3 overflow-hidden rounded-md bg-zinc-900 transition-transform duration-300 hover:z-10">
            <Image
              src={
                item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : '/placeholder-movie.jpg'
              }
              alt={getMediaTitle(item)}
              fill
              className="object-cover transition-all duration-300 group-hover:opacity-80 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
            />

            {/* Gradient Overlay on Hover */}
            <div className="absolute w-full inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Info on Hover */}
            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                {getMediaTitle(item)}
              </h3>
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>
                  {getMediaDate(item)
                    ? new Date(getMediaDate(item)!).getFullYear()
                    : 'N/A'}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{item.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

