import Image from 'next/image';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb/image';
import type { LogoImage } from '@/lib/tmdb/types';

/** Matches the `w500` TMDB size requested below. */
const RENDER_WIDTH = 500;

interface TitleLogoProps {
  title: string;
  logo?: LogoImage | null;
  /** Sets --logo-max-h and --logo-max-w (per breakpoint) for the logo. */
  logoClassName?: string;
  /** Typography for the text fallback. */
  textClassName?: string;
  priority?: boolean;
}

/**
 * Renders the title as TMDB's official logo artwork when one exists,
 * otherwise as text. The parent supplies the heading element.
 */
export function TitleLogo({
  title,
  logo,
  logoClassName,
  textClassName,
  priority,
}: TitleLogoProps) {
  if (!logo) {
    return <span className={textClassName}>{title}</span>;
  }

  const aspectRatio = logo.width / logo.height;

  return (
    <Image
      src={tmdbImage(logo.file_path, 'w500')}
      alt={title}
      width={RENDER_WIDTH}
      height={Math.round(RENDER_WIDTH / aspectRatio)}
      priority={priority}
      // Width is derived from the aspect ratio so the logo fills whichever
      // limit it hits first: wide logos stop at --logo-max-w, tall ones at
      // --logo-max-h. (w-auto would depend on the srcset file's density.)
      style={{
        width: `min(var(--logo-max-w), calc(var(--logo-max-h) * ${aspectRatio}))`,
      }}
      className={cn('block h-auto', logoClassName)}
      sizes="(max-width: 768px) 80vw, 448px"
    />
  );
}
