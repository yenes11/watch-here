import Image from 'next/image';
import { ArrowDown, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRating, getMediaTitle, hasRating } from '@/lib/media';
import { tmdbImage } from '@/lib/tmdb/image';
import { pickTitleLogo } from '@/lib/tmdb/title-art';
import type { SectionLink } from '@/lib/related';
import type { MediaDetails } from '@/lib/tmdb/types';
import { TitleLogo } from './TitleLogo';

const FACT_SEPARATOR = '  ·  ';

interface MediaHeroProps {
  media: MediaDetails;
  /** Plain-text facts, e.g. year and runtime. Genres are appended. */
  facts: string[];
  /** Jump links to the rows further down the page (series, similar). */
  sectionLinks?: SectionLink[];
  /** Rendered in the main column under the overview (the watch section). */
  children?: React.ReactNode;
}

/** Backdrop, poster, title and synopsis at the top of a detail page. */
export function MediaHero({
  media,
  facts,
  sectionLinks = [],
  children,
}: MediaHeroProps) {
  const title = getMediaTitle(media);
  const logo = pickTitleLogo(media.images?.logos);
  const { backdrop_path, poster_path, tagline, overview, genres } = media;

  const allFacts = genres.length
    ? [...facts, genres.map((genre) => genre.name).join(', ')]
    : facts;

  return (
    <article className="pb-14 md:pb-20">
      {/* Backdrop band: contained, so it can never overlap the content */}
      <div className="relative h-[42svh] min-h-64 md:h-[62vh] md:max-h-[680px] overflow-hidden bg-zinc-950">
        {backdrop_path && (
          <Image
            src={tmdbImage(backdrop_path, 'w1280')}
            alt=""
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/30" />
      </div>

      <div className="relative -mt-24 md:-mt-56 px-page">
        <div className="md:grid md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 lg:gap-14">
          {/* Poster: with a text title, offset by the half-leading so its top
              meets the letters; a logo image already starts at its top edge. */}
          <div className={cn('hidden md:block', !logo && 'md:pt-3 lg:pt-4')}>
            <div className="sticky top-24 aspect-2/3 overflow-hidden bg-zinc-900 ring-1 ring-white/10 shadow-2xl shadow-black">
              {poster_path ? (
                <Image
                  src={tmdbImage(poster_path, 'w500')}
                  alt={`${title} poster`}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film aria-hidden className="size-10 text-zinc-600" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 max-w-5xl">
            <header>
              <h1 className="text-[2rem] leading-tight sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white text-balance">
                <TitleLogo
                  title={title}
                  logo={logo}
                  priority
                  logoClassName="[--logo-max-h:6rem] [--logo-max-w:80%] sm:[--logo-max-h:7rem] lg:[--logo-max-h:9rem] sm:[--logo-max-w:28rem]"
                />
              </h1>
              {allFacts.length > 0 && (
                <p className="mt-3 text-sm md:text-base text-zinc-300">
                  {allFacts.join(FACT_SEPARATOR)}
                </p>
              )}
            </header>

            <Rating voteAverage={media.vote_average} voteCount={media.vote_count} />

            <SectionLinks links={sectionLinks} />

            {(tagline || overview) && (
              <div className="mt-6 max-w-[65ch]">
                {tagline && <p className="text-zinc-400 mb-2">{tagline}</p>}
                {overview && (
                  <p className="text-zinc-200 text-base leading-7">{overview}</p>
                )}
              </div>
            )}

            {children && <div className="mt-12">{children}</div>}
          </div>
        </div>
      </div>
    </article>
  );
}

function Rating({
  voteAverage,
  voteCount,
}: {
  voteAverage: number;
  voteCount: number;
}) {
  if (!hasRating(voteAverage)) return null;

  return (
    <div className="mt-6 flex items-baseline gap-2">
      <span className="text-2xl font-semibold tabular-nums text-white">
        {formatRating(voteAverage)}
      </span>
      <span className="text-sm text-zinc-500">
        / 10 TMDB
        {voteCount > 0 && ` · ${voteCount.toLocaleString('en-US')} votes`}
      </span>
    </div>
  );
}

/** Buttons that scroll down to the series / "More like this" rows. */
function SectionLinks({ links }: { links: SectionLink[] }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="group inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-md border border-zinc-700 bg-black/40 text-sm text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {link.label}
          <span className="tabular-nums text-zinc-500">{link.count}</span>
          <ArrowDown
            aria-hidden
            className="size-3.5 text-zinc-400 transition-transform duration-150 group-hover:translate-y-0.5"
          />
        </a>
      ))}
    </nav>
  );
}
