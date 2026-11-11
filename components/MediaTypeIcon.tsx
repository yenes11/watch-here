import { Film, Tv, type LucideProps } from 'lucide-react';
import type { MediaType } from '@/lib/tmdb/types';

const ICONS = { movie: Film, tv: Tv } as const;

interface MediaTypeIconProps extends LucideProps {
  mediaType: MediaType;
}

export function MediaTypeIcon({ mediaType, ...props }: MediaTypeIconProps) {
  const Icon = ICONS[mediaType];
  return <Icon aria-hidden {...props} />;
}
